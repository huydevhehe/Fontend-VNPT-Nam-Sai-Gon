// Chuẩn hóa tên phường để so khớp khi tạo phường mới / import đầu mối.
// Bỏ tiền tố "phường"/"p.", bỏ dấu tiếng Việt (gồm đ -> d), hạ chữ thường,
// gộp khoảng trắng, trim. Dùng lại ở đợt 8 (import khách hàng).

const VIETNAMESE_DIACRITICS_MAP: Array<[RegExp, string]> = [
  [/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a"],
  [/[èéẹẻẽêềếệểễ]/g, "e"],
  [/[ìíịỉĩ]/g, "i"],
  [/[òóọỏõôồốộổỗơờớợởỡ]/g, "o"],
  [/[ùúụủũưừứựửữ]/g, "u"],
  [/[ỳýỵỷỹ]/g, "y"],
  [/đ/g, "d"],
];

function stripDiacritics(input: string): string {
  let result = input;
  for (const [pattern, replacement] of VIETNAMESE_DIACRITICS_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

const WARD_PREFIX_PATTERN = /^(phuong|p\.)\s*/i;

export function normalizeWardName(raw: string): string {
  if (typeof raw !== "string") {
    return "";
  }

  let value = raw.trim().toLowerCase();
  value = stripDiacritics(value);
  // Tiền tố phải được bỏ sau khi đã bỏ dấu (vd "Phường" -> "phuong") để khớp
  // cả bản gốc có dấu và bản đã gõ không dấu sẵn.
  value = value.replace(WARD_PREFIX_PATTERN, "");
  value = value.replace(/\s+/g, " ").trim();

  return value;
}
