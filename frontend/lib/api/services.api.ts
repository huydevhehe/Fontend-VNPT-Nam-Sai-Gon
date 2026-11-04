import { apiFetch } from "./client";
import { ServiceRecord } from "@/lib/crm/types/crm.types";

export interface GetServicesParams {
  staff?: string;
  expiringWithinDays?: number;
}

function buildQuery(params?: GetServicesParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.staff) searchParams.set("staff", params.staff);
  if (typeof params.expiringWithinDays === "number") {
    searchParams.set("expiringWithinDays", String(params.expiringWithinDays));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getServices(params?: GetServicesParams): Promise<ServiceRecord[]> {
  return apiFetch<ServiceRecord[]>(`/services${buildQuery(params)}`);
}
