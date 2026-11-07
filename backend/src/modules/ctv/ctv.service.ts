import { query } from "../../database/db.js";
import { ROLES } from "../../constants/org.js";
import { HttpError } from "../auth/auth.service.js";

const LEAD_STATUS_SUCCESS = "Chốt thành công";
const LEAD_STATUS_FAILED = "Thất bại";
const DEPLOYMENT_DONE = "Hoàn tất";
const COMMISSION_PENDING = "Chờ chi";
const COMMISSION_PAID = "Đã chi";

export interface CtvProfileDto {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
}

export interface CtvSummaryDto {
  totalLeads: number;
  successfulLeads: number;
  failedLeads: number;
  totalContracts: number;
  completedContracts: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface CtvLeadDto {
  id: string;
  customerName: string;
  maskedPhone: string;
  group: string;
  status: string;
  expectedValue: number;
  createdAt: string;
  contractStatus: string | null;
}

export interface CtvContractDto {
  id: string;
  transactionCode: string;
  customerName: string;
  totalValue: number;
  deploymentStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface CtvCommissionDto {
  id: string;
  transactionCode: string;
  amount: number;
  status: string;
  date: string;
}

/**
 * Che SĐT: bỏ ký tự không phải số trước. Dưới 9 chữ số che hết trừ 2 số cuối
 * (không đủ an toàn để lộ đầu số); đủ 9+ số thì giữ 4 số đầu + 2 số cuối, giữa
 * thay bằng "*" (0909123456 -> 0909****56, 09091234567 -> 0909*****67).
 */
export function maskPhone(phone: string | null | undefined): string {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }
  if (digits.length < 9) {
    if (digits.length <= 2) {
      return "*".repeat(digits.length);
    }
    return `${"*".repeat(digits.length - 2)}${digits.slice(-2)}`;
  }
  return `${digits.slice(0, 4)}${"*".repeat(digits.length - 6)}${digits.slice(-2)}`;
}

function toIso(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value == null ? "" : String(value);
}

// Mọi truy vấn dưới đây lọc theo ctvId lấy từ JWT do controller truyền vào.
export class CtvService {
  async getProfile(ctvId: string): Promise<CtvProfileDto> {
    const rows = await query<{
      id: string;
      username: string;
      name: string;
      email: string | null;
      phone: string | null;
      referral_code: string | null;
    }>(
      "SELECT id, username, name, email, phone, referral_code FROM users WHERE id = ? AND role = ?",
      [ctvId, ROLES.CTV]
    );
    if (!rows.length) {
      throw new HttpError(404, "Không tìm thấy tài khoản cộng tác viên");
    }
    const row = rows[0];
    return {
      id: row.id,
      username: row.username,
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      referralCode: row.referral_code ?? "",
    };
  }

  async getSummary(ctvId: string): Promise<CtvSummaryDto> {
    const [leadRows, contractRows, commissionRows] = await Promise.all([
      query<{ status: string; total: number | string }>(
        "SELECT status, COUNT(*) AS total FROM leads WHERE referred_by_ctv_id = ? GROUP BY status",
        [ctvId]
      ),
      query<{ deployment_status: string; total: number | string }>(
        "SELECT deployment_status, COUNT(*) AS total FROM contracts WHERE referred_by_ctv_id = ? GROUP BY deployment_status",
        [ctvId]
      ),
      query<{ status: string; total: number | string | null }>(
        "SELECT status, SUM(amount) AS total FROM commissions WHERE ctv_id = ? GROUP BY status",
        [ctvId]
      ),
    ]);

    const summary: CtvSummaryDto = {
      totalLeads: 0,
      successfulLeads: 0,
      failedLeads: 0,
      totalContracts: 0,
      completedContracts: 0,
      totalCommission: 0,
      pendingCommission: 0,
      paidCommission: 0,
    };

    for (const row of leadRows) {
      const count = Number(row.total) || 0;
      summary.totalLeads += count;
      if (row.status === LEAD_STATUS_SUCCESS) summary.successfulLeads += count;
      if (row.status === LEAD_STATUS_FAILED) summary.failedLeads += count;
    }
    for (const row of contractRows) {
      const count = Number(row.total) || 0;
      summary.totalContracts += count;
      if (row.deployment_status === DEPLOYMENT_DONE) summary.completedContracts += count;
    }
    for (const row of commissionRows) {
      const amount = Number(row.total) || 0;
      summary.totalCommission += amount;
      if (row.status === COMMISSION_PENDING) summary.pendingCommission += amount;
      if (row.status === COMMISSION_PAID) summary.paidCommission += amount;
    }
    return summary;
  }

  async getLeads(ctvId: string): Promise<CtvLeadDto[]> {
    const rows = await query<{
      id: string;
      customer_name: string;
      phone: string;
      group_name: string;
      status: string;
      expected_value: number | string | null;
      created_at: unknown;
      contract_status: string | null;
    }>(
      `SELECT l.id, l.customer_name, l.phone, l.group_name, l.status, l.expected_value, l.created_at,
        (SELECT c.deployment_status FROM contracts c
          WHERE c.lead_id = l.id
          ORDER BY c.created_at DESC, c.id DESC LIMIT 1) AS contract_status
       FROM leads l
       WHERE l.referred_by_ctv_id = ?
       ORDER BY l.created_at DESC, l.id DESC`,
      [ctvId]
    );
    return rows.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      maskedPhone: maskPhone(row.phone),
      group: row.group_name,
      status: row.status,
      expectedValue: Number(row.expected_value) || 0,
      createdAt: toIso(row.created_at),
      contractStatus: row.contract_status ?? null,
    }));
  }

  async getContracts(ctvId: string): Promise<CtvContractDto[]> {
    const rows = await query<{
      id: string;
      transaction_code: string;
      customer_name: string;
      total_value: number | string | null;
      deployment_status: string;
      payment_status: string;
      created_at: unknown;
    }>(
      `SELECT id, transaction_code, customer_name, total_value, deployment_status, payment_status, created_at
       FROM contracts
       WHERE referred_by_ctv_id = ?
       ORDER BY created_at DESC, id DESC`,
      [ctvId]
    );
    return rows.map((row) => ({
      id: row.id,
      transactionCode: row.transaction_code,
      customerName: row.customer_name,
      totalValue: Number(row.total_value) || 0,
      deploymentStatus: row.deployment_status,
      paymentStatus: row.payment_status,
      createdAt: toIso(row.created_at),
    }));
  }

  async getCommissions(ctvId: string): Promise<CtvCommissionDto[]> {
    const rows = await query<{
      id: string;
      transaction_code: string;
      amount: number | string | null;
      status: string;
      date: string;
    }>(
      `SELECT id, transaction_code, amount, status, date
       FROM commissions
       WHERE ctv_id = ?
       ORDER BY date DESC, id DESC`,
      [ctvId]
    );
    return rows.map((row) => ({
      id: row.id,
      transactionCode: row.transaction_code,
      amount: Number(row.amount) || 0,
      status: row.status,
      date: row.date,
    }));
  }
}
