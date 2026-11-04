import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  isPositive?: boolean;
  icon?: LucideIcon;
  badge?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  changeText,
  isPositive = true,
  icon: Icon,
  badge,
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-vnpt">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="my-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        {badge && (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-vnpt">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || changeText) && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          {changeText && (
            <span
              className={`font-bold ${
                isPositive ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {changeText}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

