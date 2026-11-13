import { query } from "../../../database/db.js";
import { parseCustomerSheet, readWorkbookRows } from "./parse.js";
import { classifyRows, type ClassifiedRow, type ExistingCustomer } from "./classify.js";

export const MAX_IMPORT_ROWS = 5000;

export class CustomerImportServiceError extends Error {
  constructor(
    message: string,
    public readonly status: 400 = 400
  ) {
    super(message);
  }
}

export interface PreviewResult {
  rows: ClassifiedRow[];
  summary: {
    total: number;
    new: number;
    duplicate: number;
    ptmConflict: number;
    error: number;
  };
}

async function loadExistingCustomers(): Promise<ExistingCustomer[]> {
  return query<ExistingCustomer>(
    `SELECT id, name, identity_code, customer_code, phone, billing_phone,
            contact_email, billing_email, customer_group, am_caring_staff, territory_id
     FROM customers`
  );
}

async function loadStaffByHrm(): Promise<Map<string, string>> {
  const rows = await query<{ name: string; hrm_code: string }>(
    "SELECT name, hrm_code FROM staff WHERE hrm_code IS NOT NULL AND hrm_code <> ''"
  );
  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.hrm_code) map.set(row.hrm_code.trim(), row.name);
  }
  return map;
}

export class CustomerImportService {
  async preview(buffer: Buffer, defaultStaff: string | null): Promise<PreviewResult> {
    const rawRows = readWorkbookRows(buffer);
    if (rawRows.length > MAX_IMPORT_ROWS) {
      throw new CustomerImportServiceError(`File vượt quá giới hạn ${MAX_IMPORT_ROWS} dòng`);
    }

    const { rows, errors } = parseCustomerSheet(rawRows);
    const existing = await loadExistingCustomers();
    const staffByHrm = await loadStaffByHrm();

    const classified = classifyRows(rows, existing, staffByHrm, defaultStaff);

    const errorRows: ClassifiedRow[] = errors.map((e) => ({
      row: {
        rowNumber: e.rowNumber,
        name: "",
        taxCode: "",
        customerCode: "",
        customerType: "",
        phone: "",
        email: "",
        address: "",
        hrmCode: "",
        staffNameInFile: "",
        contactName: "",
        billingName: "",
        billingPhone: "",
        billingEmail: "",
        teamName: "",
        salesChannel: "",
        note: "",
      },
      status: "error",
      matches: [],
      ptmConflict: false,
      resolvedStaffName: null,
      notes: [e.message],
    }));

    const allRows = [...classified, ...errorRows].sort((a, b) => a.row.rowNumber - b.row.rowNumber);

    const summary = {
      total: allRows.length,
      new: classified.filter((r) => r.status === "new").length,
      duplicate: classified.filter((r) => r.status === "duplicate").length,
      ptmConflict: classified.filter((r) => r.ptmConflict).length,
      error: errorRows.length,
    };

    return { rows: allRows, summary };
  }
}
