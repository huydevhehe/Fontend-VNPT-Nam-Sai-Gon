import { apiFetch } from "./client";
import { ContractRecord } from "@/lib/crm/types/crm.types";

export type UpdateContractStatusInput = Partial<
  Pick<ContractRecord, "deploymentStatus" | "paymentStatus" | "documentStatus" | "totalValue">
>;

export type CreateContractInput = Pick<
  ContractRecord,
  "transactionCode" | "customerName" | "subscriberCodes" | "totalValue" | "channel"
> & {
  leadId?: string | null;
  territoryId?: string | null;
};

export function getContracts(): Promise<ContractRecord[]> {
  return apiFetch<ContractRecord[]>("/contracts");
}

export function createContract(data: CreateContractInput): Promise<ContractRecord> {
  return apiFetch<ContractRecord>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
