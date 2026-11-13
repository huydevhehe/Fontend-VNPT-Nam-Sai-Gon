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
  amStaff?: string | null;
  serviceGroup?: string | null;
  serviceName?: string | null;
  packageName?: string | null;
  paymentMethod?: string | null;
  customerId?: string | null;
  taxCode?: string | null;
  contractNumber?: string | null;
  signedDate?: string | null;
};

export type UpdateContractInfoInput = Partial<CreateContractInput>;

export function getContracts(): Promise<ContractRecord[]> {
  return apiFetch<ContractRecord[]>("/contracts");
}

export function createContract(data: CreateContractInput): Promise<ContractRecord> {
  return apiFetch<ContractRecord>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateContractInfo(
  id: string,
  patch: UpdateContractInfoInput
): Promise<ContractRecord> {
  return apiFetch<ContractRecord>(`/contracts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
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
