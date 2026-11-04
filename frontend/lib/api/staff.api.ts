import { apiFetch } from "./client";
import { StaffRecord } from "@/lib/crm/types/crm.types";

export type UpdateStaffInput = Partial<
  Pick<StaffRecord, "name" | "role" | "territory" | "status" | "email">
>;

export type CreateStaffInput = Pick<
  StaffRecord,
  "code" | "name" | "role" | "territory" | "email"
>;

export function getStaff(): Promise<StaffRecord[]> {
  return apiFetch<StaffRecord[]>("/staff");
}

export function createStaff(data: CreateStaffInput): Promise<StaffRecord> {
  return apiFetch<StaffRecord>("/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
