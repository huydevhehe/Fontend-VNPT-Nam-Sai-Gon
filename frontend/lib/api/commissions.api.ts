import { apiFetch } from "./client";
import { CommissionRecord } from "@/lib/crm/types/crm.types";

export function getCommissions(): Promise<CommissionRecord[]> {
  return apiFetch<CommissionRecord[]>("/commissions");
}

export function updateCommissionStatus(
  id: string,
  status: CommissionRecord["status"]
): Promise<CommissionRecord> {
  return apiFetch<CommissionRecord>(`/commissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateCommissionAmount(
  id: string,
  amount: number,
  note?: string | null
): Promise<CommissionRecord> {
  return apiFetch<CommissionRecord>(`/commissions/${id}/amount`, {
    method: "PATCH",
    body: JSON.stringify({ amount, note: note ?? null }),
  });
}
