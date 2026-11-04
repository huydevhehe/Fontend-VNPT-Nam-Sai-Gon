import { apiFetch } from "./client";
import { StaffRecord } from "@/lib/crm/types/crm.types";

export type UpdateStaffInput = Partial<
  Pick<StaffRecord, "name" | "role" | "territory" | "status" | "email">
>;

export function getStaff(): Promise<StaffRecord[]> {
  return apiFetch<StaffRecord[]>("/staff");
}

export function updateStaff(
  id: string,
  patch: UpdateStaffInput
): Promise<StaffRecord> {
  return apiFetch<StaffRecord>(`/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
