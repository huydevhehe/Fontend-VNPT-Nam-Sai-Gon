import { apiFetch } from "./client";

/** Khớp `ImportRow` ở `backend/src/modules/customer/customer-import/parse.ts`. */
export interface ImportRow {
  rowNumber: number;
  name: string;
  taxCode: string;
  customerCode: string;
  customerType: string;
  phone: string;
  email: string;
  address: string;
  hrmCode: string;
  staffNameInFile: string;
  contactName: string;
  billingName: string;
  billingPhone: string;
  billingEmail: string;
  teamName: string;
  salesChannel: string;
  note: string;
}

/** Khớp `ExistingCustomer` ở `.../customer-import/classify.ts`. */
export interface ExistingCustomerRow {
  id: string;
  name: string;
  identity_code: string | null;
  customer_code: string | null;
  phone: string | null;
  billing_phone: string | null;
  contact_email: string | null;
  billing_email: string | null;
  customer_group: string | null;
  am_caring_staff: string | null;
  territory_id: string | null;
}

export interface RowMatch {
  customerId?: string;
  matchedRowNumber?: number;
  matchedFields: string[];
  existing?: ExistingCustomerRow;
}

export interface ClassifiedRow {
  row: ImportRow;
  status: "new" | "duplicate" | "error";
  matches: RowMatch[];
  ptmConflict: boolean;
  resolvedStaffName: string | null;
  notes: string[];
}

export interface ImportPreviewResult {
  rows: ClassifiedRow[];
  summary: {
    total: number;
    new: number;
    duplicate: number;
    ptmConflict: number;
    error: number;
  };
}

export async function previewCustomerImport(
  file: File,
  opts: { defaultStaff?: string } = {}
): Promise<ImportPreviewResult> {
  const formData = new FormData();
  formData.append("file", file);
  if (opts.defaultStaff) formData.append("defaultStaff", opts.defaultStaff);

  return apiFetch<ImportPreviewResult>("/customers/import/preview", {
    method: "POST",
    body: formData,
  });
}

export type CommitAction = "create" | "keep_old" | "use_new" | "create_new" | "skip";

export interface CommitDecisionInput {
  row: ImportRow;
  action: CommitAction;
  targetCustomerId?: string;
  customerGroup?: string;
  staffName?: string | null;
}

export interface CommitImportInput {
  territoryId: string | null;
  handoverBatch?: string;
  decisions: CommitDecisionInput[];
}

export interface CommitImportResult {
  created: number;
  updated: number;
  kept: number;
  skipped: number;
  errors: { rowNumber: number; message: string }[];
}

export async function commitCustomerImport(
  input: CommitImportInput
): Promise<CommitImportResult> {
  return apiFetch<CommitImportResult>("/customers/import/commit", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
