import { CheckCircle2 } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import { THANH_TOAN_LIST } from "@/content/ctv-mock";

export default function ThanhToanPage() {
  return (
    <div>
      <CtvTopbar title="Thanh toán" subtitle="Lịch sử thanh toán hoa hồng" />

      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Mã giao dịch</th>
                <th className="px-4 py-3 font-medium">Ngày thanh toán</th>
                <th className="px-4 py-3 font-medium">Số tiền</th>
                <th className="px-4 py-3 font-medium">Hình thức</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {THANH_TOAN_LIST.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{t.id}</td>
                  <td className="px-4 py-3 text-slate-400">{t.date}</td>
                  <td className="px-4 py-3 font-semibold text-vnpt">{t.amount}</td>
                  <td className="px-4 py-3 text-slate-600">{t.method}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 size={13} /> {t.status}
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
