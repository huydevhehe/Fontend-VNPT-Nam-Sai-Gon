import { query, run } from "../../database/db.js";
import {
  CTV_COMMISSION_INITIAL_STATUS,
  CTV_COMMISSION_TYPE,
  calcCtvCommission,
} from "./commission.rules.js";

export interface CommissionRow {
  id: string;
  recipient_name: string;
  type: string;
  transaction_code: string;
  amount: number;
  status: string;
  date: string;
  contract_id: string | null;
  ctv_id: string | null;
}

export interface CommissionRecordDto {
  id: string;
  recipientName: string;
  type: string;
  transactionCode: string;
  amount: number;
  status: string;
  date: string;
  ctvId: string | null;
  contractId: string | null;
}

/** Phần hợp đồng mà CommissionService cần để sinh / tính lại hoa hồng. */
export interface CommissionContractInput {
  id: string;
  transaction_code: string;
  total_value: number;
  referred_by_ctv_id: string | null;
}

const COMMISSION_STATUSES = ["Đã nhận", "Chờ nhận", "Đã chi", "Chờ chi"] as const;

function toCommissionRecord(row: CommissionRow): CommissionRecordDto {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    type: row.type,
    transactionCode: row.transaction_code,
    amount: row.amount,
    status: row.status,
    date: row.date,
    ctvId: row.ctv_id ?? null,
    contractId: row.contract_id ?? null,
  };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export class CommissionService {
  async getAll(): Promise<CommissionRecordDto[]> {
    const rows = await query<CommissionRow>("SELECT * FROM commissions ORDER BY created_at DESC");
    return rows.map(toCommissionRecord);
  }

  /**
   * Sinh hoa hồng CTV cho hợp đồng. Idempotent theo (contract_id, ctv_id):
   * gọi nhiều lần vẫn chỉ có một dòng. Trả về null nếu hợp đồng không gắn CTV
   * hoặc CTV không còn tồn tại.
   */
  async createForContract(contract: CommissionContractInput): Promise<CommissionRecordDto | null> {
    const ctvId = contract.referred_by_ctv_id;
    if (!ctvId) {
      return null;
    }

    const existing = await query<CommissionRow>(
      "SELECT * FROM commissions WHERE contract_id = ? AND ctv_id = ?",
      [contract.id, ctvId]
    );
    if (existing.length) {
      return toCommissionRecord(existing[0]);
    }

    const ctv = await query<{ name: string }>("SELECT name FROM users WHERE id = ?", [ctvId]);
    if (!ctv.length) {
      return null;
    }

    const id = `HH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await run(
      `INSERT INTO commissions (
        id, recipient_name, type, transaction_code, amount, status, date, contract_id, ctv_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ctv[0].name,
        CTV_COMMISSION_TYPE,
        contract.transaction_code,
        calcCtvCommission(Number(contract.total_value)),
        CTV_COMMISSION_INITIAL_STATUS,
        today(),
        contract.id,
        ctvId,
      ]
    );

    const created = await query<CommissionRow>("SELECT * FROM commissions WHERE id = ?", [id]);
    return toCommissionRecord(created[0]);
  }

  /** Tính lại số tiền hoa hồng CTV của hợp đồng, chỉ khi còn "Chờ chi". */
  async recalculateForContract(contractId: string, totalValue: number): Promise<void> {
    await run(
      `UPDATE commissions SET amount = ?, updated_at = CURRENT_TIMESTAMP
       WHERE contract_id = ? AND ctv_id IS NOT NULL AND type = ? AND status = ?`,
      [calcCtvCommission(totalValue), contractId, CTV_COMMISSION_TYPE, CTV_COMMISSION_INITIAL_STATUS]
    );
  }

  async updateStatus(id: string, status: string): Promise<CommissionRecordDto> {
    if (!status) {
      throw new Error("Thiếu trạng thái cần cập nhật");
    }

    if (!COMMISSION_STATUSES.includes(status as (typeof COMMISSION_STATUSES)[number])) {
      throw new Error("Trạng thái không hợp lệ");
    }

    const existing = await query<CommissionRow>("SELECT * FROM commissions WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Hoa hồng");
    }

    await run(
      "UPDATE commissions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    const updated = await query<CommissionRow>("SELECT * FROM commissions WHERE id = ?", [id]);
    return toCommissionRecord(updated[0]);
  }
}
