import { query } from "../../database/db.js";
import { HttpError } from "../auth/auth.service.js";

/**
 * Doanh thu nhân viên tính từ đơn hàng (contracts / contract_payments), theo tháng được chọn.
 * - closedMonth/closedTotal = "đã chốt" (giá trị đơn hàng), closedTotal là lũy kế tới hết tháng.
 * - collectedMonth/collectedTotal = "đã thu thực tế" (tiền đã ghi nhận thu).
 */
export interface StaffRevenue {
  closedMonth: number;
  closedTotal: number;
  collectedMonth: number;
  collectedTotal: number;
}

export const ZERO_STAFF_REVENUE: StaffRevenue = {
  closedMonth: 0,
  closedTotal: 0,
  collectedMonth: 0,
  collectedTotal: 0,
};

const MONTH_REGEX = /^\d{4}-\d{2}$/;

export function assertValidMonth(month: string): void {
  if (typeof month !== "string" || !MONTH_REGEX.test(month)) {
    throw new HttpError(400, "Tháng không hợp lệ (định dạng YYYY-MM)");
  }
}

interface ClosedRevenueRow {
  staff_name: string;
  closed_month: number | string | null;
  closed_total: number | string | null;
}

interface CollectedRevenueRow {
  staff_name: string;
  collected_month: number | string | null;
  collected_total: number | string | null;
}

// Tháng của đơn hàng: ưu tiên signed_date; đơn chưa ký lấy tháng từ created_at theo giờ
// Việt Nam (không dùng UTC trực tiếp vì lệch 7 tiếng ở các mốc cuối tháng).
const CONTRACT_MONTH_EXPR = `SUBSTRING(COALESCE(NULLIF(signed_date, ''), to_char(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')), 1, 7)`;

/**
 * Tính doanh thu "đã chốt" (contracts.total_value, loại đơn Hủy) và "đã thu"
 * (contract_payments.amount) theo tên nhân viên (am_staff), cho một tháng cụ thể.
 * closedTotal/collectedTotal là lũy kế từ trước tới hết tháng đó (không tính tháng sau).
 */
export async function computeStaffRevenue(month: string): Promise<Map<string, StaffRevenue>> {
  assertValidMonth(month);

  // GROUP BY TRIM(...) — nếu không trim ở SQL, 2 giá trị am_staff lệch khoảng trắng
  // sẽ bị tách thành 2 nhóm riêng, rồi khi JS trim() để ghép map sẽ ghi đè mất
  // nhóm trước đó thay vì cộng dồn (xem rủi ro #1, mục 8 00-tong-quan.md).
  const closedRows = await query<ClosedRevenueRow>(
    `SELECT TRIM(am_staff) AS staff_name,
      SUM(CASE WHEN ${CONTRACT_MONTH_EXPR} = ? THEN total_value ELSE 0 END) AS closed_month,
      SUM(CASE WHEN ${CONTRACT_MONTH_EXPR} <= ? THEN total_value ELSE 0 END) AS closed_total
    FROM contracts
    WHERE deployment_status <> 'Hủy' AND am_staff IS NOT NULL AND am_staff <> ''
    GROUP BY TRIM(am_staff)`,
    [month, month]
  );

  const collectedRows = await query<CollectedRevenueRow>(
    `SELECT TRIM(c.am_staff) AS staff_name,
      SUM(CASE WHEN SUBSTRING(p.paid_date, 1, 7) = ? THEN p.amount ELSE 0 END) AS collected_month,
      SUM(CASE WHEN SUBSTRING(p.paid_date, 1, 7) <= ? THEN p.amount ELSE 0 END) AS collected_total
    FROM contract_payments p
    JOIN contracts c ON c.id = p.contract_id
    WHERE c.am_staff IS NOT NULL AND c.am_staff <> ''
    GROUP BY TRIM(c.am_staff)`,
    [month, month]
  );

  const result = new Map<string, StaffRevenue>();

  for (const row of closedRows) {
    const staffName = (row.staff_name || "").trim();
    if (!staffName) continue;
    result.set(staffName, {
      closedMonth: Number(row.closed_month) || 0,
      closedTotal: Number(row.closed_total) || 0,
      collectedMonth: 0,
      collectedTotal: 0,
    });
  }

  for (const row of collectedRows) {
    const staffName = (row.staff_name || "").trim();
    if (!staffName) continue;
    const collectedMonth = Number(row.collected_month) || 0;
    const collectedTotal = Number(row.collected_total) || 0;
    const existing = result.get(staffName);
    if (existing) {
      existing.collectedMonth = collectedMonth;
      existing.collectedTotal = collectedTotal;
    } else {
      result.set(staffName, {
        closedMonth: 0,
        closedTotal: 0,
        collectedMonth,
        collectedTotal,
      });
    }
  }

  return result;
}
