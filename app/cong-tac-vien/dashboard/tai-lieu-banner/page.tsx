import { Download, FileText, Image as ImageIcon } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import { TAI_LIEU_HO_TRO } from "@/content/ctv-mock";

const BANNERS = [
  { name: "Banner Internet FiberVIP", size: "1200x628", image: "/images/hero/hero-fiber.jpg" },
  { name: "Banner Khuyến mãi tháng 5", size: "1200x628", image: "/images/khuyen-mai/banner-khuyen-mai.png" },
  { name: "Banner Cloud & IDC", size: "1200x628", image: "/images/hero/hero-datacenter.jpg" },
];

export default function TaiLieuBannerPage() {
  return (
    <div>
      <CtvTopbar title="Tài liệu & Banner" subtitle="Tài liệu hướng dẫn và banner quảng cáo hỗ trợ giới thiệu khách hàng" />

      <div className="space-y-6 p-6">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <FileText size={15} className="text-vnpt-accent" /> Tài liệu hướng dẫn
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TAI_LIEU_HO_TRO.map((t) => (
              <div
                key={t.title}
                className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm"
              >
                <div>
                  <div className="font-medium text-slate-700">{t.title}</div>
                  <div className="text-xs text-slate-400">{t.size}</div>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md border border-vnpt px-3 py-1.5 text-xs font-semibold text-vnpt hover:bg-vnpt-light"
                >
                  <Download size={13} /> Tải xuống
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <ImageIcon size={15} className="text-vnpt-accent" /> Banner quảng cáo
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {BANNERS.map((b) => (
              <div key={b.name} className="overflow-hidden rounded-lg border border-slate-100">
                <div
                  className="h-28 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${b.image})` }}
                  role="img"
                  aria-label={b.name}
                />
                <div className="p-3">
                  <div className="text-xs font-semibold text-slate-700">{b.name}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">{b.size}px</div>
                  <button
                    type="button"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-vnpt py-1.5 text-xs font-semibold text-vnpt hover:bg-vnpt-light"
                  >
                    <Download size={13} /> Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
