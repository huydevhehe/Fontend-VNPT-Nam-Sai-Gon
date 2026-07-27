import { Search } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import { KHACH_HANG_LIST } from "@/content/ctv-mock";

function statusStyle(status: string) {
  if (status === "Đã chốt") return "bg-emerald-50 text-emerald-600";
  if (status === "Đang chăm sóc") return "bg-amber-50 text-amber-600";
  return "bg-sky-50 text-sky-600";
}

export default function KhachHangPage() {
  return (
    <div>
      <CtvTopbar title="Khách hàng" subtitle="Danh sách khách hàng bạn đang giới thiệu và chăm sóc" />

      <div className="p-6">
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div className="relative w-full max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Tìm theo tên, số điện thoại..."
                className="w-full rounded-md border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-vnpt"
              />
            </div>
            <span className="shrink-0 text-xs text-slate-400">{KHACH_HANG_LIST.length} khách hàng</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Mã KH</th>
                  <th className="px-4 py-3 font-medium">Khách hàng</th>
                  <th className="px-4 py-3 font-medium">Số điện thoại</th>
                  <th className="px-4 py-3 font-medium">Sản phẩm quan tâm</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Ngày cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {KHACH_HANG_LIST.map((k) => (
                  <tr key={k.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-700">{k.id}</td>
                    <td className="px-4 py-3 text-slate-700">{k.name}</td>
                    <td className="px-4 py-3 text-slate-500">{k.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{k.product}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle(k.status)}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{k.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
