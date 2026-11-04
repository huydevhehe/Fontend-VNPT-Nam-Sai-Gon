"use client";

import { useEffect, useState } from "react";

interface StatusSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (next: T) => Promise<void>;
  disabled?: boolean;
}

type Variant = "green" | "amber" | "red" | "blue";

function resolveVariant(status: string): Variant {
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
    return "green";
  }
  if (
    s.includes("hẹn") ||
    s.includes("đang làm") ||
    s.includes("đang tư vấn") ||
    s.includes("đang triển khai") ||
    s.includes("chờ") ||
    s.includes("trình ký") ||
    s.includes("cần xử lý")
  ) {
    return "amber";
  }
  if (
    s.includes("nợ cước") ||
    s.includes("thất bại") ||
    s.includes("hủy") ||
    s.includes("quá hạn") ||
    s.includes("chưa thanh toán") ||
    s.includes("tạm ngưng") ||
    s.includes("thanh lý")
  ) {
    return "red";
  }
  return "blue";
}

const colorStyles: Record<Variant, string> = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  amber: "bg-amber-50 text-amber-700 border-amber-200/80",
  red: "bg-rose-50 text-rose-700 border-rose-200/80",
  blue: "bg-blue-50 text-blue-700 border-blue-200/80",
};

export default function StatusSelect<T extends string>({
  value,
  options,
  onChange,
  disabled,
}: StatusSelectProps<T>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  async function handleChange(next: T) {
    if (next === value) return;
    setPending(true);
    setError(null);
    try {
      await onChange(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cập nhật trạng thái thất bại."
      );
    } finally {
      setPending(false);
    }
  }

  const variant = resolveVariant(value);

  return (
    <div className="flex flex-col gap-1">
      <select
        value={value}
        disabled={disabled || pending}
        onChange={(e) => handleChange(e.target.value as T)}
        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold disabled:opacity-60 ${colorStyles[variant]}`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-[10px] font-medium text-rose-500">{error}</span>
      )}
    </div>
  );
}
