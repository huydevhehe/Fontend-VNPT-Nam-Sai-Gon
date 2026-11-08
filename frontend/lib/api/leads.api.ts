import { apiFetch } from "./client";
import { LeadRecord, LeadStatus } from "@/lib/crm/types/crm.types";

export type CreateLeadInput = Omit<
  LeadRecord,
  "id" | "referredByCtvName" | "territoryId" | "referredByCtvId"
> & {
  territoryId?: string | null;
  referredByCtvId?: string | null;
};

export interface CtvOption {
  id: string;
  name: string;
  referralCode: string;
}

export interface LeadAssignmentInput {
  staffName?: string;
  territoryId?: string | null;
}

export function getLeads(): Promise<LeadRecord[]> {
  return apiFetch<LeadRecord[]>("/leads");
}

export function getCtvOptions(): Promise<CtvOption[]> {
  return apiFetch<CtvOption[]>("/leads/ctv-options");
}

export function createLead(data: CreateLeadInput): Promise<LeadRecord> {
  return apiFetch<LeadRecord>("/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateLeadStatus(id: string, status: LeadStatus): Promise<LeadRecord> {
  return apiFetch<LeadRecord>(`/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function assignLead(id: string, input: LeadAssignmentInput): Promise<LeadRecord> {
  return apiFetch<LeadRecord>(`/leads/${id}/assignment`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
