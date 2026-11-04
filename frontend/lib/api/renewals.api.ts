import { apiFetch } from "./client";
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
