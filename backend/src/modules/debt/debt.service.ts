import * as XLSX from "xlsx";
import { query, run } from "../../database/db.js";

export interface DebtRow {
  id: string;
  staff_name: string;
  service_group: string;
  payment_code: string;
  subscriber_code: string;
  customer_name: string;
  installation_address: string;
  immediate_debt: number;
  cumulative_debt: number;
  collected_amount: number;
  status: string;
  document_ref?: string;
  month: string;
}

export class DebtService {
  async getAll(filters: { month?: string; staff?: string; status?: string }) {
    let sql = "SELECT * FROM debts WHERE 1=1";
    const params: any[] = [];

    if (filters.month) {
      sql += " AND month = ?";
      params.push(filters.month);
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
    return query<DebtRow>(sql, params);
  }

  async importExcel(fileBuffer: Buffer, month: string, operator: string = "Admin") {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    
    // Prioritize sheet named 'THU NGAY , LŨY KẾ' or use the first sheet
    let sheetName = workbook.SheetNames.find((s) =>
      s.toUpperCase().includes("THU NGAY")
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

    let importedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      // Normalize column names
      const staffName = row["TÊN NHÂN VIÊN CHĂM"] || row["TEN_NHAN_VIEN"] || "";
      const serviceGroup = row["NHOM_DV"] || row["DỊCH VỤ"] || "Internet Fiber";
      const paymentCode = String(row["MA_THANH TOÁN"] || row["MA_TT"] || "");
      const subscriberCode = String(row["MA_THUÊ BAO"] || row["MA_TB"] || "");
      const customerName = row["TEN_THUÊ BAO"] || row["TEN_KH"] || "";
      const address = row["DIACHI_LD"] || row["ĐỊA CHỈ"] || "";
      const immediateDebt = parseFloat(row["CONNO_THUNGAY"] || 0) || 0;
      const cumulativeDebt = parseFloat(row["CONNO_LUYKE"] || 0) || 0;

      if (!subscriberCode || !customerName) {
        skippedCount++;
        errors.push(`Dòng ${i + 2}: Thiếu mã thuê bao hoặc tên khách hàng`);
        continue;
      }

      const id = `DEBT-${Date.now()}-${i}`;
      await run(
        `INSERT INTO debts (
          id, staff_name, service_group, payment_code, subscriber_code,
          customer_name, installation_address, immediate_debt, cumulative_debt,
          status, month
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          staffName,
          serviceGroup,
          paymentCode,
          subscriberCode,
          customerName,
          address,
          immediateDebt,
          cumulativeDebt,
          "Nợ cước",
          month,
        ]
      );
      importedCount++;
    }

    // Record audit log
    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Import Excel Nợ CSKH",
        `Đã nhập ${importedCount} bản ghi nợ tháng ${month}. Bỏ qua ${skippedCount} dòng lỗi.`,
      ]
    );

    return {
      sheetName,
      totalProcessed: rawRows.length,
      importedCount,
      skippedCount,
      errors,
    };
  }

  async gachNo(id: string, amount: number, documentRef?: string, operator: string = "Admin") {
    if (Number.isNaN(amount) || amount < 0) {
      throw new Error("Số tiền thu được không được âm");
    }

    const existing = await query<DebtRow>("SELECT * FROM debts WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy bản ghi công nợ");
    }

    await run(
      "UPDATE debts SET status = 'Đã gạch nợ', collected_amount = ?, document_ref = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [amount, documentRef || "UNC-TRỰC TIẾP", id]
    );

    await run(
      "INSERT INTO audit_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
      [
        `LOG-${Date.now()}`,
        operator,
        "Gạch nợ cước",
        `Gạch nợ cho thuê bao ${existing[0].subscriber_code} (${existing[0].customer_name}) số tiền ${amount.toLocaleString("vi-VN")} ₫`,
      ]
    );

    return { success: true, message: "Gạch nợ thành công" };
  }
}

