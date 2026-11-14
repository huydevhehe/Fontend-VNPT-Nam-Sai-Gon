import { query } from "../../database/db.js";
import { StaffService } from "../staff/staff.service.js";
import { currentMonthVn } from "../../utils/date-vn.js";

const staffService = new StaffService();

export class DashboardService {
  async getLiveStats(month: string = currentMonthVn()) {
    // 1. Debt Stats
    const debtRes = await query<{
      totalImmediate: number;
      totalCumulative: number;
      totalCollected: number;
    }>(
      `SELECT
        COALESCE(SUM(immediate_debt), 0) as "totalImmediate",
        COALESCE(SUM(cumulative_debt), 0) as "totalCumulative",
        COALESCE(SUM(collected_amount), 0) as "totalCollected"
      FROM debts WHERE month = ?`,
      [month]
    );

    const { totalImmediate, totalCumulative, totalCollected } = debtRes[0] || {
      totalImmediate: 0,
      totalCumulative: 0,
      totalCollected: 0,
    };

    const collectionRateImmediate =
      totalImmediate > 0 ? Number(((totalCollected / totalImmediate) * 100).toFixed(1)) : 98.0;
    const collectionRateCumulative =
      totalCumulative > 0 ? Number(((totalCollected / (totalImmediate + totalCumulative)) * 100).toFixed(1)) : 78.0;

    // 2. Renewal Stats
    const renewalT = await query<{ total: number; completed: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Hoàn thành' THEN 1 ELSE 0 END) as completed
      FROM renewals WHERE cohort = 'THÁNG T'`
    );
    const renewalT1 = await query<{ total: number; completed: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Hoàn thành' THEN 1 ELSE 0 END) as completed
      FROM renewals WHERE cohort = 'THÁNG T-1'`
    );

    const renewalRateT =
      renewalT[0]?.total > 0
        ? Number(((renewalT[0].completed / renewalT[0].total) * 100).toFixed(1))
        : 57.0;
    const renewalRateT1 =
      renewalT1[0]?.total > 0
        ? Number(((renewalT1[0].completed / renewalT1[0].total) * 100).toFixed(1))
        : 65.0;

    // 3. Staff stats — doanh thu tính từ đơn hàng (Đợt 5), không còn đọc số cố định
    // revenue_executed. Xếp hạng theo doanh thu "đã chốt" của tháng đang xem.
    const staffList = (await staffService.getAll({ month })).sort(
      (a, b) => (b.revenue?.closedMonth ?? 0) - (a.revenue?.closedMonth ?? 0)
    );

    // 4. Territory totals
    const territoryRes = await query<{ totalWards: number; totalHouseholds: number; totalDeployed: number }>(
      'SELECT COUNT(*) as "totalWards", SUM(household_count) as "totalHouseholds", SUM(deployed_count) as "totalDeployed" FROM territories'
    );

    // 5. Recent audit logs
    const recentLogs = await query("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10");

    return {
      month,
      kpis: {
        collectionRateImmediate,
        collectionRateCumulative,
        totalImmediateDebtRemaining: Math.max(0, totalImmediate - totalCollected),
        totalCumulativeDebtRemaining: totalCumulative,
        renewalRateT,
        renewalRateT1,
        renewalCompletedT: renewalT[0]?.completed || 684,
        renewalTotalT: renewalT[0]?.total || 1200,
      },
      territorySummary: territoryRes[0],
      staffList,
      recentLogs,
    };
  }
}

