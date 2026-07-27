import CtvTopbar from "@/components/ctv/CtvTopbar";
import { HOA_HONG_LIST } from "@/content/ctv-mock";

export default function HoaHongPage() {
  const pending = HOA_HONG_LIST.find((h) => h.status === "Chờ thanh toán");

  return (
    <div>
      <CtvTopbar title="Hoa hồng" subtitle="Chi tiết hoa hồng theo từng tháng" />

      <div className="space-y-4 p-6">
        {pending && (
          <div className="rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-5 text-white shadow-sm">
            <div className="text-xs text-white/75">Hoa hồng chờ thanh toán tháng {pending.month}</div>
            <div className="mt-1 text-2xl font-extrabold">{pending.commission}</div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Tháng</th>
                <th className="px-4 py-3 font-medium">Doanh số</th>
                <th className="px-4 py-3 font-medium">Tỷ lệ hoa hồng</th>
                <th className="px-4 py-3 font-medium">Hoa hồng</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {HOA_HONG_LIST.map((h) => (
                <tr key={h.month} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.month}</td>
                  <td className="px-4 py-3 text-slate-600">{h.revenue}</td>
                  <td className="px-4 py-3 text-slate-600">{h.rate}</td>
                  <td className="px-4 py-3 font-semibold text-vnpt">{h.commission}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        h.status === "Đã thanh toán" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
