import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { categories } from "@/content/category-map";
import { getCategoryProducts } from "@/content/category-products";

export const metadata: Metadata = { title: "Danh mục sản phẩm — VNPT Nam Sài Gòn" };

export default function SanPhamPage() {
  return (
    <div>
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]} />
          <h1 className="mt-3 text-3xl font-extrabold text-slate-800">DANH MỤC SẢN PHẨM</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Các sản phẩm - dịch vụ của VNPT giúp cá nhân, doanh nghiệp và tổ chức phát
            triển mạnh mẽ trong kỷ nguyên số.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const products = getCategoryProducts(cat.slug);
            return (
              <div key={cat.slug} className="rounded-xl border border-slate-100 p-6 shadow-sm">
                <cat.icon size={32} className="text-vnpt" />
                <h2 className="mt-3 text-lg font-bold text-slate-800">{cat.name}</h2>
                <p className="text-sm text-slate-500">{cat.shortDesc}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {products.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <Check size={14} className="text-vnpt" /> {p.title}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/san-pham/${cat.slug}`} className="text-sm font-semibold text-vnpt">
                    Xem chi tiết →
                  </Link>
                  {products[0] && (
                    <Link
                      href={`/san-pham/${cat.slug}/${products[0].slug}`}
                      className="text-sm font-semibold text-vnpt-accent"
                    >
                      Xem sản phẩm mẫu →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
