import CtvTopbar from "@/components/ctv/CtvTopbar";
import { SAN_PHAM_GIOI_THIEU } from "@/content/ctv-mock";

export default function SanPhamPage() {
  return (
    <div>
      <CtvTopbar title="Sản phẩm" subtitle="Danh sách sản phẩm và mức hoa hồng khi giới thiệu thành công" />

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAN_PHAM_GIOI_THIEU.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{p.desc}</p>
              <div className="mt-3 rounded-md bg-vnpt-light px-3 py-2 text-xs font-semibold text-vnpt">
                Hoa hồng: {p.commission}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
