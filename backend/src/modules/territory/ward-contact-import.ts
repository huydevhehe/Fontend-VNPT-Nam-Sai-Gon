import { stripDiacritics } from "./ward-name.js";

export interface WardContactImportItem {
  rowNumber: number;
  wardName: string;
  unit: string;
  department: string;
  fullName: string;
  position: string;
  phone: string;
  amInCharge: string;
}

export interface ParseWardContactRowsResult {
  items: WardContactImportItem[];
  skipped: number;
}

// Khớp tên cột không phân biệt hoa thường/dấu — sheet thật có thể gõ
// "Chức" hoặc "Chức vụ", "Tên Phường" hoặc "TÊN PHƯỜNG"...
function normalizeHeaderKey(key: string): string {
  return stripDiacritics(key.trim().toLowerCase()).replace(/\s+/g, " ").trim();
}

const HEADER_CANDIDATES: Record<keyof Omit<WardContactImportItem, "rowNumber">, string[]> = {
  wardName: ["ten phuong"],
  unit: ["don vi"],
  department: ["phong ban"],
  fullName: ["ho ten"],
  position: ["chuc vu", "chuc"],
  phone: ["sdt"],
  amInCharge: ["am phu trach"],
};

function buildFieldValueGetter(row: Record<string, unknown>) {
  const normalizedKeys = Object.keys(row).map((key) => ({ key, normalized: normalizeHeaderKey(key) }));
  return (candidates: string[]): string => {
    for (const candidate of candidates) {
      const match = normalizedKeys.find((k) => k.normalized === candidate);
      if (match) {
        const raw = row[match.key];
        if (raw === undefined || raw === null) return "";
        return String(raw).trim();
      }
    }
    return "";
  };
}

/**
 * Nhận kết quả `XLSX.utils.sheet_to_json` cho sheet "PhườngXã" và trả về các
 * dòng hợp lệ (có Tên Phường và ít nhất Đơn vị hoặc Chức) + số dòng bỏ qua
 * lặng lẽ (trống hoặc chỉ có STT). Không kiểm tra phường có tồn tại hay đủ
 * các trường bắt buộc khác — việc đó do `TerritoryService.importWardContacts`
 * xử lý để có thể báo lỗi theo từng dòng.
 */
export function parseWardContactRows(rows: Record<string, unknown>[]): ParseWardContactRowsResult {
  const items: WardContactImportItem[] = [];
  let skipped = 0;

  rows.forEach((row, index) => {
    // Dòng đầu tiên của dữ liệu (sau header) là dòng 2 của sheet.
    const rowNumber = index + 2;
    const getValue = buildFieldValueGetter(row);

    const wardName = getValue(HEADER_CANDIDATES.wardName);
    const unit = getValue(HEADER_CANDIDATES.unit);
    const department = getValue(HEADER_CANDIDATES.department);
    const fullName = getValue(HEADER_CANDIDATES.fullName);
    const position = getValue(HEADER_CANDIDATES.position);
    const phone = getValue(HEADER_CANDIDATES.phone);
    const amInCharge = getValue(HEADER_CANDIDATES.amInCharge);

    if (!wardName || (!unit && !position)) {
      skipped++;
      return;
    }

    items.push({ rowNumber, wardName, unit, department, fullName, position, phone, amInCharge });
  });

  return { items, skipped };
}
