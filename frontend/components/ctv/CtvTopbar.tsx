import { Bell, ChevronDown } from "lucide-react";
import { CTV_PROFILE } from "@/content/ctv-mock";

export default function CtvTopbar({
  title,
  subtitle,
  rangeLabel,
}: {
  title: string;
  subtitle?: string;
  rangeLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {rangeLabel && (
          <div className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 sm:flex">
            Thời gian: <span className="font-semibold text-slate-800">{rangeLabel}</span>
            <ChevronDown size={14} />
          </div>
        )}

        <button type="button" className="relative rounded-full p-2 text-slate-500 hover:bg-slate-50" aria-label="Thông báo">
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-vnpt-accent" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vnpt-light text-sm font-bold text-vnpt">
            {CTV_PROFILE.name
              .split(" ")
              .slice(-1)
              .join("")
              .charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-semibold text-slate-800">{CTV_PROFILE.name}</div>
            <div className="text-[11px] text-slate-400">
              {CTV_PROFILE.role} - Mã {CTV_PROFILE.code}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
