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
  };
}

export async function getCustomers(search?: string): Promise<CustomerRecord[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
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
}

/**
 * Tạo khách hàng mới. Backend (`CustomerService.create`) chỉ trả `{id}`,
 * nên dựng lại `CustomerRecord` đầy đủ từ dữ liệu đã gửi + id trả về,
 * khớp đúng giá trị mặc định mà backend áp dụng (services/amStaff).
 */
export async function createCustomer(
  data: CreateCustomerInput
): Promise<CustomerRecord> {
  const result = await apiFetch<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return mapCustomerRow({
    id: result.id,
    name: data.name,
    identity_code: data.identityCode || null,
    type: data.type,
    customer_group: data.customerGroup,
    phone: data.phone || null,
    address: data.address || null,
    services: data.services || "Internet Fiber",
    nearest_expiration: null,
    am_staff: data.amStaff || "Nguyễn Thị Tình",
    am_caring_staff: data.amStaff || "Nguyễn Thị Tình",
  });
}

export function transferCustomer(id: string, newStaff: string): Promise<void> {
  return apiFetch<void>(`/customers/${encodeURIComponent(id)}/transfer`, {
    method: "PATCH",
    body: JSON.stringify({ newStaff }),
  });
}
