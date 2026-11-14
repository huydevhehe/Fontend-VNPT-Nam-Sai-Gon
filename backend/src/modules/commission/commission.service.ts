import { query, run } from "../../database/db.js";
import { todayVn } from "../../utils/date-vn.js";
import {
  CTV_COMMISSION_INITIAL_STATUS,
  CTV_COMMISSION_TYPE,
  calcCtvCommission,
} from "./commission.rules.js";

/** Dòng thuần của bảng commissions (không kèm dữ liệu join). */
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
  note?: string | null;
  customer_paid_override?: number | null;
  paid_out_amount?: number | null;
  paid_out_date?: string | null;
}

/** Dòng hoa hồng kèm dữ liệu join từ đơn hàng (contracts) và CTV (users). */
export interface CommissionJoinedRow extends CommissionRow {
  c_customer_name: string | null;
  c_collected_amount: number | null;
  c_am_staff: string | null;
  u_name: string | null;
  u_referral_code: string | null;
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
  note: string | null;
  /** Người giới thiệu: tên CTV, hoặc recipient_name (chi kênh không CTV), hoặc AM tiếp thị của đơn (nội bộ). */
  referrerName: string | null;
  referrerCode: string | null;
  customerName: string | null;
  /** "Khách đã chi" tự tính từ contracts.collected_amount; null nếu không gắn đơn hàng nào. */
  customerPaidAuto: number | null;
  /** Admin ghi đè; null = dùng số tự tính. */
  customerPaidOverride: number | null;
  /** customerPaidOverride ?? customerPaidAuto. */
  customerPaid: number | null;
  paidOutAmount: number;
  paidOutDate: string | null;
  /** amount - paidOutAmount; có thể âm nếu chi vượt. */
  remaining: number;
}

export interface ReferrerSummaryDto {
  referrerName: string;
  referrerCode: string | null;
  customerCount: number;
  orderCount: number;
  totalCustomerPaid: number;
  totalCommission: number;
  totalPaidOut: number;
  totalRemaining: number;
}

/** Phần hợp đồng mà CommissionService cần để sinh / tính lại hoa hồng. */
export interface CommissionContractInput {
  id: string;
  transaction_code: string;
  total_value: number;
  referred_by_ctv_id: string | null;
}

export interface UpdatePayoutInput {
  /** undefined = không đổi; null = xóa ghi đè (dùng lại số tự tính). */
  customerPaidOverride?: number | null;
  paidOutAmount?: number;
  /** undefined = không đổi; null = để trống (có thể bị thay bằng todayVn() nếu paidOutAmount > 0). */
  paidOutDate?: string | null;
}

const COMMISSION_STATUSES = ["Đã nhận", "Chờ nhận", "Đã chi", "Chờ chi"] as const;

// Join đơn hàng theo contract_id, hoặc theo transaction_code khi dòng hoa hồng
// không gắn đơn (dữ liệu seed cũ COM-01..04); join người giới thiệu (CTV) theo ctv_id.
const COMMISSION_JOIN_SELECT = `
  SELECT cm.*,
    c.customer_name AS c_customer_name,
    c.collected_amount AS c_collected_amount,
    c.am_staff AS c_am_staff,
    u.name AS u_name,
    u.referral_code AS u_referral_code
  FROM commissions cm
  LEFT JOIN contracts c ON (
    (cm.contract_id IS NOT NULL AND c.id = cm.contract_id)
    OR (cm.contract_id IS NULL AND c.transaction_code = cm.transaction_code)
  )
  LEFT JOIN users u ON u.id = cm.ctv_id
`;

function toNumberOrNull(value: number | string | null | undefined): number | null {
  return value === null || value === undefined ? null : Number(value);
}

function toCommissionRecord(row: CommissionJoinedRow): CommissionRecordDto {
  const customerPaidAuto = toNumberOrNull(row.c_collected_amount);
  const customerPaidOverride = toNumberOrNull(row.customer_paid_override);

  let referrerName: string | null;
  if (row.u_name) {
    referrerName = row.u_name;
  } else if (row.type === CTV_COMMISSION_TYPE) {
    referrerName = row.recipient_name;
  } else {
    referrerName = row.c_am_staff ?? null;
  }

  const amount = Number(row.amount);
  const paidOutAmount = Number(row.paid_out_amount ?? 0);

  return {
    id: row.id,
    recipientName: row.recipient_name,
    type: row.type,
    transactionCode: row.transaction_code,
    amount,
    status: row.status,
    date: row.date,
    ctvId: row.ctv_id ?? null,
    contractId: row.contract_id ?? null,
    note: row.note ?? null,
    referrerName,
    referrerCode: row.u_referral_code ?? null,
    customerName: row.c_customer_name ?? null,
    customerPaidAuto,
    customerPaidOverride,
    customerPaid: customerPaidOverride ?? customerPaidAuto,
    paidOutAmount,
    paidOutDate: row.paid_out_date ?? null,
    remaining: amount - paidOutAmount,
  };
}

/** Lỗi vi phạm unique constraint: SQLite_CONSTRAINT hoặc Postgres 23505. */
function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string } | undefined)?.code;
  return code === "SQLITE_CONSTRAINT" || code === "23505";
}

export class CommissionService {
  async getAll(): Promise<CommissionRecordDto[]> {
    const rows = await query<CommissionJoinedRow>(
      `${COMMISSION_JOIN_SELECT} ORDER BY cm.created_at DESC`
    );
    return rows.map(toCommissionRecord);
  }

  /** Lấy một dòng hoa hồng (kèm dữ liệu join) theo id. */
  private async getJoinedById(id: string): Promise<CommissionRecordDto | null> {
    const rows = await query<CommissionJoinedRow>(`${COMMISSION_JOIN_SELECT} WHERE cm.id = ?`, [id]);
    return rows.length ? toCommissionRecord(rows[0]) : null;
  }

  async getReferrerSummary(): Promise<ReferrerSummaryDto[]> {
    const rows = await this.getAll();

    const groups = new Map<
      string,
      {
        referrerCode: string | null;
        customers: Set<string>;
        orderCount: number;
        totalCustomerPaid: number;
        totalCommission: number;
        totalPaidOut: number;
        totalRemaining: number;
      }
    >();

    for (const row of rows) {
      if (!row.referrerName) {
        continue;
      }

      let group = groups.get(row.referrerName);
      if (!group) {
        group = {
          referrerCode: row.referrerCode,
          customers: new Set<string>(),
          orderCount: 0,
          totalCustomerPaid: 0,
          totalCommission: 0,
          totalPaidOut: 0,
          totalRemaining: 0,
        };
        groups.set(row.referrerName, group);
      }

      if (row.customerName) {
        group.customers.add(row.customerName);
      }
      group.orderCount += 1;
      group.totalCustomerPaid += row.customerPaid ?? 0;
      group.totalCommission += row.amount;
      group.totalPaidOut += row.paidOutAmount;
      group.totalRemaining += row.remaining;
      if (!group.referrerCode && row.referrerCode) {
        group.referrerCode = row.referrerCode;
      }
    }

    return Array.from(groups.entries())
      .map(([referrerName, g]) => ({
        referrerName,
        referrerCode: g.referrerCode,
        customerCount: g.customers.size,
        orderCount: g.orderCount,
        totalCustomerPaid: g.totalCustomerPaid,
        totalCommission: g.totalCommission,
        totalPaidOut: g.totalPaidOut,
        totalRemaining: g.totalRemaining,
      }))
      .sort((a, b) => b.totalCustomerPaid - a.totalCustomerPaid);
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
      return this.getJoinedById(existing[0].id);
    }

    const ctv = await query<{ name: string }>("SELECT name FROM users WHERE id = ?", [ctvId]);
    if (!ctv.length) {
      return null;
    }

    const id = `HH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
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
          todayVn(),
          contract.id,
          ctvId,
        ]
      );
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
      // SQLITE_CONSTRAINT/23505 bao gồm mọi loại vi phạm (NOT NULL, FK, PK...),
      // không chỉ unique index (contract_id, ctv_id). Chỉ coi là "đã tồn tại"
      // (idempotent, race giữa 2 request) khi thực sự tìm thấy dòng đó; nếu
      // không, đây là lỗi khác — ném lại, không được âm thầm trả null.
      const existingAfterRace = await query<CommissionRow>(
        "SELECT * FROM commissions WHERE contract_id = ? AND ctv_id = ?",
        [contract.id, ctvId]
      );
      if (!existingAfterRace.length) {
        throw error;
      }
      return this.getJoinedById(existingAfterRace[0].id);
    }

    return this.getJoinedById(id);
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

    return (await this.getJoinedById(id))!;
  }

  async updateAmount(id: string, amount: number, note: string | null = null): Promise<CommissionRecordDto> {
    if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
      throw new Error("Số tiền hoa hồng không hợp lệ (phải là số >= 0)");
    }

    const existing = await query<CommissionRow>("SELECT * FROM commissions WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Hoa hồng");
    }

    await run(
      "UPDATE commissions SET amount = ?, note = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [amount, note ? note.trim() : null, id]
    );

    return (await this.getJoinedById(id))!;
  }

  /**
   * Admin ghi đè "khách đã chi" và/hoặc ghi nhận "đã chi hoa hồng".
   * customerPaidOverride === null nghĩa là xóa ghi đè, dùng lại số tự tính.
   */
  async updatePayout(id: string, input: UpdatePayoutInput): Promise<CommissionRecordDto> {
    const existing = await query<CommissionRow>("SELECT * FROM commissions WHERE id = ?", [id]);
    if (!existing.length) {
      throw new Error("Không tìm thấy Hoa hồng");
    }
    const current = existing[0];

    let nextOverride = current.customer_paid_override ?? null;
    if (input.customerPaidOverride !== undefined) {
      if (input.customerPaidOverride === null) {
        nextOverride = null;
      } else {
        if (
          typeof input.customerPaidOverride !== "number" ||
          Number.isNaN(input.customerPaidOverride) ||
          input.customerPaidOverride < 0
        ) {
          throw new Error("Số tiền không hợp lệ (phải là số >= 0)");
        }
        nextOverride = input.customerPaidOverride;
      }
    }

    let nextPaidOutAmount = Number(current.paid_out_amount ?? 0);
    if (input.paidOutAmount !== undefined) {
      if (
        typeof input.paidOutAmount !== "number" ||
        Number.isNaN(input.paidOutAmount) ||
        input.paidOutAmount < 0
      ) {
        throw new Error("Số tiền không hợp lệ (phải là số >= 0)");
      }
      nextPaidOutAmount = input.paidOutAmount;
    }

    let nextPaidOutDate = input.paidOutDate !== undefined ? input.paidOutDate : current.paid_out_date ?? null;
    if (nextPaidOutAmount > 0 && !nextPaidOutDate) {
      nextPaidOutDate = todayVn();
    }

    await run(
      `UPDATE commissions SET
        customer_paid_override = ?,
        paid_out_amount = ?,
        paid_out_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [nextOverride, nextPaidOutAmount, nextPaidOutDate, id]
    );

    return (await this.getJoinedById(id))!;
  }
}
