import { apiFetch } from "./client";
import type {
  CtvCommissionRecord,
  CtvContractRecord,
  CtvLeadRecord,
  CtvProfile,
  CtvSummary,
} from "@/lib/crm/types/crm.types";

// Lead chưa có hợp đồng thì backend trả contractStatus = null.
export type CtvLead = Omit<CtvLeadRecord, "contractStatus"> & {
  contractStatus: CtvLeadRecord["contractStatus"] | null;
};

// Mọi endpoint /ctv/* chỉ trả dữ liệu của chính CTV đang đăng nhập (id lấy từ JWT).
export function getCtvMe(): Promise<CtvProfile> {
  return apiFetch<CtvProfile>("/ctv/me");
}

export function getCtvSummary(): Promise<CtvSummary> {
  return apiFetch<CtvSummary>("/ctv/summary");
}

export function getCtvLeads(): Promise<CtvLead[]> {
  return apiFetch<CtvLead[]>("/ctv/leads");
}

export function getCtvContracts(): Promise<CtvContractRecord[]> {
  return apiFetch<CtvContractRecord[]>("/ctv/contracts");
}

export function getCtvCommissions(): Promise<CtvCommissionRecord[]> {
  return apiFetch<CtvCommissionRecord[]>("/ctv/commissions");
}
