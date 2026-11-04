import CtvTopbar from "@/components/ctv/CtvTopbar";
import MonthlyBarChart from "@/components/ctv/MonthlyBarChart";
import { DOANH_SO_THEO_THANG } from "@/content/ctv-mock";

export default function DoanhSoPage() {
  const latest = DOANH_SO_THEO_THANG[DOANH_SO_THEO_THANG.length - 1];
  const prev = DOANH_SO_THEO_THANG[DOANH_SO_THEO_THANG.length - 2];
  const growth = (((latest.value - prev.value) / prev.value) * 100).toFixed(1);

  return (
    <div>
      <CtvTopbar title="Doanh số" subtitle="Doanh số phát sinh theo tháng" />

      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Doanh số tháng này</div>
            <div className="mt-1 text-xl font-extrabold text-slate-800">{latest.value.toFixed(1)} triệu đ</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Tăng trưởng so với tháng trước</div>
            <div className="mt-1 text-xl font-extrabold text-emerald-600">+{growth}%</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Trung bình 6 tháng</div>
            <div className="mt-1 text-xl font-extrabold text-slate-800">
              {(DOANH_SO_THEO_THANG.reduce((s, d) => s + d.value, 0) / DOANH_SO_THEO_THANG.length).toFixed(1)} triệu đ
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-800">Doanh số 6 tháng gần nhất</h2>
          <MonthlyBarChart data={DOANH_SO_THEO_THANG} />
        </div>
      </div>
    </div>
  );
}
