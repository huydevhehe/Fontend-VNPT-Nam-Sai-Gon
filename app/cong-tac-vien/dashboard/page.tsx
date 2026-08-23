import Link from "next/link";
import {
  ArrowUpRight,
  Banknote,
  Bell,
  ChevronRight,
  Download,
  FileText,
  Handshake,
  Headset,
  Percent,
} from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import RevenueChart from "@/components/ctv/RevenueChart";
import ProductRatioChart from "@/components/ctv/ProductRatioChart";
import {
  CTV_STATS,
  HOA_HONG_CHO_THANH_TOAN,
  HOP_DONG_MOI_NHAT,
  PRODUCT_RATIO,
  REVENUE_CHART,
  TAI_LIEU_HO_TRO,
  THONG_BAO,
  TOP_SAN_PHAM,
} from "@/content/ctv-mock";

const STAT_ICONS = [Banknote, FileText, Percent, Handshake];

function statusStyle(status: string) {
  if (status === "Đã duyệt") return "bg-emerald-50 text-emerald-600";
  if (status === "Đang xử lý") return "bg-amber-50 text-amber-600";
  return "bg-red-50 text-red-600";
}

export default function CtvDashboardPage() {
  return (
    <div>
      <CtvTopbar
        title="Dashboard"
        subtitle="Tổng quan hoạt động"
        rangeLabel="Tháng này (05/05 - 31/05/2025)"
      />

      <div className="space-y-6 p-6">
        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CTV_STATS.map((s, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div key={s.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                    <Icon size={18} />
                  </span>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                    <ArrowUpRight size={13} /> {s.change}
                  </span>
                </div>
                <div className="mt-3 text-lg font-extrabold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
                <div className="mt-1 text-[11px] text-slate-400">{s.changeLabel}</div>
              </div>
            );
          })}
        </div>

        {/* CHARTS */}
        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Doanh số & Hoa hồng</h2>
              <span className="text-xs text-slate-400">Theo ngày</span>
            </div>
            <RevenueChart data={REVENUE_CHART} />
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold text-slate-800">Tỷ lệ sản phẩm</h2>
            <ProductRatioChart data={PRODUCT_RATIO} />
            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">
              {PRODUCT_RATIO.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name} <span className="ml-auto font-semibold text-slate-800">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLES */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Top sản phẩm bán chạy</h2>
            <div className="space-y-3">
              {TOP_SAN_PHAM.map((p, i) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {i + 1}. {p.name}
                    </span>
                    <span className="text-slate-400">{p.count} hợp đồng</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-vnpt" style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Hợp đồng mới nhất</h2>
            </div>
            <div className="space-y-2.5">
              {HOP_DONG_MOI_NHAT.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-700">{h.id}</div>
                    <div className="truncate text-slate-400">
                      {h.product} · {h.value}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded px-2 py-1 text-[10px] font-semibold ${statusStyle(h.status)}`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/cong-tac-vien/dashboard/hop-dong"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem tất cả <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Hoa hồng chờ thanh toán</h2>
            <div className="text-2xl font-extrabold text-vnpt">{HOA_HONG_CHO_THANH_TOAN.total}</div>
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
              {HOA_HONG_CHO_THANH_TOAN.months.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-xs text-slate-600">
                  <span>{m.month}</span>
                  <span className="font-semibold text-slate-800">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NOTIF + DOCS + CTA */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Bell size={15} className="text-vnpt-accent" /> Thông báo
            </h2>
            <ul className="space-y-2.5">
              {THONG_BAO.map((t) => (
                <li key={t.title} className="text-xs">
                  <div className="text-slate-700">{t.title}</div>
                  <div className="text-slate-400">{t.date}</div>
                </li>
              ))}
            </ul>
            <Link
              href="/cong-tac-vien/dashboard/thong-bao"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem tất cả <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <FileText size={15} className="text-vnpt-accent" /> Tài liệu hỗ trợ
            </h2>
            <ul className="space-y-2.5">
              {TAI_LIEU_HO_TRO.map((t) => (
                <li key={t.title} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{t.title}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    {t.size} <Download size={12} />
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/cong-tac-vien/dashboard/tai-lieu-banner"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem tất cả <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-5 text-white shadow-sm">
            <div>
              <Headset size={24} className="text-vnpt-accent" />
              <div className="mt-2 text-sm font-bold">Giới thiệu khách hàng</div>
              <p className="mt-1 text-xs text-white/75">Nhận hoa hồng hấp dẫn cho mỗi khách hàng mới.</p>
            </div>
            <Link
              href="/cong-tac-vien/dashboard/link-gioi-thieu"
              className="mt-4 rounded-md bg-white text-vnpt-dark px-3 py-2 text-center text-xs font-semibold hover:bg-slate-100"
            >
              TẠO LINK NGAY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
