import { query, run } from "../../database/db.js";

export interface CommissionRow {
  id: string;
  recipient_name: string;
  type: string;
  transaction_code: string;
  amount: number;
  status: string;
  date: string;
}

export interface CommissionRecordDto {
  id: string;
  recipientName: string;
  type: string;
  transactionCode: string;
  amount: number;
  status: string;
  date: string;
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
  };
}

export class CommissionService {
  async getAll(): Promise<CommissionRecordDto[]> {
    const rows = await query<CommissionRow>("SELECT * FROM commissions ORDER BY created_at DESC");
    return rows.map(toCommissionRecord);
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
