import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { query, run } from "../../database/db.js";
import { ContractRow } from "./contract.service.js";
import { numberToVietnameseWords } from "../../utils/vn-number-words.js";
import { SettingsService } from "../settings/settings.service.js";

export interface PaymentRequestData {
  SoVanBan: string;
  Ngay: string;
  Thang: string;
  Nam: string;
  TenDichVu: string;
  TenKhachHang: string;
  MaSoThue: string;
  SoHopDong: string;
  GoiCuoc: string;
  MaTB: string;
  HinhThucThanhToan: string;
  GiaTriHopDong: string;
  SoTienBangChu: string;
  MaGD: string;
  DonViThuHuong: string;
  SoTaiKhoan: string;
  NganHang: string;
  TenVietTatAM: string;
  TenAM: string;
  SdtAM: string;
  EmailAM: string;
  NguoiKy: string;
  missingFields: string[];
}

export interface PaymentExportRecord {
  id: string;
  contractId: string;
  docNumber: string;
  exportedBy: string | null;
  exportedAt: string;
  transactionCode?: string;
  customerName?: string;
}

function deriveShortName(fullName: string): string {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1].toUpperCase();
}

export class PaymentRequestService {
  private templatePath: string;

  constructor() {
    this.templatePath = path.resolve(process.cwd(), "templates/de-nghi-thanh-toan.docx");
  }

  async suggestNextDocNumber(year: number): Promise<string> {
    const yearStr = `${year}`;
    const rows = await query<{ doc_number: string }>(
      `SELECT doc_number FROM payment_request_exports WHERE exported_at LIKE ?`,
      [`${yearStr}%`]
    );

    let maxNum = 0;
    for (const r of rows) {
      const parsed = parseInt(r.doc_number, 10);
      if (!Number.isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }

    return maxNum > 0 ? String(maxNum + 1) : "";
  }

  async buildData(
    contractId: string,
    docNumber: string,
    now: Date = new Date()
  ): Promise<PaymentRequestData> {
    const contractRows = await query<ContractRow>("SELECT * FROM contracts WHERE id = ?", [contractId]);
    if (!contractRows.length) {
      throw new Error("Không tìm thấy Đơn hàng");
    }
    const contract = contractRows[0];

    const missingFields: string[] = [];

    // Customer info
    let taxCode = contract.tax_code || "";
    let customerName = contract.customer_name || "";
    if (contract.customer_id) {
      const custRows = await query<{ identity_code: string | null; name: string }>(
        "SELECT identity_code, name FROM customers WHERE id = ?",
        [contract.customer_id]
      );
      if (custRows.length) {
        if (!taxCode && custRows[0].identity_code) taxCode = custRows[0].identity_code;
        if (!customerName) customerName = custRows[0].name;
      }
    }
    if (!taxCode) missingFields.push("Mã số thuế");
    if (!customerName) missingFields.push("Tên khách hàng");

    // AM info
    let amName = contract.am_staff || "";
    let amPhone = "";
    let amEmail = "";
    let amHrm = "";
    let amShort = "";

    if (amName) {
      const staffRows = await query<{
        phone: string | null;
        email: string | null;
        hrm_code: string | null;
        short_name: string | null;
      }>("SELECT phone, email, hrm_code, short_name FROM staff WHERE name = ?", [amName]);
      if (staffRows.length) {
        amPhone = staffRows[0].phone || "";
        amEmail = staffRows[0].email || "";
        amHrm = staffRows[0].hrm_code || "";
        amShort = staffRows[0].short_name || "";
      }
    } else {
      missingFields.push("AM tiếp thị");
    }

    if (!amShort) {
      amShort = deriveShortName(amName);
    }

    if (!contract.package_name) {
      missingFields.push("Gói cước");
    }

    // Subscriber codes
    let subscriberCodes: string[] = [];
    try {
      subscriberCodes = JSON.parse(contract.subscriber_codes);
      if (!Array.isArray(subscriberCodes)) subscriberCodes = [];
    } catch {
      subscriberCodes = [];
    }
    const maTbStr = subscriberCodes.join(", ");

    // Contract number
    let soHopDong = contract.contract_number || "";
    if (!soHopDong) {
      let datePart = "";
      if (contract.signed_date) {
        datePart = contract.signed_date.replace(/-/g, "");
      } else {
        const d = new Date(contract.created_at || now);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        datePart = `${yyyy}${mm}${dd}`;
      }
      soHopDong = `${datePart}/${taxCode}/VNPT.NSG/${amHrm}`;
    }

    // Bank & Signer settings
    const config = await SettingsService.getPaymentConfig();

    // Date
    const ngay = String(now.getDate()).padStart(2, "0");
    const thang = String(now.getMonth() + 1).padStart(2, "0");
    const nam = String(now.getFullYear());

    // Amount
    const giaTri = Number(contract.total_value || 0);
    const giaTriHopDongStr = `${giaTri.toLocaleString("vi-VN")} đồng`;
    const soTienBangChu = numberToVietnameseWords(giaTri);

    return {
      SoVanBan: docNumber,
      Ngay: ngay,
      Thang: thang,
      Nam: nam,
      TenDichVu: contract.service_name || "Dịch vụ Viễn thông - CNTT",
      TenKhachHang: customerName,
      MaSoThue: taxCode,
      SoHopDong: soHopDong,
      GoiCuoc: contract.package_name || "",
      MaTB: maTbStr,
      HinhThucThanhToan: contract.payment_method || "Trả trước",
      GiaTriHopDong: giaTriHopDongStr,
      SoTienBangChu: soTienBangChu,
      MaGD: contract.transaction_code,
      DonViThuHuong: config.paymentBeneficiary,
      SoTaiKhoan: config.paymentAccountNo,
      NganHang: config.paymentBankName,
      TenVietTatAM: amShort,
      TenAM: amName,
      SdtAM: amPhone,
      EmailAM: amEmail,
      NguoiKy: config.paymentSignerName,
      missingFields,
    };
  }

  render(data: PaymentRequestData): Buffer {
    if (!fs.existsSync(this.templatePath)) {
      throw new Error(`Không tìm thấy file mẫu Word tại: ${this.templatePath}`);
    }
    const content = fs.readFileSync(this.templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });

    doc.render(data);
    return doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
  }

  async recordExport(
    contractId: string,
    docNumber: string,
    exportedBy: string
  ): Promise<void> {
    const id = `EXP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run(
      `INSERT INTO payment_request_exports (id, contract_id, doc_number, exported_by, exported_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, contractId, docNumber, exportedBy, new Date().toISOString()]
    );
  }

  async listExports(): Promise<PaymentExportRecord[]> {
    const rows = await query<{
      id: string;
      contract_id: string;
      doc_number: string;
      exported_by: string | null;
      exported_at: string;
      transaction_code: string | null;
      customer_name: string | null;
    }>(
      `SELECT e.*, c.transaction_code, c.customer_name
       FROM payment_request_exports e
       LEFT JOIN contracts c ON c.id = e.contract_id
       ORDER BY e.exported_at DESC`
    );

    return rows.map((r) => ({
      id: r.id,
      contractId: r.contract_id,
      docNumber: r.doc_number,
      exportedBy: r.exported_by,
      exportedAt: r.exported_at,
      transactionCode: r.transaction_code || undefined,
      customerName: r.customer_name || undefined,
    }));
  }
}
