interface StatusBadgeProps {
  status: string;
  variant?: "green" | "amber" | "red" | "blue" | "slate";
  title?: string;
}

export default function StatusBadge({ status, variant, title }: StatusBadgeProps) {
  let resolvedVariant = variant;

  if (!resolvedVariant) {
    const s = status.toLowerCase();
    if (
      s.includes("hoàn tất") ||
      s.includes("hoàn thành") ||
      s.includes("đã gạch nợ") ||
      s.includes("đã thanh toán") ||
      s.includes("chốt thành công") ||
      s.includes("đã nhận") ||
      s.includes("đang hoạt động")
    ) {
      resolvedVariant = "green";
    } else if (
      s.includes("đình chỉ") ||
      s.includes("hẹn") ||
      s.includes("đang làm") ||
      s.includes("đang tư vấn") ||
      s.includes("đang triển khai") ||
      s.includes("chờ") ||
      s.includes("trình ký") ||
      s.includes("cần xử lý")
    ) {
      resolvedVariant = "amber";
    } else if (s.includes("ngừng hoạt động")) {
      resolvedVariant = "slate";
    } else if (
      s.includes("nợ cước") ||
      s.includes("thất bại") ||
      s.includes("hủy") ||
      s.includes("quá hạn") ||
      s.includes("chưa thanh toán") ||
      s.includes("tạm ngưng") ||
      s.includes("thanh lý")
    ) {
      resolvedVariant = "red";
    } else {
      resolvedVariant = "blue";
    }
  }

  const colorStyles = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-700 border-amber-200/80",
    red: "bg-rose-50 text-rose-700 border-rose-200/80",
    blue: "bg-blue-50 text-blue-700 border-blue-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  }[resolvedVariant];

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap cursor-default ${colorStyles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

