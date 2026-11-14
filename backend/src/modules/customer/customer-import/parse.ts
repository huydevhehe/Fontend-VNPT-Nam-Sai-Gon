import * as XLSX from "xlsx";
import { normalizeTaxCode } from "../../../utils/tax-code.js";

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

/**
 * Chuẩn hóa tên tiêu đề cột để so khớp bí danh: bỏ dấu tiếng Việt, hạ thường,
 * `_`/`-` → khoảng trắng, gộp khoảng trắng thừa. Dùng cho cả tiêu đề kiểu
 * VNPT ("TEN_KH", "MA_NHANVIEN") và tiêu đề tiếng Việt có dấu thông thường
 * (Review Focus #4, dot-08.md).
 */
export function normalizeHeader(h: unknown): string {
  const raw = String(h ?? "");
  const noAccents = raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
  return noAccents
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function endsWithWord(normalized: string, word: string): boolean {
  return normalized === word || normalized.endsWith(` ${word}`);
}

interface FieldAliasDef {
  field: keyof ImportRow;
  aliases: string[];
  exclude?: (normalized: string) => boolean;
}

const EXCLUDE_AS_SUFFIX = (normalized: string) => endsWithWord(normalized, "as");

const FIELD_ALIASES: FieldAliasDef[] = [
  { field: "name", aliases: ["ten khach hang", "ten kh", "ten doanh nghiep", "khach hang"] },
  { field: "taxCode", aliases: ["mst", "ma so thue", "cccd", "cmnd"] },
  { field: "customerCode", aliases: ["ma kh", "ma khach hang"] },
  { field: "customerType", aliases: ["loai kh", "loai khach hang"] },
  {
    field: "phone",
    aliases: [
      "so dien thoai",
      "sdt",
      "dien thoai",
      "thong tin lien he so dien thoai",
      "thong tin lien he sdt",
    ],
  },
  { field: "email", aliases: ["email", "thong tin lien he email"] },
  { field: "address", aliases: ["dia chi", "diachi"] },
  {
    field: "hrmCode",
    aliases: ["ma nhanvien", "ma nhan vien"],
    exclude: EXCLUDE_AS_SUFFIX,
  },
  {
    field: "staffNameInFile",
    aliases: ["ten nhanvien", "ten nhan vien"],
    exclude: EXCLUDE_AS_SUFFIX,
  },
  { field: "contactName", aliases: ["thong tin lien he ho ten"] },
  { field: "billingName", aliases: ["thong tin thanh toan ho ten"] },
  {
    field: "billingPhone",
    aliases: ["thong tin thanh toan so dien thoai", "thong tin thanh toan sdt"],
  },
  { field: "billingEmail", aliases: ["thong tin thanh toan email"] },
  { field: "teamName", aliases: ["nhom"] },
  { field: "salesChannel", aliases: ["kenh ban"] },
  { field: "note", aliases: ["ghi chu"] },
];

function collectHeaders(rows: Record<string, unknown>[]): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key !== "__rowNumber") set.add(key);
    }
  }
  return Array.from(set);
}

function buildHeaderMap(headers: string[]): Partial<Record<keyof ImportRow, string>> {
  const map: Partial<Record<keyof ImportRow, string>> = {};
  for (const { field, aliases, exclude } of FIELD_ALIASES) {
    const found = headers.find((h) => {
      const norm = normalizeHeader(h);
      if (!norm) return false;
      if (exclude && exclude(norm)) return false;
      return aliases.some((alias) => norm === alias || norm.startsWith(`${alias} `));
    });
    if (found) map[field] = found;
  }
  return map;
}

/**
 * Đọc buffer Excel thành danh sách object dòng dữ liệu (key = tiêu đề cột).
 * Hỗ trợ sheet "Khách hàng" có tiêu đề 2 dòng (dòng 2 là tiêu đề con của
 * "Thông tin liên hệ"/"Thông tin thanh toán"): ghép thành
 * "<tiêu đề cha> <tiêu đề con>" rồi parseCustomerSheet khớp bí danh trên
 * chuỗi đã ghép. Mỗi object có thêm field ẩn `__rowNumber` = số dòng Excel
 * thật (dòng tiêu đề đầu tiên là dòng 1) để parseCustomerSheet báo lỗi đúng dòng.
 */
export function readWorkbookRows(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const grid: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (grid.length === 0) return [];

  const row1 = (grid[0] || []).map((v) => String(v ?? "").trim());
  const row2 = grid.length > 1 ? (grid[1] || []).map((v) => String(v ?? "").trim()) : [];

  const hasSubHeader = row2.some((v) => normalizeHeader(v) === "ho ten");

  let headers: string[];
  let dataStartIndex: number;

  if (hasSubHeader) {
    let lastParent = "";
    headers = row1.map((cell, idx) => {
      if (cell) lastParent = cell;
      const child = row2[idx] || "";
      return child ? `${lastParent} ${child}`.trim() : lastParent;
    });
    dataStartIndex = 2;
  } else {
    headers = row1;
    dataStartIndex = 1;
  }

  const rows: Record<string, unknown>[] = [];
  for (let r = dataStartIndex; r < grid.length; r++) {
    const rowArr = grid[r] || [];
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      obj[h] = rowArr[idx] ?? "";
    });
    obj.__rowNumber = r + 1;
    rows.push(obj);
  }
  return rows;
}

/**
 * Chuẩn hóa danh sách dòng thô (key = tiêu đề cột, từ `readWorkbookRows` hoặc
 * trực tiếp `XLSX.utils.sheet_to_json`) thành `ImportRow[]` đã khớp cột theo
 * bí danh. Hàm thuần, không gọi DB.
 */
export function parseCustomerSheet(rows: Record<string, unknown>[]): {
  rows: ImportRow[];
  errors: { rowNumber: number; message: string }[];
} {
  const headers = collectHeaders(rows);
  const headerMap = buildHeaderMap(headers);

  const result: ImportRow[] = [];
  const errors: { rowNumber: number; message: string }[] = [];

  rows.forEach((raw, idx) => {
    const rowNumber =
      typeof raw.__rowNumber === "number" ? (raw.__rowNumber as number) : idx + 2;

    const get = (field: keyof ImportRow): string => {
      const header = headerMap[field];
      if (!header) return "";
      const value = raw[header];
      return value === null || value === undefined ? "" : String(value).trim();
    };

    const isEmptyRow = Object.entries(raw).every(([key, value]) => {
      if (key === "__rowNumber") return true;
      return value === null || value === undefined || String(value).trim() === "";
    });
    if (isEmptyRow) return;

    const name = get("name");
    if (!name) {
      errors.push({ rowNumber, message: "Thiếu tên khách hàng" });
      return;
    }

    const taxCodeRaw = get("taxCode");

    result.push({
      rowNumber,
      name,
      taxCode: taxCodeRaw ? normalizeTaxCode(taxCodeRaw) : "",
      customerCode: get("customerCode"),
      customerType: get("customerType"),
      phone: get("phone"),
      email: get("email"),
      address: get("address"),
      hrmCode: get("hrmCode"),
      staffNameInFile: get("staffNameInFile"),
      contactName: get("contactName"),
      billingName: get("billingName"),
      billingPhone: get("billingPhone"),
      billingEmail: get("billingEmail"),
      teamName: get("teamName"),
      salesChannel: get("salesChannel"),
      note: get("note"),
    });
  });

  return { rows: result, errors };
}
