import { apiFetch } from "./client";

export interface PublicLeadInput {
  name: string;
  phone: string;
  demand?: string;
  refCode?: string;
  /** Ô honeypot: luôn để trống với người dùng thật. */
  website?: string;
}

export function submitPublicLead(data: PublicLeadInput): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/public/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
