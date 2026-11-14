/**
 * Chuẩn hóa mã số thuế / CCCD nhận từ form nhập tay hoặc file Excel import.
 *
 * Các dạng lỗi thường gặp cần xử lý (xem Review Focus #3, `00-tong-quan.md`):
 * - Excel lưu MST dạng số nên mất số 0 đầu (`317424086` phải là `0317424086`).
 * - Excel hiển thị số dạng `1101303612.0` (đuôi `.0` giả do ép kiểu float).
 * - Dán từ nơi khác kèm tab/khoảng trắng ở đầu/cuối.
 * - MST chi nhánh dạng `0101234567-001` phải giữ nguyên định dạng có gạch nối.
 * - MST cá nhân thực chất là CCCD 12 số, không được thêm số 0 đầu.
 */
export function normalizeTaxCode(raw: unknown): string {
  if (raw === null || raw === undefined) {
    return "";
  }

  let value = String(raw).trim();
  if (!value) {
    return "";
  }

  // Dạng chi nhánh (vd "0101234567-001"): giữ nguyên, chỉ trim khoảng trắng/tab.
  if (/^\d+-\d+$/.test(value)) {
    return value;
  }

  // Bỏ đuôi ".0" / ".00" do Excel ép số nguyên thành float (vd "1101303612.0").
  value = value.replace(/\.0+$/, "");

  // Chỉ xử lý tiếp nếu toàn bộ là chữ số (loại CCCD có ký tự khác để nguyên).
  if (/^\d+$/.test(value)) {
    // MST doanh nghiệp chuẩn có 10 hoặc 13 số; nếu Excel làm mất số 0 đầu thì
    // độ dài còn lại thường là 9 hoặc 12 (10-1, 13-1). CCCD cá nhân luôn đủ
    // 12 số nên không được đụng tới.
    if (value.length === 9) {
      return `0${value}`;
    }
    if (value.length === 12) {
      return value;
    }
  }

  return value;
}
