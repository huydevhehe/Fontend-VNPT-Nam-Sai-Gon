import { apiFetch } from "./client";
import {
  QuarterRecord,
  TerritoryDetail,
  TerritoryRecord,
  WardContactRecord,
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
  population?: number | null;
  school_mamnon?: number | null;
  school_tieuhoc?: number | null;
  school_thcs?: number | null;
  school_thpt?: number | null;
  revenue?: number | null;
}

interface WardContactApiRow {
  id: string;
  territory_id: string;
  unit: string;
  department: string;
  full_name: string;
  position: string;
  phone?: string | null;
  am_in_charge?: string | null;
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
    population: Number(row.population) || 0,
    schoolMamnon: Number(row.school_mamnon) || 0,
    schoolTieuhoc: Number(row.school_tieuhoc) || 0,
    schoolThcs: Number(row.school_thcs) || 0,
    schoolThpt: Number(row.school_thpt) || 0,
    revenue: Number(row.revenue) || 0,
  };
}

function mapWardContactRow(row: WardContactApiRow): WardContactRecord {
  return {
    id: row.id,
    territoryId: row.territory_id,
    unit: row.unit,
    department: row.department,
    fullName: row.full_name,
    position: row.position,
    phone: row.phone || "",
    amInCharge: row.am_in_charge || "",
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

export type UpdateTerritoryStatsInput = Partial<
  Pick<
    TerritoryRecord,
    "population" | "schoolMamnon" | "schoolTieuhoc" | "schoolThcs" | "schoolThpt" | "revenue"
  >
>;

export async function updateTerritoryStats(
  id: string,
  stats: UpdateTerritoryStatsInput
): Promise<TerritoryRecord> {
  const row = await apiFetch<TerritoryApiRow>(`/territories/${id}/stats`, {
    method: "PATCH",
    body: JSON.stringify(stats),
  });
  return mapTerritoryRow(row);
}

export async function getWardContacts(territoryId: string): Promise<WardContactRecord[]> {
  const rows = await apiFetch<WardContactApiRow[]>(`/territories/${territoryId}/contacts`);
  return rows.map(mapWardContactRow);
}

export type CreateWardContactInput = Pick<
  WardContactRecord,
  "unit" | "department" | "fullName" | "position" | "phone" | "amInCharge"
>;

export async function createWardContact(
  territoryId: string,
  data: CreateWardContactInput
): Promise<WardContactRecord> {
  const row = await apiFetch<WardContactApiRow>(`/territories/${territoryId}/contacts`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapWardContactRow(row);
}

export type UpdateWardContactInput = Partial<CreateWardContactInput>;

export async function updateWardContact(
  contactId: string,
  patch: UpdateWardContactInput
): Promise<WardContactRecord> {
  const row = await apiFetch<WardContactApiRow>(`/territories/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return mapWardContactRow(row);
}

export async function deleteWardContact(contactId: string): Promise<void> {
  await apiFetch<{ message: string }>(`/territories/contacts/${contactId}`, {
    method: "DELETE",
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
