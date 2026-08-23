import Image from "next/image";
import Link from "next/link";
import { Check, type LucideIcon } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import type { Product } from "@/lib/types";

export type InternetLandingProps = {
  /** Tên nhóm hiển thị trên breadcrumb và tiêu đề. */
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  /** Điểm nổi bật cạnh tiêu đề hero. */
  highlights: { icon: LucideIcon; title: string; desc: string }[];
  /** Lý do chọn dịch vụ, hiển thị dạng checklist. */
  reasons: string[];
  packages: Product[];
  lowestPrice?: string;
  /** Nhãn cột giá trong bảng tổng hợp. */
  priceLabel?: string;
};

export default function InternetLanding({
  name,
  heroTitle,
  heroSubtitle,
  heroImage,
  highlights,
  reasons,
  packages,
  lowestPrice,
  priceLabel = "Giá/tháng",
}: Readonly<InternetLandingProps>) {
  const summary = {
    name: `BẢNG GIÁ ${name.toUpperCase()}`,
    columns: ["Gói cước", "Tốc độ / Nội dung", priceLabel],
    rows: packages.map((p) => [
      p.title,
      p.features[0] ?? p.shortDesc,
      p.pricing[0]?.rows[0]?.slice(1).find((c) => c.includes("đ")) ?? "Liên hệ",
    ]),
    note: "Giá tham khảo, có thể thay đổi theo chính sách từng thời điểm và khu vực.",
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Internet / Truyền hình", href: "/san-pham/bang-rong-co-dinh" },
              { label: name },
            ]}
          />

          <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="mt-2 leading-tight">{heroTitle}</h1>
              <p className="mt-3 text-white/85">{heroSubtitle}</p>
              {lowestPrice && (
                <p className="mt-4 text-lg font-semibold">
                  Chỉ từ <span className="text-vnpt-accent">{lowestPrice}</span>
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {highlights.map((h) => (
                  <div key={h.title} className="flex items-center gap-2">
                    <h.icon size={20} className="shrink-0 text-vnpt-accent" />
                    <div className="text-xs leading-tight">
                      <div className="font-semibold">{h.title}</div>
                      <div className="text-white/70">{h.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/lien-he"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
                >
                  ĐĂNG KÝ NGAY
                </Link>
                <Link
                  href="#bang-gia"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  XEM BẢNG GIÁ
                </Link>
              </div>
            </div>

            <div className="relative hidden h-72 overflow-hidden rounded-2xl lg:block">
              <Image
                src={heroImage}
                alt={name}
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DANH SÁCH GÓI CƯỚC */}
      <section id="bang-gia" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-12">
        <h2 className="text-center text-slate-800">GÓI CƯỚC {name.toUpperCase()}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">
          {packages.length} gói cước, phù hợp nhiều mức nhu cầu và ngân sách.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => {
            const price = p.pricing[0]?.rows[0]?.slice(1).find((c) => c.includes("đ"));
            return (
              <div
                key={p.id}
                className="flex flex-col rounded-xl border border-slate-100 p-5 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <h3 className="text-slate-800">{p.title}</h3>
                <p className="mt-1 text-lg font-bold text-vnpt">{price ?? "Liên hệ"}</p>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {p.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <Check size={13} className="mt-0.5 shrink-0 text-vnpt" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/lien-he"
                  className="mt-4 rounded-md bg-vnpt py-2 text-center text-sm font-semibold text-white hover:bg-vnpt-dark"
                >
                  ĐĂNG KÝ
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* BẢNG GIÁ TỔNG HỢP */}
      {packages.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-12">
          <PricingTable pricing={[summary]} />
        </section>
      )}

      {/* VÌ SAO CHỌN */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">VÌ SAO CHỌN {name.toUpperCase()}?</h2>
          <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
            {reasons.map((r) => (
              <li
                key={r}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-700"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-vnpt-darker to-vnpt p-8 text-center text-white lg:flex-row lg:text-left">
          <div>
            <div className="text-lg font-bold">Cần tư vấn gói cước phù hợp?</div>
            <p className="mt-1 text-sm text-white/80">
              Đội ngũ VNPT Nam Sài Gòn hỗ trợ khảo sát hạ tầng và tư vấn miễn phí.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/lien-he"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
            >
              ĐĂNG KÝ TƯ VẤN
            </Link>
            <a
              href="tel:0838999333"
              className="rounded-md border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Hotline: 0838 999 333
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
