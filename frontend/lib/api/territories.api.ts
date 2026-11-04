import { apiFetch } from "./client";
import { TerritoryRecord } from "@/lib/crm/types/crm.types";

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
