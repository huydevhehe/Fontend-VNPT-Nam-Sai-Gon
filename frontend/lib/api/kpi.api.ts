import { apiFetch } from "./client";
import type { KpiKey, KpiSegment } from "@/lib/kpi-formula";

export type KpiFormulas = Record<KpiKey, KpiSegment[]>;

/** `GET /api/kpi/formulas` — mọi nhân viên đã đăng nhập xem được. */
export function getKpiFormulas(): Promise<KpiFormulas> {
  return apiFetch<KpiFormulas>("/kpi/formulas");
}

/** `PUT /api/kpi/formulas/:key` — Admin. */
export function saveKpiFormula(key: KpiKey, segments: KpiSegment[]): Promise<KpiSegment[]> {
  return apiFetch<KpiSegment[]>(`/kpi/formulas/${key}`, {
    method: "PUT",
    body: JSON.stringify({ segments }),
  });
}

/** `POST /api/kpi/formulas/:key/reset` — Admin, khôi phục mặc định VNPT. */
export function resetKpiFormula(key: KpiKey): Promise<KpiSegment[]> {
  return apiFetch<KpiSegment[]>(`/kpi/formulas/${key}/reset`, {
    method: "POST",
  });
}

export interface KpiCell {
  numerator: number;
  denominator: number;
  actualRate: number | null;
  targetRate: number | null;
  completion: number | null;
  score: number | null;
}

export interface StaffKpiRow {
  staffName: string;
  thuNgay: KpiCell;
  ghttT: KpiCell;
  ghttT1: KpiCell;
}

/** `GET /api/kpi/performance?month=YYYY-MM`. AM chỉ nhận dòng của chính mình. */
export function getKpiPerformance(month: string): Promise<StaffKpiRow[]> {
  return apiFetch<StaffKpiRow[]>(`/kpi/performance?month=${encodeURIComponent(month)}`);
}

export interface KpiTargetItem {
  staffName: string;
  kpiKey: KpiKey;
  targetRate: number;
}

/** `GET /api/kpi/targets/:month` — chỉ tiêu đã nhập cho tháng đó. */
export function getKpiTargets(month: string): Promise<KpiTargetItem[]> {
  return apiFetch<KpiTargetItem[]>(`/kpi/targets/${encodeURIComponent(month)}`);
}

/** `PUT /api/kpi/targets/:month` — Admin nhập/sửa chỉ tiêu theo tháng. */
export function saveKpiTargets(month: string, items: KpiTargetItem[]): Promise<KpiTargetItem[]> {
  return apiFetch<KpiTargetItem[]>(`/kpi/targets/${encodeURIComponent(month)}`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  });
}
