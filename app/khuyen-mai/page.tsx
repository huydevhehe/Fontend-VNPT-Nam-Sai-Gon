import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  Cloud,
  Gift,
  Headset,
  Layers,
  Percent,
  PenTool,
  Receipt,
  ShieldCheck,
  Smartphone,
  Wallet,
  Wifi,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import { categories } from "@/content/category-map";
import { getAllPromotions, type Promotion } from "@/content/promotions";

export const metadata: Metadata = { title: "Khuyến mãi — VNPT Nam Sài Gòn" };

const DIEM_NOI_BAT = [
  { icon: Percent, label: "Ưu đãi hấp dẫn mỗi tháng" },
  { icon: Wallet, label: "Tiết kiệm chi phí tối đa" },
  { icon: ShieldCheck, label: "Dịch vụ uy tín, chất lượng" },
  { icon: Headset, label: "Hỗ trợ nhanh chóng 24/7" },
];

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "bang-rong-co-dinh": Wifi,
  "di-dong-vinaphone": Smartphone,
  "hoa-don-thue": Receipt,
  "chu-ky-so": PenTool,
  "cloud-idc": Cloud,
};

function PromoCard({ promo, large = false }: { promo: Promotion; large?: boolean }) {
  const Icon = CATEGORY_ICON[promo.categorySlug] ?? Gift;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 shadow-sm transition hover:shadow-md">
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-vnpt to-vnpt-dark text-white ${
          large ? "p-5" : "p-4"
        }`}
      >
        <Icon size={large ? 96 : 72} className="absolute -bottom-3 -right-3 text-white/10" />
        <span className="relative inline-block rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
          {promo.badge}
        </span>
        <p className={`relative mt-2 font-bold uppercase leading-snug ${large ? "text-lg" : "text-sm"}`}>
          {promo.title}
        </p>
        <p className={`relative mt-2 font-extrabold text-vnpt-accent ${large ? "text-3xl" : "text-2xl"}`}>
          {promo.discountLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-slate-800">{promo.title}</h3>
        <p className="text-xs text-slate-500">{promo.note}</p>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} /> Thời hạn: {promo.validUntil}
        </div>
        <Link
          href={`/khuyen-mai/${promo.slug}`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-vnpt px-3 py-1.5 text-xs font-semibold text-vnpt hover:bg-vnpt-light"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

export default function KhuyenMaiPage() {
  const promotions = getAllPromotions();
  const featured = promotions.slice(0, 3);
  const rest = promotions.slice(3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Khuyến mãi" }]} />

          <div className="mt-4 grid items-center gap-10 lg:grid-cols-[3fr_2fr]">
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl">KHUYẾN MÃI</h1>
              <p className="mt-2 text-white/85">
                Nhiều ưu đãi hấp dẫn dành cho cá nhân và doanh nghiệp
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {DIEM_NOI_BAT.map((d) => (
                  <div key={d.label} className="flex items-start gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <d.icon size={16} />
                    </span>
                    <span className="text-xs leading-tight text-white/85">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden h-52 items-center justify-center lg:flex">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-white/10">
                <Gift size={96} className="text-white/90" />
              </div>
              <span className="absolute left-2 top-2 flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-accent text-lg font-extrabold shadow-lg">
                %
              </span>
              <span className="absolute bottom-4 right-0 flex h-16 w-16 rotate-6 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-vnpt shadow-lg">
                -50%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {/* KHUYẾN MÃI NỔI BẬT */}
          <div className="mb-10">
            <h2 className="mb-4 text-lg font-bold text-slate-800">KHUYẾN MÃI NỔI BẬT</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {featured.map((promo) => (
                <PromoCard key={promo.slug} promo={promo} large />
              ))}
            </div>
          </div>

          {/* TẤT CẢ KHUYẾN MÃI */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-slate-800">TẤT CẢ KHUYẾN MÃI</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {rest.map((promo) => (
                <PromoCard key={promo.slug} promo={promo} />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-800">DANH MỤC KHUYẾN MÃI</h3>
            <ul className="space-y-1">
              <li>
                <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-vnpt">
                  <Layers size={15} /> Tất cả khuyến mãi
                </span>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/san-pham/${cat.slug}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-vnpt-light hover:text-vnpt"
                  >
                    <cat.icon size={15} /> {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <LeadForm
            title="NHẬN TƯ VẤN ƯU ĐÃI"
            subtitle="Đăng ký nhận thông tin khuyến mãi mới nhất từ VNPT Nam Sài Gòn"
          />
        </aside>
      </section>
    </div>
  );
}
