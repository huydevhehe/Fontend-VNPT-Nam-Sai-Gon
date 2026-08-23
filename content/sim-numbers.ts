// Đầu số VinaPhone và kho số mẫu phục vụ giao diện "chọn số".
//
// Đầu số là thông tin công khai của nhà mạng. Kho số bên dưới là DỮ LIỆU MẪU
// dùng để dựng giao diện — digishop chưa mở API kho số nên khi có nguồn thật
// chỉ cần thay mảng SIM_NUMBERS, phần giao diện giữ nguyên.

export type SimCategory = "tam-hoa" | "loc-phat" | "than-tai" | "so-tien" | "de-nho";

export type SimNumber = {
  number: string;
  /** Đầu số, dùng cho bộ lọc. */
  prefix: string;
  price: number;
  category: SimCategory;
  /** Trả trước / trả sau. */
  type: "tra-truoc" | "tra-sau";
};

export const SIM_PREFIXES = [
  { prefix: "091", desc: "Đầu số truyền thống" },
  { prefix: "094", desc: "Đầu số truyền thống" },
  { prefix: "088", desc: "Đầu số phổ biến" },
  { prefix: "083", desc: "Đầu số mới" },
  { prefix: "084", desc: "Đầu số mới" },
  { prefix: "085", desc: "Đầu số mới" },
  { prefix: "081", desc: "Đầu số mới" },
  { prefix: "082", desc: "Đầu số mới" },
];

export const SIM_CATEGORIES: { slug: SimCategory; label: string; desc: string }[] = [
  { slug: "tam-hoa", label: "Tam hoa", desc: "Ba số cuối giống nhau" },
  { slug: "loc-phat", label: "Lộc phát", desc: "Số đuôi 68, 86" },
  { slug: "than-tai", label: "Thần tài", desc: "Số đuôi 39, 79" },
  { slug: "so-tien", label: "Số tiến", desc: "Dãy số tăng dần" },
  { slug: "de-nho", label: "Dễ nhớ", desc: "Lặp cặp, dễ thuộc" },
];

/** Kho số mẫu — thay bằng dữ liệu thật khi có nguồn. */
export const SIM_NUMBERS: SimNumber[] = [
  { number: "091 234 5888", prefix: "091", price: 12000000, category: "tam-hoa", type: "tra-sau" },
  { number: "094 567 8999", prefix: "094", price: 15000000, category: "tam-hoa", type: "tra-sau" },
  { number: "088 999 2333", prefix: "088", price: 6500000, category: "tam-hoa", type: "tra-truoc" },
  { number: "083 456 7222", prefix: "083", price: 3500000, category: "tam-hoa", type: "tra-truoc" },
  { number: "091 868 6868", prefix: "091", price: 28000000, category: "loc-phat", type: "tra-sau" },
  { number: "094 686 8668", prefix: "094", price: 9800000, category: "loc-phat", type: "tra-sau" },
  { number: "085 668 6886", prefix: "085", price: 5200000, category: "loc-phat", type: "tra-truoc" },
  { number: "081 886 8668", prefix: "081", price: 4300000, category: "loc-phat", type: "tra-truoc" },
  { number: "091 379 3979", prefix: "091", price: 8600000, category: "than-tai", type: "tra-sau" },
  { number: "088 739 7939", prefix: "088", price: 4100000, category: "than-tai", type: "tra-truoc" },
  { number: "084 379 3979", prefix: "084", price: 3600000, category: "than-tai", type: "tra-truoc" },
  { number: "082 939 7979", prefix: "082", price: 5400000, category: "than-tai", type: "tra-truoc" },
  { number: "091 234 5678", prefix: "091", price: 45000000, category: "so-tien", type: "tra-sau" },
  { number: "094 123 4567", prefix: "094", price: 22000000, category: "so-tien", type: "tra-sau" },
  { number: "083 456 7890", prefix: "083", price: 7800000, category: "so-tien", type: "tra-truoc" },
  { number: "085 234 5678", prefix: "085", price: 9200000, category: "so-tien", type: "tra-truoc" },
  { number: "091 555 6677", prefix: "091", price: 3900000, category: "de-nho", type: "tra-sau" },
  { number: "088 121 2121", prefix: "088", price: 6700000, category: "de-nho", type: "tra-truoc" },
  { number: "082 090 9090", prefix: "082", price: 5800000, category: "de-nho", type: "tra-truoc" },
  { number: "084 111 2233", prefix: "084", price: 2900000, category: "de-nho", type: "tra-truoc" },
];

export function formatSimPrice(price: number): string {
  return `${price.toLocaleString("vi-VN")}đ`;
}
