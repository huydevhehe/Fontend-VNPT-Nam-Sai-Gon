import { apiFetch } from "./client";
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
