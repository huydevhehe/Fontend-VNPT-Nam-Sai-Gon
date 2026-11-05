import { apiFetch, apiFetchRaw } from "./client";
import {
  RenewalRecord,
  RenewalStatus,
  RenewalFailureReason,
} from "@/lib/crm/types/crm.types";

/**
 * Field thô (snake_case) trả về từ
 * `backend/src/modules/renewal/renewal.service.ts` (bảng SQLite `renewals`).
 */
interface RenewalApiRow {
  id: string;
  transaction_code: string;
  subscriber_code: string;
  customer_name: string;
  payment_code: string;
  installation_address: string;
  staff_name: string;
  term_amount: number;
  duration_months: number;
  cohort: string;
  status: string;
  failure_reason?: string | null;
}

function mapRenewalRow(row: RenewalApiRow): RenewalRecord {
  return {
    id: row.id,
    transactionCode: row.transaction_code,
    subscriberCode: row.subscriber_code,
    customerName: row.customer_name,
    paymentCode: row.payment_code,
    installationAddress: row.installation_address,
    staffName: row.staff_name,
    termAmount: Number(row.term_amount) || 0,
    durationMonths: Number(row.duration_months) || 0,
    cohort: row.cohort as RenewalRecord["cohort"],
    status: row.status as RenewalStatus,
    failureReason: (row.failure_reason || undefined) as
      | RenewalFailureReason
      | undefined,
  };
}

export interface GetRenewalsParams {
  cohort?: string;
  staff?: string;
  status?: string;
}

export async function getRenewals(
  params: GetRenewalsParams = {}
): Promise<RenewalRecord[]> {
  const search = new URLSearchParams();
  if (params.cohort) search.set("cohort", params.cohort);
  if (params.staff) search.set("staff", params.staff);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();

  const rows = await apiFetch<RenewalApiRow[]>(
    `/renewals${qs ? `?${qs}` : ""}`
  );
  return rows.map(mapRenewalRow);
}

export interface ImportRenewalsResult {
  success: boolean;
  sheetName: string;
  totalProcessed: number;
  importedCount: number;
  duplicateCount: number;
  skippedCount: number;
  errors: string[];
}

/**
 * Gọi `POST /api/renewals/import` (multipart/form-data qua multer).
 *
 * Lưu ý: giống `importDebtsExcel` (`debts.api.ts`), endpoint này trả thẳng
 * `{success, sheetName, importedCount, ...}` (không bọc trong `data` như
 * các API khác — đã xác nhận trong `renewal.controller.ts`), nên dùng
 * `apiFetchRaw` (thay vì `apiFetch`) để tránh bị unwrap nhầm thành
 * `undefined` nhưng vẫn được gắn token + bắn event `vnpt:unauthorized` khi
 * gặp 401. Việc gửi `FormData` vẫn để browser tự set `Content-Type:
 * multipart/form-data; boundary=...` (không set tay).
 */
export async function importRenewalsExcel(
  file: File,
  cohort: string
): Promise<ImportRenewalsResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("cohort", cohort);

  const payload = await apiFetchRaw<
    ImportRenewalsResult | { success: false; message: string } | undefined
  >("/renewals/import", {
    method: "POST",
    body: formData,
  });

  if (!payload || payload.success === false) {
    const message =
      (payload as { message?: string } | undefined)?.message ||
      "Import thất bại";
    throw new Error(message);
  }

  return payload as ImportRenewalsResult;
}

/**
 * Gọi `PATCH /api/renewals/:id/status`.
 *
 * Lưu ý: đã xác nhận trong `renewal.controller.ts` — endpoint này trả thẳng
 * `{success: true, message: "..."}` (KHÔNG trả lại bản ghi đã cập nhật,
 * cũng KHÔNG bọc trong `{data}`). Vì vậy hàm này không thể trả về
 * `RenewalRecord` như kỳ vọng ban đầu — chỉ dùng để xác nhận cập nhật
 * thành công hay không; nơi gọi tự cập nhật lại state cục bộ với
 * `status`/`failureReason` vừa gửi (hoặc gọi lại `getRenewals`).
 */
export async function updateRenewalStatus(
  id: string,
  status: RenewalStatus,
  failureReason?: RenewalFailureReason
): Promise<void> {
  await apiFetch<void>(`/renewals/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, failureReason }),
  });
}
