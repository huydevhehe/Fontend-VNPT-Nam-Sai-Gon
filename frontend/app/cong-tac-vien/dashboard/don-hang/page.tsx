import CtvTopbar from "@/components/ctv/CtvTopbar";
import { DON_HANG_LIST } from "@/content/ctv-mock";

function statusStyle(status: string) {
  if (status === "Hoàn tất") return "bg-emerald-50 text-emerald-600";
  if (status === "Chờ xử lý") return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-600";
}

export default function DonHangPage() {
  return (
    <div>
      <CtvTopbar title="Đơn hàng" subtitle="Danh sách đơn hàng phát sinh từ khách hàng bạn giới thiệu" />

      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Mã đơn</th>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Sản phẩm</th>
                <th className="px-4 py-3 font-medium">Giá trị</th>
                <th className="px-4 py-3 font-medium">Ngày đặt</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {DON_HANG_LIST.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{d.id}</td>
                  <td className="px-4 py-3 text-slate-600">{d.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{d.product}</td>
                  <td className="px-4 py-3 text-slate-600">{d.amount}</td>
                  <td className="px-4 py-3 text-slate-400">{d.date}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${statusStyle(d.status)}`}>
                      {d.status}
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
