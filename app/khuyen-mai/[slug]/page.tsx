import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Check,
  Clock,
  Gift,
  Headset,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import { getCategoryBySlug } from "@/content/category-map";
import { getAllPromotions, getPromotionBySlug } from "@/content/promotions";

const FEATURES = [
  { icon: Zap, title: "Ưu đãi hấp dẫn", desc: "Giá trị vượt trội" },
  { icon: ShieldCheck, title: "Chính hãng VNPT", desc: "Uy tín, đảm bảo" },
  { icon: Gift, title: "Quà tặng giá trị", desc: "Nhận ngay khi đăng ký" },
  { icon: Headset, title: "Hỗ trợ 24/7", desc: "Tận tâm, chuyên nghiệp" },
  { icon: Clock, title: "Đăng ký nhanh chóng", desc: "Chỉ trong vài phút" },
];

function splitDiscountLabel(label: string): { prefix: string; percent: string } {
  const match = label.match(/^(.*?)(\d+%)$/);
  if (!match) return { prefix: "", percent: label };
  return { prefix: match[1].trim(), percent: match[2] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const promo = getPromotionBySlug(slug);
  return { title: promo ? `${promo.title} — VNPT Nam Sài Gòn` : "Khuyến mãi" };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const promo = getPromotionBySlug(slug);
  if (!promo) notFound();

  const category = getCategoryBySlug(promo.categorySlug);
  const CategoryIcon = category?.icon ?? Gift;
  const { prefix, percent } = splitDiscountLabel(promo.discountLabel);

  const others = getAllPromotions()
    .filter((p) => p.slug !== promo.slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Khuyến mãi", href: "/khuyen-mai" },
          { label: promo.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* NỘI DUNG CHÍNH */}
        <div>
          {/* KHỐI ƯU ĐÃI CHÍNH */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt p-8 text-white">
            <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-10 backdrop-blur-sm md:block">
              <CategoryIcon size={72} className="text-white/80" />
            </div>
            <div className="relative max-w-md">
              <span className="inline-block rounded-md bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                {promo.badge}
              </span>
              <h1 className="mt-3 uppercase leading-tight">
                {promo.title}
              </h1>
              <p className="mt-2 text-white/85">{promo.subtitle}</p>
              <div className="mt-5 border-t border-white/15 pt-5">
                {prefix && <p className="text-sm text-white/70">{prefix}</p>}
                <p className="text-5xl font-extrabold text-vnpt-accent">{percent}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold">
                <Clock size={14} /> Ưu đãi có thời hạn
              </span>
            </div>
          </div>

          {/* 5 ICON TÍNH NĂNG */}
          <div className="mt-6 grid grid-cols-2 gap-y-4 rounded-xl border border-slate-100 p-4 shadow-sm sm:grid-cols-5 sm:divide-x sm:divide-slate-100">
            {FEATURES.map((f) => (
              <div key={f.title} className="text-center sm:px-2">
                <f.icon size={26} className="mx-auto text-vnpt" />
                <div className="mt-2 text-sm font-semibold text-slate-800">{f.title}</div>
                <div className="text-xs text-slate-500">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* NỘI DUNG ƯU ĐÃI */}
          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-800">NỘI DUNG ƯU ĐÃI</h2>
              <p className="mb-3 text-sm text-slate-500">
                Khi đăng ký {promo.title}, Quý khách hàng sẽ nhận ngay ưu đãi hấp dẫn:
              </p>
              <ul className="space-y-2.5">
                {promo.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {b}
                  </li>
                ))}
              </ul>
            </div>
            {promo.highlight.length > 0 && (
              <div className="h-fit space-y-4 rounded-xl bg-vnpt-light p-6">
                {promo.highlight.map((h) => (
                  <div key={h.label}>
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      {h.label}
                    </div>
                    <div className="text-2xl font-extrabold text-vnpt">{h.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ĐIỀU KIỆN ÁP DỤNG + THỜI HẠN */}
          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-800">ĐIỀU KIỆN ÁP DỤNG</h2>
              <ul className="space-y-2.5">
                {promo.conditions.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="h-fit rounded-xl border border-slate-100 p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-slate-800">THỜI HẠN KHUYẾN MÃI</h3>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="shrink-0 text-vnpt" />
                <div className="flex flex-1 items-center justify-between text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Từ ngày</div>
                    <div className="font-semibold text-slate-800">{promo.validFrom}</div>
                  </div>
                  <span className="px-2 text-slate-300">→</span>
                  <div>
                    <div className="text-xs text-slate-500">Đến hết ngày</div>
                    <div className="font-semibold text-slate-800">{promo.validUntil}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CÁC KHUYẾN MÃI KHÁC */}
          {others.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-bold text-slate-800">CÁC KHUYẾN MÃI KHÁC</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {others.map((p) => {
                  const OtherIcon = getCategoryBySlug(p.categorySlug)?.icon ?? Gift;
                  return (
                    <Link
                      key={p.slug}
                      href={`/khuyen-mai/${p.slug}`}
                      className="overflow-hidden rounded-xl border border-slate-100 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
                        <OtherIcon size={32} className="text-white" />
                      </div>
                      <div className="p-4">
                        <span className="text-xs font-semibold uppercase text-vnpt-accent">
                          {p.badge}
                        </span>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-800">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-vnpt">{p.discountLabel}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR PHẢI */}
        <div className="space-y-6">
          <LeadForm
            title="Đăng ký nhận ưu đãi"
            subtitle="Điền thông tin để được tư vấn và nhận ưu đãi nhanh nhất!"
            interestOptions={[promo.title]}
          />

          <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-slate-800">CẦN HỖ TRỢ?</h3>
            <p className="mb-3 text-xs text-slate-500">
              Đội ngũ VNPT Nam Sài Gòn sẵn sàng hỗ trợ 24/7
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-vnpt" />
                <div>
                  <a href="tel:0838999333" className="block font-semibold text-slate-800">
                    0838 999 333
                  </a>
                  <span className="text-xs text-slate-400">Hotline tư vấn miễn phí</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} className="shrink-0 text-vnpt" />
                <div>
                  <span className="block font-semibold text-slate-800">Chat Zalo OA</span>
                  <span className="text-xs text-slate-400">Chat ngay với chúng tôi</span>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0 text-vnpt" />
                <div>
                  <Link href="/lien-he" className="block font-semibold text-slate-800">
                    Đến cửa hàng
                  </Link>
                  <span className="text-xs text-slate-400">Tìm cửa hàng gần bạn</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-vnpt p-5 text-white">
            <Sparkles size={22} className="text-vnpt-accent" />
            <h3 className="mt-2 font-bold uppercase">Ưu đãi đặc biệt</h3>
            <p className="mt-1 text-sm text-white/80">
              Giới thiệu bạn bè đăng ký nhận ngay quà tặng hấp dẫn
            </p>
            <Link
              href="/lien-he"
              className="mt-3 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-vnpt hover:bg-white/90"
            >
              TÌM HIỂU NGAY
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
