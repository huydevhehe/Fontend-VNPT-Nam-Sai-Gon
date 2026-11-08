import { apiFetch } from "./client";
import { CtvAccountRecord } from "@/lib/crm/types/crm.types";

export function getCtvAccounts(status?: CtvAccountRecord["status"]): Promise<CtvAccountRecord[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<CtvAccountRecord[]>(`/ctv-accounts${qs}`);
}

export function approveCtvAccount(id: string): Promise<CtvAccountRecord> {
  return apiFetch<CtvAccountRecord>(`/ctv-accounts/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
  });
}

export function rejectCtvAccount(id: string): Promise<CtvAccountRecord> {
  return apiFetch<CtvAccountRecord>(`/ctv-accounts/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
  });
}
