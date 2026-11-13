import { AuditLogRecord, StaffRecord } from "@/lib/crm/types/crm.types";
import { apiFetchRaw } from "./client";

export interface DashboardKpis {
  collectionRateImmediate: number;
  collectionRateCumulative: number;
  totalImmediateDebtRemaining: number;
  totalCumulativeDebtRemaining: number;
  renewalRateT: number;
  renewalRateT1: number;
  renewalCompletedT: number;
  renewalTotalT: number;
}

export interface DashboardTerritorySummary {
  totalWards: number;
  totalHouseholds: number;
  totalDeployed: number;
}

export interface DashboardSummary {
  month: string;
  kpis: DashboardKpis;
  territorySummary: DashboardTerritorySummary;
  staffList: StaffRecord[];
  recentLogs: AuditLogRecord[];
}

interface DashboardStatsApiResponse {
  success: boolean;
  message?: string;
  month: string;
  kpis: DashboardKpis;
  territorySummary: DashboardTerritorySummary;
  // Từ Đợt 5: dashboard.service.ts lấy staffList qua StaffService.getAll(month),
  // nên đã là camelCase (StaffRecordDto, kèm revenue) — không cần map lại từ snake_case.
  staffList: StaffRecord[];
  recentLogs: AuditLogRecord[];
}

/**
 * Gọi `GET /api/dashboard/stats`.
 *
 * Lưu ý: endpoint này trả thẳng `{success, month, kpis, ...}` (không bọc
 * trong `data` như các API khác ở `apiFetch`), nên dùng `apiFetchRaw` (thay
 * vì `apiFetch`) để tránh bị unwrap nhầm thành `undefined` nhưng vẫn được
 * gắn token + bắn event `vnpt:unauthorized` khi gặp 401.
 */
export async function getDashboardSummary(
  month?: string
): Promise<DashboardSummary> {
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";

  const payload = await apiFetchRaw<DashboardStatsApiResponse | undefined>(
    `/dashboard/stats${qs}`
  );

  if (!payload || payload.success === false) {
    const message = payload?.message || "Yêu cầu thất bại";
    throw new Error(message);
  }

  return {
    month: payload.month,
    kpis: payload.kpis,
    territorySummary: payload.territorySummary,
    staffList: payload.staffList || [],
    recentLogs: payload.recentLogs || [],
  };
}
