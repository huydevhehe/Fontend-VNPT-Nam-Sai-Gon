import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import { AUDIENCE_CONFIG, getAudienceBySlug } from "@/content/audience-map";

export function generateStaticParams() {
  return AUDIENCE_CONFIG.map((a) => ({ doiTuong: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ doiTuong: string }>;
}): Promise<Metadata> {
  const { doiTuong } = await params;
  const audience = getAudienceBySlug(doiTuong);
  return { title: audience ? `Giải pháp cho ${audience.label} — VNPT Nam Sài Gòn` : "Giải pháp" };
}

export default async function GiaiPhapPage({
  params,
}: {
  params: Promise<{ doiTuong: string }>;
}) {
  const { doiTuong } = await params;
  const audience = getAudienceBySlug(doiTuong);
  if (!audience) notFound();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Giải pháp" },
              { label: audience.label },
            ]}
          />
          <div className="mt-4 grid items-center gap-10 lg:grid-cols-[1fr_360px]">
            <div className="relative z-10 text-white">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                GIẢI PHÁP CHO
              </span>
              <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
                {audience.label.toUpperCase()}
              </h1>
              <p className="mt-3 max-w-lg text-white/85">{audience.heroDesc}</p>
              <ul className="mt-5 space-y-2">
                {audience.heroBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-white/85">
                    <ArrowRight size={15} className="mt-0.5 shrink-0 text-vnpt-accent" /> {b}
                  </li>
                ))}
              </ul>

              <div className="relative mt-7 hidden h-56 max-w-md overflow-hidden rounded-2xl lg:block">
                <Image src={audience.image} alt={audience.label} fill className="object-cover" />
              </div>
            </div>

            <LeadForm
              title={`Đăng ký tư vấn cho ${audience.label}`}
              subtitle="Nhận tư vấn giải pháp phù hợp!"
              interestOptions={[audience.label]}
            />
          </div>
        </div>
      </section>

      {/* DỊCH VỤ DÀNH CHO ĐỐI TƯỢNG */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-xl font-bold text-slate-800">
          DỊCH VỤ DÀNH CHO {audience.label.toUpperCase()}
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {audience.services.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="flex flex-col rounded-xl border border-slate-100 p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <s.icon size={24} />
              </div>
              <h3 className="mt-3 font-semibold text-slate-800">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              {s.price && <p className="mt-2 text-sm font-semibold text-vnpt">{s.price}</p>}
              <span className="mt-3 text-sm font-semibold text-vnpt">Xem chi tiết →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* LỢI ÍCH */}
      <section className="bg-vnpt-light px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-xl font-bold text-slate-800">
            LỢI ÍCH KHI SỬ DỤNG DỊCH VỤ VNPT
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {audience.benefits.map((b) => (
              <div key={b.title} className="text-center">
                <b.icon size={26} className="mx-auto text-vnpt" />
                <div className="mt-2 text-sm font-bold text-slate-800">{b.title}</div>
                <p className="mt-1 text-xs text-slate-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KHÁCH HÀNG TIÊU BIỂU */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 text-center text-xl font-bold text-slate-800">
          {audience.customerTitle.toUpperCase()}
        </h2>
        <div className="grid items-center gap-8 rounded-xl border border-slate-100 p-6 shadow-sm lg:grid-cols-[280px_1fr]">
          <div className="relative h-48 overflow-hidden rounded-xl lg:h-full">
            <Image src={audience.image} alt={audience.customerName} fill className="object-cover" />
          </div>
          <div>
            <Quote size={28} className="text-vnpt/30" />
            <p className="mt-2 text-lg font-medium italic text-slate-700">
              {audience.customerQuote}
            </p>
            <p className="mt-3 text-sm font-semibold text-vnpt">{audience.customerName}</p>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
              {audience.stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-extrabold text-vnpt">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA CUỐI TRANG */}
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-12 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl font-extrabold">
            Sẵn sàng đồng hành cùng VNPT Nam Sài Gòn?
          </h2>
          <p className="mt-2 text-white/80">
            Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ {audience.label.toLowerCase()} 24/7.
          </p>
          <Link
            href="/lien-he"
            className="mt-5 inline-block rounded-md bg-vnpt-accent px-6 py-3 text-sm font-semibold hover:bg-orange-600"
          >
            ĐĂNG KÝ TƯ VẤN NGAY
          </Link>
        </div>
      </section>
    </div>
  );
}
