import { apiFetch, apiFetchRaw } from "./client";
import {
  CustomerRecord,
  CustomerType,
  CustomerGroup,
} from "@/lib/crm/types/crm.types";

/**
 * Field thô (snake_case) trả về từ
 * `backend/src/modules/customer/customer.service.ts` (bảng SQLite `customers`).
 */
interface CustomerApiRow {
  id: string;
  name: string;
  identity_code?: string | null;
  type: string;
  customer_group: string;
  phone?: string | null;
  address?: string | null;
  services?: string | null;
  nearest_expiration?: string | null;
  am_staff?: string | null;
  am_caring_staff?: string | null;
  handover_batch?: string | null;
  handover_date?: string | null;
  territory_id?: string | null;
  territory_name?: string | null;
  customer_code?: string | null;
  status?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  sales_channel?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  billing_name?: string | null;
  billing_phone?: string | null;
  billing_email?: string | null;
  note?: string | null;
}

function mapCustomerRow(row: CustomerApiRow): CustomerRecord {
  return {
    id: row.id,
    name: row.name,
    identityCode: row.identity_code || "",
    type: row.type as CustomerType,
    group: row.customer_group as CustomerGroup,
    phone: row.phone || "",
    address: row.address || "",
    services: row.services
      ? row.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    nearestExpiration: row.nearest_expiration || "",
    amStaff: row.am_staff || "",
    amCaringStaff: row.am_caring_staff || "",
    handoverBatch: row.handover_batch || "",
    handoverDate: row.handover_date || "",
    territoryId: row.territory_id || undefined,
    territoryName: row.territory_name || undefined,
    customerCode: row.customer_code || undefined,
    status: row.status || undefined,
    teamId: row.team_id || undefined,
    teamName: row.team_name || undefined,
    salesChannel: row.sales_channel || undefined,
    contactName: row.contact_name || undefined,
    contactEmail: row.contact_email || undefined,
    billingName: row.billing_name || undefined,
    billingPhone: row.billing_phone || undefined,
    billingEmail: row.billing_email || undefined,
    note: row.note || undefined,
  };
}

export async function getCustomers(
  search?: string,
  group?: CustomerGroup
): Promise<CustomerRecord[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (group) params.set("group", group);
  const queryString = params.toString();
  const qs = queryString ? `?${queryString}` : "";
  const rows = await apiFetch<CustomerApiRow[]>(`/customers${qs}`);
  return rows.map(mapCustomerRow);
}

export interface CreateCustomerInput {
  name: string;
  identityCode?: string;
  type: CustomerType;
  customerGroup: CustomerGroup;
  phone?: string;
  address?: string;
  services?: string;
  amStaff?: string;
  amCaringStaff?: string;
  handoverBatch?: string;
  territoryId?: string;
  customerCode?: string;
  status?: string;
  teamId?: string;
  salesChannel?: string;
  contactName?: string;
  contactEmail?: string;
  billingName?: string;
  billingPhone?: string;
  billingEmail?: string;
  note?: string;
}

export type UpdateCustomerInput = Partial<Omit<CreateCustomerInput, "amStaff" | "amCaringStaff">>;

export async function getCustomer(id: string): Promise<CustomerRecord> {
  const row = await apiFetch<CustomerApiRow>(`/customers/${encodeURIComponent(id)}`);
  return mapCustomerRow(row);
}

export async function updateCustomer(
  id: string,
  patch: UpdateCustomerInput
): Promise<CustomerRecord> {
  const row = await apiFetch<CustomerApiRow>(`/customers/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return mapCustomerRow(row);
}

/**
 * Tạo khách hàng mới. Backend (`CustomerService.create`) trả về bản ghi
 * đầy đủ vừa tạo (bao gồm giá trị mặc định do backend áp dụng), nên chỉ
 * cần map qua `mapCustomerRow` như `getCustomers`, không tự chèn mặc định ở FE.
 */
export async function createCustomer(
  data: CreateCustomerInput
): Promise<CustomerRecord> {
  const row = await apiFetch<CustomerApiRow>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return mapCustomerRow(row);
}

// Đổi AM bán hàng (người phát triển) — không nhận đợt giao, xem transferCaringStaff().
export function transferCustomer(id: string, newStaff: string): Promise<void> {
  return apiFetch<void>(`/customers/${encodeURIComponent(id)}/transfer`, {
    method: "PATCH",
    body: JSON.stringify({ newStaff }),
  });
}

export function transferCaringStaff(
  id: string,
  newCaringStaff: string,
  handoverBatch?: string
): Promise<void> {
  return apiFetch<void>(`/customers/${encodeURIComponent(id)}/transfer-caring`, {
    method: "PATCH",
    body: JSON.stringify({ newCaringStaff, handoverBatch: handoverBatch || undefined }),
  });
}

export interface BatchCustomerInputItem {
  identityCode?: string;
  phone?: string;
  name: string;
  type?: string;
  address?: string;
  services?: string;
}

export interface ImportCustomerBatchInput {
  territoryId: string;
  amCaringStaff: string;
  handoverBatch: string;
  mode: "append" | "replace";
  customers: BatchCustomerInputItem[];
}

export interface ImportCustomerBatchResult {
  createdCount: number;
  updatedCount: number;
  clearedCount: number;
  totalProcessed: number;
}

export async function importCustomerBatch(
  data: ImportCustomerBatchInput
): Promise<ImportCustomerBatchResult> {
  return apiFetch<ImportCustomerBatchResult>("/customers/batches", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function importCustomerBatchExcel(
  file: File,
  params: {
    territoryId: string;
    amCaringStaff: string;
    handoverBatch: string;
    mode: "append" | "replace";
  }
): Promise<ImportCustomerBatchResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("territoryId", params.territoryId);
  formData.append("amCaringStaff", params.amCaringStaff);
  formData.append("handoverBatch", params.handoverBatch);
  formData.append("mode", params.mode);

  const payload = await apiFetchRaw<{
    success: boolean;
    data: ImportCustomerBatchResult;
    message?: string;
  }>("/customers/batches/upload", {
    method: "POST",
    body: formData,
  });

  if (!payload || !payload.success) {
    throw new Error(payload?.message || "Import tập khách hàng thất bại");
  }

  return payload.data;
}
