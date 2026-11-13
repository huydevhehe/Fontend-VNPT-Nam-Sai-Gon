import { apiFetch } from "./client";
import { CommissionRecord, ReferrerSummaryRecord } from "@/lib/crm/types/crm.types";

export function getCommissions(): Promise<CommissionRecord[]> {
  return apiFetch<CommissionRecord[]>("/commissions");
}

export function getCommissionReferrerSummary(): Promise<ReferrerSummaryRecord[]> {
  return apiFetch<ReferrerSummaryRecord[]>("/commissions/summary");
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

export interface UpdateCommissionPayoutInput {
  customerPaidOverride?: number | null;
  paidOutAmount?: number;
  paidOutDate?: string | null;
}

export function updateCommissionPayout(
  id: string,
  input: UpdateCommissionPayoutInput
): Promise<CommissionRecord> {
  return apiFetch<CommissionRecord>(`/commissions/${id}/payout`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
