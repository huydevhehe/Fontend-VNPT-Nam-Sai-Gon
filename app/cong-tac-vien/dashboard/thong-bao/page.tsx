import { Bell } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import { THONG_BAO } from "@/content/ctv-mock";

export default function ThongBaoPage() {
  return (
    <div>
      <CtvTopbar title="Thông báo" subtitle="Tin tức và cập nhật dành cho Cộng tác viên" />

      <div className="p-6">
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
          {THONG_BAO.map((t) => (
            <div key={t.title} className="flex items-start gap-3 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <Bell size={16} />
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                <div className="mt-0.5 text-xs text-slate-400">{t.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
