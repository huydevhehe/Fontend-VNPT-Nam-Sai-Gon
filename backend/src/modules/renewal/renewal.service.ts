import * as XLSX from "xlsx";
import { query, run } from "../../database/db.js";
import { HttpError } from "../auth/auth.service.js";
import { parseExcelDate } from "../../utils/excel-date.js";
import { todayVn } from "../../utils/date-vn.js";

export interface RenewalRow {
  id: string;
  transaction_code: string;
  subscriber_code: string;
  customer_name: string;
  payment_code: string;
  installation_address: string;
  staff_name: string;
  term_amount: number;
  duration_months: number;
  cohort: string;
  status: string;
  failure_reason?: string;
  expiry_date?: string | null;
  renewed_at?: string | null;
}

const RENEWAL_COMPLETED_STATUS = "Hoàn thành";

/** Bí danh cột "ngày hết hạn" gặp trong file Excel, sau khi bỏ dấu + hạ thường. */
const EXPIRY_COLUMN_ALIASES = ["ngay kt", "ngay ket thuc", "ngay het han", "ngay ktdc", "ngay_kt"];

function stripAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/** Tìm giá trị cột "ngày hết hạn" trong 1 dòng Excel theo danh sách bí danh (so khớp đã bỏ dấu + hạ thường). */
function findExpiryRawValue(row: Record<string, unknown>): unknown {
  for (const key of Object.keys(row)) {
    const normalizedKey = stripAccents(key.trim());
    if (EXPIRY_COLUMN_ALIASES.includes(normalizedKey)) {
      return row[key];
    }
  }
  return undefined;
}

export class RenewalService {
  async getAll(filters: { cohort?: string; staff?: string; status?: string }) {
    let sql = "SELECT * FROM renewals WHERE 1=1";
    const params: any[] = [];

    if (filters.cohort && filters.cohort !== "ALL") {
      sql += " AND cohort = ?";
      params.push(filters.cohort);
    }
    if (filters.staff && filters.staff !== "all") {
      sql += " AND staff_name = ?";
      params.push(filters.staff);
    }
    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    sql += " ORDER BY created_at DESC";
    return query<RenewalRow>(sql, params);
  }

  async getById(id: string): Promise<RenewalRow | null> {
    const rows = await query<RenewalRow>("SELECT * FROM renewals WHERE id = ?", [id]);
    return rows[0] ?? null;
  }

  async importExcel(fileBuffer: Buffer, cohort: string = "THÁNG T", operator: string = "Admin") {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    
    // Look for 'GIA HẠN' sheet
    let sheetName = workbook.SheetNames.find((s) =>
      s.toUpperCase().includes("GIA HẠN") || s.toUpperCase().includes("GIA HAN")
    ) || workbook.SheetNames[1] || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    let importedCount = 0;
    let duplicateCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const staffName = row["TÊN NHÂN VIÊN CHĂM"] || row["TEN_NHAN_VIEN"] || "";
      const paymentCode = String(row["MA_THANH TOÁN"] || row["MA_TT"] || "");
      const subscriberCode = String(row["MA_THUÊ BAO"] || row["MA_TB"] || "");
      const customerName = row["TEN_THUÊ BAO"] || row["TEN_KH"] || "";
      const address = row["DIACHI_LD"] || row["ĐỊA CHỈ"] || "";
      
      // Match transaction code
      let transactionCode = String(row["MÃ GIAO DỊCH "] || row["MÃ GIAO DỊCH"] || row["MA_GD"] || "").trim();
      if (!transactionCode) {
        transactionCode = `GD-${Date.now()}-${i}`;
      }

      const termAmount = parseFloat(row["THÁNG T"] || row["SO_TIEN"] || 0) || 0;
      const expiryDate = parseExcelDate(findExpiryRawValue(row));

      if (!subscriberCode || !customerName) {
        skippedCount++;
        errors.push(`Dòng ${i + 2}: Thiếu thông tin thuê bao hoặc khách hàng`);
        continue;
      }

      // Check duplicate transaction code (PRD GH-05)
      const existing = await query("SELECT id FROM renewals WHERE transaction_code = ?", [transactionCode]);
      if (existing.length > 0) {
        duplicateCount++;
        errors.push(`Dòng ${i + 2}: Trùng mã giao dịch ${transactionCode} đã tồn tại`);
        continue;
      }

      const id = `RN-${Date.now()}-${i}`;
      await run(
        `INSERT INTO renewals (
          id, transaction_code, subscriber_code, customer_name, payment_code,
          installation_address, staff_name, term_amount, duration_months,
          cohort, status, expiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          transactionCode,
          subscriberCode,
          customerName,
          paymentCode,
          address,
          staffName,
          termAmount,
          12,
          cohort,
          "Chưa xử lý",
          expiryDate,
        ]
      );
      importedCount++;
    }

    // Audit log
    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [
        `LOG-${Date.now()}`,
        operator,
        "Import Excel Gia Hạn",
        `Đã nhập ${importedCount} bản ghi gia hạn ${cohort}. Phát hiện ${duplicateCount} mã giao dịch trùng. Bỏ qua ${skippedCount} dòng lỗi.`,
      ]
    );

    return {
      sheetName,
      totalProcessed: rawRows.length,
      importedCount,
      duplicateCount,
      skippedCount,
      errors,
    };
  }

  async updateStatus(id: string, status: string, failureReason?: string, operator: string = "Admin") {
    const existing = await query<RenewalRow>("SELECT * FROM renewals WHERE id = ?", [id]);
    if (!existing.length) {
      throw new HttpError(404, "Không tìm thấy giao dịch gia hạn");
    }

    // Chuyển SANG "Hoàn thành" và chưa có renewed_at (dữ liệu cũ hoặc lần đầu
    // xử lý) → ghi nhận ngày gia hạn thành công là hôm nay (giờ VN). Chuyển
    // RA KHỎI "Hoàn thành" → xoá renewed_at (không còn coi là đã gia hạn).
    let renewedAt = existing[0].renewed_at ?? null;
    if (status === RENEWAL_COMPLETED_STATUS && !renewedAt) {
      renewedAt = todayVn();
    } else if (status !== RENEWAL_COMPLETED_STATUS) {
      renewedAt = null;
    }

    await run(
      "UPDATE renewals SET status = ?, failure_reason = ?, renewed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, failureReason || null, renewedAt, id]
    );

    await run(
      'INSERT INTO audit_logs (id, "user", action, details) VALUES (?, ?, ?, ?)',
      [
        `LOG-${Date.now()}`,
        operator,
        "Cập nhật trạng thái Gia hạn",
        `Giao dịch ${existing[0].transaction_code} (${existing[0].customer_name}) chuyển trạng thái -> ${status}${failureReason ? ` (Lý do: ${failureReason})` : ""}`,
      ]
    );

    return { success: true, message: "Cập nhật trạng thái thành công" };
  }

  /** Admin sửa tay ngày hết hạn / ngày gia hạn thành công. */
  async updateDates(
    id: string,
    input: { expiryDate?: string | null; renewedAt?: string | null }
  ): Promise<RenewalRow> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new HttpError(404, "Không tìm thấy giao dịch gia hạn");
    }

    const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
    let expiryDate = existing.expiry_date ?? null;
    if ("expiryDate" in input) {
      if (input.expiryDate === null || input.expiryDate === undefined || input.expiryDate === "") {
        expiryDate = null;
      } else if (ISO_DATE_PATTERN.test(input.expiryDate)) {
        expiryDate = input.expiryDate;
      } else {
        throw new HttpError(400, "Ngày hết hạn phải theo định dạng YYYY-MM-DD");
      }
    }

    let renewedAt = existing.renewed_at ?? null;
    if ("renewedAt" in input) {
      if (input.renewedAt === null || input.renewedAt === undefined || input.renewedAt === "") {
        renewedAt = null;
      } else if (ISO_DATE_PATTERN.test(input.renewedAt)) {
        renewedAt = input.renewedAt;
      } else {
        throw new HttpError(400, "Ngày gia hạn phải theo định dạng YYYY-MM-DD");
      }
    }

    await run(
      "UPDATE renewals SET expiry_date = ?, renewed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [expiryDate, renewedAt, id]
    );

    const updated = await this.getById(id);
    if (!updated) {
      throw new HttpError(500, "Không thể cập nhật ngày gia hạn");
    }
    return updated;
  }
}

