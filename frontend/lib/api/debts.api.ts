import { apiFetch, getToken, API_BASE_URL } from "./client";
import { DebtRecord, DebtStatus } from "@/lib/crm/types/crm.types";

/**
 * Field thô (snake_case) trả về từ `backend/src/modules/debt/debt.service.ts`
 * (bảng SQLite `debts`) — khác camelCase của `DebtRecord`.
 */
interface DebtApiRow {
  id: string;
  staff_name: string;
  service_group: string;
  payment_code: string;
  subscriber_code: string;
  customer_name: string;
  installation_address: string;
  immediate_debt: number;
  cumulative_debt: number;
  collected_amount: number;
  status: string;
  document_ref?: string | null;
  month: string;
}

function mapDebtRow(row: DebtApiRow): DebtRecord {
  return {
    id: row.id,
    staffName: row.staff_name,
    serviceGroup: row.service_group,
    paymentCode: row.payment_code,
    subscriberCode: row.subscriber_code,
    customerName: row.customer_name,
    installationAddress: row.installation_address,
    immediateDebt: Number(row.immediate_debt) || 0,
    cumulativeDebt: Number(row.cumulative_debt) || 0,
    collectedAmount: Number(row.collected_amount) || 0,
    status: row.status as DebtStatus,
    documentRef: row.document_ref || undefined,
    month: row.month,
  };
}

export interface GetDebtsParams {
  month?: string;
  staff?: string;
  status?: string;
}

export async function getDebts(
  params: GetDebtsParams = {}
): Promise<DebtRecord[]> {
  const search = new URLSearchParams();
  if (params.month) search.set("month", params.month);
  if (params.staff) search.set("staff", params.staff);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();

  const rows = await apiFetch<DebtApiRow[]>(`/debts${qs ? `?${qs}` : ""}`);
  return rows.map(mapDebtRow);
}

export interface ImportDebtsResult {
  success: boolean;
  sheetName: string;
  totalProcessed: number;
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Gọi `POST /api/debts/import` (multipart/form-data qua multer).
 *
 * Lưu ý: endpoint này trả thẳng `{success, sheetName, importedCount, ...}`
 * (không bọc trong `data` như các API khác), nên KHÔNG dùng `apiFetch` để
 * tránh bị unwrap nhầm thành `undefined`. Việc gửi `FormData` vẫn đi qua
 * `fetch` trực tiếp để browser tự set `Content-Type: multipart/form-data;
 * boundary=...` (không set tay).
 */
export async function importDebtsExcel(
  file: File,
  month: string,
  operator?: string
): Promise<ImportDebtsResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("month", month);
  if (operator) {
    formData.append("operator", operator);
  }

  const token = getToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/debts/import`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    throw new Error(
      "Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng."
    );
  }

  let payload: ImportDebtsResult | { success: false; message: string } | undefined;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  if (!response.ok || !payload || payload.success === false) {
    const message =
      (payload as { message?: string } | undefined)?.message ||
      `Import thất bại với mã lỗi ${response.status}`;
    throw new Error(message);
  }

  return payload as ImportDebtsResult;
}
