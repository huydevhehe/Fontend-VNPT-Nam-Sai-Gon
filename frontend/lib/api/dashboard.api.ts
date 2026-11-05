import { AuditLogRecord, StaffRecord } from "@/lib/crm/types/crm.types";
import { apiFetchRaw } from "./client";

/**
 * Field thô (snake_case) của bảng `staff`, được
 * `backend/src/modules/dashboard/dashboard.service.ts` trả về trực tiếp
 * (SELECT * FROM staff) — không đi qua StaffService nên không camelCase.
 */
interface DashboardStaffRow {
  id: string;
  code: string;
  name: string;
  role: string;
  territory: string;
  assigned_customers: number;
  monthly_leads: number;
  monthly_contracts: number;
  revenue_executed: number;
  collection_rate: number;
  renewal_rate: number;
  status: string;
  email: string;
}

function mapStaffRow(row: DashboardStaffRow): StaffRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    role: row.role as StaffRecord["role"],
    territory: row.territory,
    assignedCustomers: Number(row.assigned_customers) || 0,
    monthlyLeads: Number(row.monthly_leads) || 0,
    monthlyContracts: Number(row.monthly_contracts) || 0,
    revenueExecuted: Number(row.revenue_executed) || 0,
    collectionRate: Number(row.collection_rate) || 0,
    renewalRate: Number(row.renewal_rate) || 0,
    status: row.status as StaffRecord["status"],
    email: row.email,
  };
}

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
  staffList: DashboardStaffRow[];
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
    staffList: (payload.staffList || []).map(mapStaffRow),
    recentLogs: payload.recentLogs || [],
  };
}
