import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Package } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import ProductCard from "@/components/product/ProductCard";
import LeadForm from "@/components/sections/LeadForm";
import { categories, getCategoryBySlug } from "@/content/category-map";
import { getCategoryProducts, getProductInCatalog } from "@/content/category-products";

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

      <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{product.title}</h1>
          <p className="mt-2 text-slate-600">{product.shortDesc}</p>

          <div className="relative mt-6 flex h-64 items-center justify-center rounded-xl bg-vnpt-light">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.title} fill className="rounded-xl object-cover" />
            ) : (
              <Package size={56} className="text-vnpt" />
            )}
          </div>

          {product.features.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-slate-800">Tính năng nổi bật</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 rounded-lg border border-slate-100 p-3 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.pricing.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-bold text-slate-800">Bảng giá</h2>
              <PricingTable pricing={product.pricing} />
            </div>
          )}

          {product.bodyText && (
            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-slate-800">Chi tiết</h2>
              <p className="scraped-body text-sm text-slate-600">{product.bodyText}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <LeadForm title="Đăng ký tư vấn miễn phí" interestOptions={[category.name]} />
          <div>
            <h3 className="mb-3 font-semibold text-slate-800">Danh mục sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/san-pham/${c.slug}`}
                    className={c.slug === category.slug ? "font-semibold text-vnpt" : "text-slate-600 hover:text-vnpt"}
                  >
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Sản phẩm liên quan</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} categorySlug={category.slug} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
