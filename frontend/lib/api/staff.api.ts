import { apiFetch } from "./client";
import { StaffRecord, StaffType } from "@/lib/crm/types/crm.types";

export type UpdateStaffInput = Partial<
  Pick<
    StaffRecord,
    | "name"
    | "role"
    | "territory"
    | "status"
    | "email"
    | "hrmCode"
    | "staffType"
    | "phone"
    | "birthDate"
    | "personalEmail"
    | "shortName"
    | "note"
  >
>;

export type CreateStaffInput = Pick<
  StaffRecord,
  "code" | "name" | "role"
> & {
  territory?: string;
  email?: string;
  hrmCode?: string;
  staffType?: StaffType;
  phone?: string;
  birthDate?: string;
  personalEmail?: string;
  shortName?: string;
  note?: string;
  password: string;
  mustChangePassword?: boolean;
};

/** Kết quả tạo nhân viên; `initialPassword` chỉ có khi dùng mật khẩu mặc định (backward-compat). */
export type CreatedStaffRecord = StaffRecord & { initialPassword?: string };

export function getStaff(params?: { status?: string; month?: string }): Promise<StaffRecord[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.month) qs.set("month", params.month);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch<StaffRecord[]>(`/staff${query}`);
}

export function createStaff(data: CreateStaffInput): Promise<CreatedStaffRecord> {
  return apiFetch<CreatedStaffRecord>("/staff", {
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

export function resetStaffPassword(
  id: string,
  data: { password: string; mustChangePassword?: boolean }
): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/staff/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function changeStaffStatus(
  id: string,
  data: { status: StaffRecord["status"]; reason?: string }
): Promise<StaffRecord> {
  return apiFetch<StaffRecord>(`/staff/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getStaffReferences(id: string): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>(`/staff/${id}/references`);
}


