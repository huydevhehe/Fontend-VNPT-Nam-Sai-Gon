const POSITIVE = new Set(["Chốt thành công", "Hoàn tất", "Đã thanh toán", "Đã chi", "Đã nhận"]);
const NEGATIVE = new Set(["Thất bại", "Hủy", "Tạm dừng"]);

export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

export default function CtvStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-slate-300">—</span>;
  }
  const tone = POSITIVE.has(status)
    ? "bg-emerald-50 text-emerald-600"
    : NEGATIVE.has(status)
      ? "bg-red-50 text-red-600"
      : "bg-amber-50 text-amber-600";
  return <span className={`rounded px-2 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
