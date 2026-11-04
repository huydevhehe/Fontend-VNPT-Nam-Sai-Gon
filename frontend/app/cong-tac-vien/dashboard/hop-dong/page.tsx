import CtvTopbar from "@/components/ctv/CtvTopbar";
import { HOP_DONG_MOI_NHAT } from "@/content/ctv-mock";

function statusStyle(status: string) {
  if (status === "Đã duyệt") return "bg-emerald-50 text-emerald-600";
  if (status === "Đang xử lý") return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-600";
}

export default function HopDongPage() {
  const total = HOP_DONG_MOI_NHAT.length;
  const approved = HOP_DONG_MOI_NHAT.filter((h) => h.status === "Đã duyệt").length;

  return (
    <div>
      <CtvTopbar title="Hợp đồng" subtitle="Danh sách hợp đồng phát sinh từ khách hàng bạn giới thiệu" />

      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Tổng hợp đồng</div>
            <div className="mt-1 text-xl font-extrabold text-slate-800">{total}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Đã duyệt</div>
            <div className="mt-1 text-xl font-extrabold text-emerald-600">{approved}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Đang xử lý</div>
            <div className="mt-1 text-xl font-extrabold text-amber-600">{total - approved}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Mã hợp đồng</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Giá trị</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {HOP_DONG_MOI_NHAT.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.id}</td>
                  <td className="px-4 py-3 text-slate-600">{h.product}</td>
                  <td className="px-4 py-3 text-slate-600">{h.value}</td>
                  <td className="px-4 py-3 text-slate-400">{h.date}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle(h.status)}`}>
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
