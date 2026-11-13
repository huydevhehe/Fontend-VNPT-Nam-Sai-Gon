import { normalizeTaxCode } from "../../../utils/tax-code.js";
import type { ImportRow } from "./parse.js";

export interface ExistingCustomer {
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
  existing?: ExistingCustomer;
}

export interface ClassifiedRow {
  row: ImportRow;
  status: "new" | "duplicate" | "error";
  matches: RowMatch[];
  ptmConflict: boolean;
  resolvedStaffName: string | null;
  notes: string[];
}

function normalizeName(value: string | null | undefined): string {
  if (!value) return "";
  const noAccents = value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  return noAccents
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCode(value: string | null | undefined): string {
  return (value ?? "").trim().toUpperCase();
}

function normalizePhone(value: string | null | undefined): string {
  return (value ?? "").replace(/\D+/g, "");
}

function normalizeEmailStr(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

interface FieldDef {
  label: string;
  rowValues: (row: ImportRow) => string[];
  existingValues: (c: ExistingCustomer) => string[];
}

const FIELD_DEFS: FieldDef[] = [
  {
    label: "MST/CCCD",
    rowValues: (r) => [normalizeTaxCode(r.taxCode)],
    existingValues: (c) => [normalizeTaxCode(c.identity_code ?? "")],
  },
  {
    label: "Mã KH",
    rowValues: (r) => [normalizeCode(r.customerCode)],
    existingValues: (c) => [normalizeCode(c.customer_code)],
  },
  {
    label: "Tên",
    rowValues: (r) => [normalizeName(r.name)],
    existingValues: (c) => [normalizeName(c.name)],
  },
  {
    label: "SĐT",
    rowValues: (r) => [normalizePhone(r.phone), normalizePhone(r.billingPhone)],
    existingValues: (c) => [normalizePhone(c.phone), normalizePhone(c.billing_phone)],
  },
  {
    label: "Email",
    rowValues: (r) => [normalizeEmailStr(r.email), normalizeEmailStr(r.billingEmail)],
    existingValues: (c) => [normalizeEmailStr(c.contact_email), normalizeEmailStr(c.billing_email)],
  },
];

function uniqueNonEmpty(values: string[]): string[] {
  return Array.from(new Set(values.filter((v) => v)));
}

interface MatchAccumulator {
  customerId?: string;
  matchedRowNumber?: number;
  existing?: ExistingCustomer;
  fields: Set<string>;
}

/**
 * Phân loại danh sách dòng import đã chuẩn hóa (`ImportRow[]`) thành mới/trùng,
 * so trùng với khách đã có trong DB (`existing`) VÀ với các dòng khác trong
 * cùng file (Review Focus #1, #2 dot-08.md). Hàm thuần, không gọi DB — xây
 * index bằng Map cho từng trường để chạy O(n+m), không lặp O(n×m).
 */
export function classifyRows(
  rows: ImportRow[],
  existing: ExistingCustomer[],
  staffByHrm: Map<string, string>,
  defaultStaff: string | null
): ClassifiedRow[] {
  // Index khách đã có trong DB, theo từng field logic.
  const existingIndexByField = FIELD_DEFS.map((def) => {
    const map = new Map<string, ExistingCustomer[]>();
    for (const c of existing) {
      for (const value of uniqueNonEmpty(def.existingValues(c))) {
        const arr = map.get(value) ?? [];
        arr.push(c);
        map.set(value, arr);
      }
    }
    return map;
  });

  // Index trong-file: key -> danh sách rowNumber có giá trị đó, theo từng field logic.
  const inFileIndexByField = FIELD_DEFS.map((def) => {
    const map = new Map<string, number[]>();
    for (const row of rows) {
      for (const value of uniqueNonEmpty(def.rowValues(row))) {
        const arr = map.get(value) ?? [];
        if (!arr.includes(row.rowNumber)) arr.push(row.rowNumber);
        map.set(value, arr);
      }
    }
    return map;
  });

  function pickInFileTarget(group: number[] | undefined, selfRowNumber: number): number | null {
    if (!group || group.length < 2) return null;
    const others = group.filter((n) => n !== selfRowNumber);
    if (others.length === 0) return null;
    return Math.min(...others);
  }

  return rows.map((row) => {
    const targets = new Map<string, MatchAccumulator>();

    FIELD_DEFS.forEach((def, idx) => {
      const values = uniqueNonEmpty(def.rowValues(row));
      if (values.length === 0) return;

      // So với DB
      const matchedCustomers = new Map<string, ExistingCustomer>();
      for (const value of values) {
        const found = existingIndexByField[idx].get(value);
        if (found) {
          for (const c of found) matchedCustomers.set(c.id, c);
        }
      }
      for (const customer of matchedCustomers.values()) {
        const key = `customer:${customer.id}`;
        const acc = targets.get(key) ?? { customerId: customer.id, existing: customer, fields: new Set<string>() };
        acc.fields.add(def.label);
        targets.set(key, acc);
      }

      // So trong chính file
      const rowTargets = new Set<number>();
      for (const value of values) {
        const target = pickInFileTarget(inFileIndexByField[idx].get(value), row.rowNumber);
        if (target !== null) rowTargets.add(target);
      }
      for (const targetRowNumber of rowTargets) {
        const key = `row:${targetRowNumber}`;
        const acc = targets.get(key) ?? { matchedRowNumber: targetRowNumber, fields: new Set<string>() };
        acc.fields.add(def.label);
        targets.set(key, acc);
      }
    });

    const matches: RowMatch[] = Array.from(targets.values()).map((acc) => ({
      customerId: acc.customerId,
      matchedRowNumber: acc.matchedRowNumber,
      matchedFields: Array.from(acc.fields),
      existing: acc.existing,
    }));

    const ptmConflict = matches.some((m) => m.existing?.customer_group === "Tự phát triển");

    const notes: string[] = [];
    let resolvedStaffName: string | null = null;
    const hrmCode = row.hrmCode.trim();
    if (hrmCode && staffByHrm.get(hrmCode)) {
      resolvedStaffName = staffByHrm.get(hrmCode) ?? null;
    } else if (defaultStaff) {
      resolvedStaffName = defaultStaff;
    } else {
      resolvedStaffName = null;
      notes.push("Chưa xác định được AM chăm sóc, vui lòng chọn tay");
    }

    return {
      row,
      status: matches.length > 0 ? "duplicate" : "new",
      matches,
      ptmConflict,
      resolvedStaffName,
      notes,
    };
  });
}
