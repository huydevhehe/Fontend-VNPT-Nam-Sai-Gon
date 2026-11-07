import { apiFetch } from "./client";
import {
  QuarterRecord,
  TerritoryDetail,
  TerritoryRecord,
  WardOfficialRecord,
} from "@/lib/crm/types/crm.types";

/**
 * Field thô (snake_case) trả về từ
 * `backend/src/modules/territory/territory.service.ts` (bảng SQLite `territories`).
 */
interface TerritoryApiRow {
  id: string;
  ward_name: string;
  quarter_count: number;
  household_count: number;
  opportunity_count: number;
  deployed_count: number;
  staff_name?: string | null;
  leadership_contact?: string | null;
}

function mapTerritoryRow(row: TerritoryApiRow): TerritoryRecord {
  return {
    id: row.id,
    wardName: row.ward_name,
    quarterCount: Number(row.quarter_count) || 0,
    householdCount: Number(row.household_count) || 0,
    opportunityCount: Number(row.opportunity_count) || 0,
    deployedCount: Number(row.deployed_count) || 0,
    staffName: row.staff_name || "",
    leadershipContact: row.leadership_contact || "",
  };
}

export async function getTerritories(): Promise<TerritoryRecord[]> {
  const rows = await apiFetch<TerritoryApiRow[]>("/territories");
  return rows.map(mapTerritoryRow);
}

/**
 * Lưu ý: route `PATCH /territories/:id/households` (xem
 * `backend/src/modules/territory/territory.controller.ts`) lệch chuẩn
 * `{success, data}` — khi thành công chỉ trả `{success: true, message}`,
 * KHÔNG trả lại bản ghi địa bàn mới. Vì vậy hàm này không trả về
 * `TerritoryRecord`; nơi gọi tự cập nhật state cục bộ sau khi gọi thành công.
 */
export async function updateTerritoryHouseholds(
  id: string,
  householdCount: number,
  quarterCount?: number
): Promise<void> {
  const body: Record<string, number> = { householdCount };
  if (quarterCount !== undefined) {
    body.quarterCount = quarterCount;
  }
  await apiFetch<{ message: string }>(`/territories/${id}/households`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export interface OfficialInput {
  unit: string;
  position: string;
  fullName: string;
  phone?: string;
}

export interface QuarterInput {
  name: string;
  headName?: string;
  secretaryName?: string;
  mttqName?: string;
  householdCount?: number;
  population?: number;
}

export function getTerritoryDetail(id: string): Promise<TerritoryDetail> {
  return apiFetch<TerritoryDetail>(`/territories/${encodeURIComponent(id)}/detail`);
}

export function createWardOfficial(territoryId: string, input: OfficialInput): Promise<WardOfficialRecord> {
  return apiFetch<WardOfficialRecord>(`/territories/${encodeURIComponent(territoryId)}/officials`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateWardOfficial(
  officialId: string,
  input: { fullName?: string; phone?: string }
): Promise<WardOfficialRecord> {
  return apiFetch<WardOfficialRecord>(`/territories/officials/${encodeURIComponent(officialId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteWardOfficial(officialId: string): Promise<void> {
  await apiFetch<{ id: string }>(`/territories/officials/${encodeURIComponent(officialId)}`, {
    method: "DELETE",
  });
}

export function createQuarter(territoryId: string, input: QuarterInput): Promise<QuarterRecord> {
  return apiFetch<QuarterRecord>(`/territories/${encodeURIComponent(territoryId)}/quarters`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateQuarter(quarterId: string, input: Partial<QuarterInput>): Promise<QuarterRecord> {
  return apiFetch<QuarterRecord>(`/territories/quarters/${encodeURIComponent(quarterId)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteQuarter(quarterId: string): Promise<void> {
  await apiFetch<{ id: string }>(`/territories/quarters/${encodeURIComponent(quarterId)}`, {
    method: "DELETE",
  });
}
