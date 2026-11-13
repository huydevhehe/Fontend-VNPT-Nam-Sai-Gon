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

export function getCustomerServices(customerId: string): Promise<ServiceRecord[]> {
  return apiFetch<ServiceRecord[]>(`/customers/${encodeURIComponent(customerId)}/services`);
}

export interface CreateServiceInput {
  customerId: string;
  serviceGroup: string;
  serviceName: string;
  packageName?: string;
  serviceCode: string;
  paymentType: string;
  startDate: string;
  expirationDate: string;
  staffName?: string;
}

export function createService(data: CreateServiceInput): Promise<ServiceRecord> {
  return apiFetch<ServiceRecord>("/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateService(
  id: string,
  patch: Partial<CreateServiceInput>
): Promise<ServiceRecord> {
  return apiFetch<ServiceRecord>(`/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteService(id: string): Promise<void> {
  await apiFetch<{ message: string }>(`/services/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
