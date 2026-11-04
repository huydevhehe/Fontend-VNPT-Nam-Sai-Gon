import { apiFetch } from "./client";
import { ContractRecord } from "@/lib/crm/types/crm.types";

export type UpdateContractStatusInput = Partial<
  Pick<ContractRecord, "deploymentStatus" | "paymentStatus" | "documentStatus" | "totalValue">
>;

export function getContracts(): Promise<ContractRecord[]> {
  return apiFetch<ContractRecord[]>("/contracts");
}

export function updateContractStatus(
  id: string,
  patch: UpdateContractStatusInput
): Promise<ContractRecord> {
  return apiFetch<ContractRecord>(`/contracts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
