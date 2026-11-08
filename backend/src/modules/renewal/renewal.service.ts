import * as XLSX from "xlsx";
import { query, run } from "../../database/db.js";

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
          cohort, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      throw new Error("Không tìm thấy giao dịch gia hạn");
    }

    await run(
      "UPDATE renewals SET status = ?, failure_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, failureReason || null, id]
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
}

