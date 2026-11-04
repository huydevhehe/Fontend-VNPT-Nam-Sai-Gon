import { apiFetch } from "./client";
import { LeadRecord, LeadStatus } from "@/lib/crm/types/crm.types";

export type CreateLeadInput = Omit<LeadRecord, "id">;

export function getLeads(): Promise<LeadRecord[]> {
  return apiFetch<LeadRecord[]>("/leads");
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
