import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Check,
  ChevronDown,
  FileDown,
  FileText,
  Globe,
  Headset,
  Leaf,
  Package,
  Receipt,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import LeadForm from "@/components/sections/LeadForm";
import { categories, getCategoryBySlug } from "@/content/category-map";
import { getCategoryProducts, getProductInCatalog } from "@/content/category-products";

const BADGES = ["Đúng pháp luật", "An toàn bảo mật", "Tiết kiệm chi phí", "Dễ tra cứu"];

const LOI_ICH = [
  { icon: Receipt, title: "Tiết kiệm chi phí", desc: "In ấn, lưu trữ, vận chuyển" },
  { icon: ShieldCheck, title: "Đúng quy định", desc: "Đáp ứng đầy đủ quy định của pháp luật" },
  { icon: Award, title: "An toàn – Bảo mật", desc: "Hệ thống bảo mật đạt chuẩn ISO/IEC 27001" },
  { icon: Zap, title: "Tăng hiệu quả", desc: "Xử lý tự động, giảm thời gian và nhân sự" },
  { icon: Leaf, title: "Thân thiện môi trường", desc: "Hạn chế giấy tờ, góp phần bảo vệ môi trường" },
];

const TAI_LIEU = [
  { name: "Brochure sản phẩm", size: "2.4 MB" },
  { name: "Hướng dẫn sử dụng", size: "3.1 MB" },
  { name: "Bảng giá dịch vụ", size: "1.8 MB" },
];

const TRUST = [
  { icon: Globe, title: "Đơn vị viễn thông quốc gia", desc: "Thương hiệu uy tín 25+ năm" },
  { icon: Zap, title: "Hạ tầng mạnh mẽ", desc: "Kết nối 63 tỉnh thành" },
  { icon: ShieldCheck, title: "An toàn bảo mật", desc: "Đạt chuẩn ISO/IEC 27001" },
  { icon: Headset, title: "Hỗ trợ 24/7", desc: "Đội ngũ chuyên nghiệp" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ danhMuc: string; slug: string }>;
}): Promise<Metadata> {
  const { danhMuc, slug } = await params;
  const product = getProductInCatalog(danhMuc, slug);
  return { title: product ? `${product.title} — VNPT Nam Sài Gòn` : "Sản phẩm" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ danhMuc: string; slug: string }>;
}) {
  const { danhMuc, slug } = await params;
  const category = getCategoryBySlug(danhMuc);
  const product = getProductInCatalog(danhMuc, slug);
  if (!category || !product) notFound();

  const related = getCategoryProducts(category.slug)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản phẩm", href: "/san-pham" },
          { label: category.name, href: `/san-pham/${category.slug}` },
          { label: product.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[220px_1fr_320px]">
        {/* SIDEBAR DANH MỤC */}
        <aside className="hidden lg:block">
          <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
            <div className="bg-vnpt px-4 py-3 text-sm font-semibold text-white">
              DANH MỤC SẢN PHẨM
            </div>
            <ul className="divide-y divide-slate-50">
              {categories.map((c) => {
                const active = c.slug === category.slug;
                const items = active ? getCategoryProducts(c.slug) : [];
                return (
                  <li key={c.slug}>
                    <Link
                      href={`/san-pham/${c.slug}`}
                      className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                        active ? "font-semibold text-vnpt" : "text-slate-600 hover:text-vnpt"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <c.icon size={15} /> {c.name}
                      </span>
                      {items.length > 0 && <ChevronDown size={14} />}
                    </Link>
                    {items.length > 0 && (
                      <ul className="bg-vnpt-light/40 pb-1">
                        {items.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/san-pham/${c.slug}/${p.slug}`}
                              className={`block px-8 py-1.5 text-sm ${
                                p.slug === product.slug
                                  ? "font-semibold text-vnpt"
                                  : "text-slate-500 hover:text-vnpt"
                              }`}
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 p-4 text-center shadow-sm">
            <Headset size={22} className="mx-auto text-vnpt" />
            <p className="mt-2 text-sm text-slate-600">Bạn cần hỗ trợ tư vấn?</p>
            <a href="tel:0838999333" className="mt-1 block text-sm font-bold text-vnpt">
              Gọi ngay 0838 999 333
            </a>
          </div>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{product.title}</h1>
          <p className="mt-1 font-medium text-emerald-600">{product.shortDesc}</p>

          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div className="relative h-64 overflow-hidden rounded-xl bg-vnpt-darker">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package size={56} className="text-white/70" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-600">{product.bodyText}</p>
              <ul className="mt-4 space-y-2">
                {BADGES.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={16} className="shrink-0 text-vnpt" /> {b}
                  </li>
                ))}
                {product.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={16} className="shrink-0 text-vnpt" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/lien-he"
                  className="rounded-md bg-vnpt px-4 py-2 text-sm font-semibold text-white hover:bg-vnpt-dark"
                >
                  ĐĂNG KÝ TƯ VẤN
                </Link>
                <Link
                  href="/lien-he"
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-vnpt hover:text-vnpt"
                >
                  NHẬN BÁO GIÁ
                </Link>
                <a
                  href="#tai-lieu"
                  className="flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-vnpt hover:text-vnpt"
                >
                  <FileDown size={15} /> TẢI BROCHURE
                </a>
              </div>
            </div>
          </div>

          {/* TABS ANCHOR */}
          <nav className="mt-8 flex flex-wrap gap-6 border-b border-slate-100 text-sm font-semibold text-slate-500">
            <a href="#tong-quan" className="border-b-2 border-vnpt pb-3 text-vnpt">
              TỔNG QUAN
            </a>
            <a href="#tinh-nang" className="pb-3 hover:text-vnpt">
              TÍNH NĂNG
            </a>
            <a href="#loi-ich" className="pb-3 hover:text-vnpt">
              LỢI ÍCH
            </a>
            {product.pricing.length > 0 && (
              <a href="#bang-gia" className="pb-3 hover:text-vnpt">
                BẢNG GIÁ
              </a>
            )}
            <a href="#faq" className="pb-3 hover:text-vnpt">
              FAQ
            </a>
          </nav>

          {product.features.length > 0 && (
            <div id="tinh-nang" className="mt-8 scroll-mt-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 id="tong-quan" className="scroll-mt-24 text-lg font-bold text-slate-800">
                  Tính năng nổi bật
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.features.map((f) => (
                  <div key={f} className="rounded-xl border border-slate-100 p-4">
                    <Check size={20} className="text-vnpt" />
                    <div className="mt-2 text-sm font-semibold text-slate-800">{f}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="loi-ich" className="mt-10 scroll-mt-24">
            <h2 className="mb-4 text-lg font-bold text-slate-800">
              Lợi ích khi sử dụng {product.title}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {LOI_ICH.map((l) => (
                <div key={l.title} className="rounded-xl border border-slate-100 p-4 text-center">
                  <l.icon size={24} className="mx-auto text-vnpt" />
                  <div className="mt-2 text-sm font-semibold text-slate-800">{l.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{l.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {product.pricing.length > 0 && (
            <div id="bang-gia" className="mt-10 scroll-mt-24">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Bảng giá</h2>
              <PricingTable pricing={product.pricing} />
            </div>
          )}

          <div id="faq" className="mt-10 scroll-mt-24">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Câu hỏi thường gặp</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-800">
                  {product.title} có phù hợp với doanh nghiệp nhỏ không?
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Có. {product.title} được thiết kế linh hoạt, phù hợp với cả hộ kinh doanh,
                  doanh nghiệp nhỏ lẫn doanh nghiệp lớn.
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-4">
                <div className="text-sm font-semibold text-slate-800">
                  Thời gian triển khai mất bao lâu?
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Đội ngũ VNPT Nam Sài Gòn hỗ trợ khởi tạo và bàn giao trong thời gian ngắn
                  nhất sau khi đăng ký.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR PHẢI */}
        <div className="space-y-6">
          <LeadForm title="Đăng ký tư vấn miễn phí" interestOptions={[category.name]} showCompany />

          <div id="tai-lieu" className="scroll-mt-24 rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">TÀI LIỆU LIÊN QUAN</h3>
            <ul className="space-y-2">
              {TAI_LIEU.map((t) => (
                <li key={t.name} className="flex items-center gap-2 text-sm text-slate-600">
                  <FileText size={16} className="shrink-0 text-vnpt" />
                  <span className="flex-1">{t.name}</span>
                  <span className="text-xs text-slate-400">{t.size}</span>
                </li>
              ))}
            </ul>
          </div>

          {related.length > 0 && (
            <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">SẢN PHẨM LIÊN QUAN</h3>
              <ul className="space-y-2">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/san-pham/${category.slug}/${p.slug}`}
                      className="text-sm text-slate-600 hover:text-vnpt"
                    >
                      {p.title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 rounded-xl bg-vnpt-light py-6 sm:grid-cols-4">
        {TRUST.map((t) => (
          <div key={t.title} className="flex items-center justify-center gap-2 text-center">
            <t.icon size={22} className="shrink-0 text-vnpt" />
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800">{t.title}</div>
              <div className="text-xs text-slate-500">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
