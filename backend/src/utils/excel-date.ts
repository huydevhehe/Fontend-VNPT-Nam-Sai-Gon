const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Số ngày từ mốc Excel (1899-12-30, bù lỗi năm nhuận 1900) tới mốc Unix epoch. */
const EXCEL_EPOCH_OFFSET_DAYS = 25569;
const MS_PER_DAY = 86_400_000;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Chuẩn hoá giá trị ngày đọc từ Excel (số serial, `dd/mm/yyyy`, `yyyy-mm-dd`)
 * về dạng `YYYY-MM-DD`. Trả `null` nếu không nhận diện được (giá trị rác).
 */
export function parseExcelDate(v: unknown): string | null {
  if (v === null || v === undefined) {
    return null;
  }

  // Số serial Excel (hoặc object Date do thư viện xlsx tự convert).
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return null;
    return `${v.getUTCFullYear()}-${pad2(v.getUTCMonth() + 1)}-${pad2(v.getUTCDate())}`;
  }

  if (typeof v === "number") {
    if (!Number.isFinite(v) || v <= 0) return null;
    const ms = (v - EXCEL_EPOCH_OFFSET_DAYS) * MS_PER_DAY;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }

  if (typeof v !== "string") {
    return null;
  }

  const trimmed = v.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(ISO_DATE_PATTERN);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return isValidCalendarDate(year, month, day) ? `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}` : null;
  }

  const dmyMatch = trimmed.match(DMY_DATE_PATTERN);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    return isValidCalendarDate(year, month, day) ? `${year}-${pad2(month)}-${pad2(day)}` : null;
  }

  // Chuỗi số serial Excel (ô bị đọc thành text).
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseExcelDate(Number(trimmed));
  }

  return null;
}
