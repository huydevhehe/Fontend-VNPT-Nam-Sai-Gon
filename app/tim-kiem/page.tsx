import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import ArticleCard from "@/components/article/ArticleCard";
import { searchSite } from "@/lib/search";

export const metadata: Metadata = { title: "Kết quả tìm kiếm — VNPT Nam Sài Gòn" };

export default async function TimKiemPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { products, articles } = searchSite(q);
  const total = products.length + articles.length;

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 py-8">
        <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tìm kiếm" }]} />
        <h1 className="mt-3 text-2xl font-bold text-slate-800">
          {q ? (
            <>
              Kết quả tìm kiếm cho <span className="text-vnpt">&quot;{q}&quot;</span>
            </>
          ) : (
            "Tìm kiếm"
          )}
        </h1>
        {q && <p className="mt-1 text-sm text-slate-500">Tìm thấy {total} kết quả.</p>}
      </section>

      {!q ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 text-center text-slate-500">
          Nhập từ khoá vào ô tìm kiếm trên thanh menu để bắt đầu.
        </section>
      ) : total === 0 ? (
        <section className="mx-auto max-w-7xl px-6 pb-16 text-center">
          <SearchX size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">
            Không tìm thấy kết quả phù hợp. Thử từ khoá khác hoặc{" "}
            <Link href="/lien-he" className="font-semibold text-vnpt">
              liên hệ với chúng tôi
            </Link>
            .
          </p>
        </section>
      ) : (
        <section className="mx-auto max-w-7xl space-y-10 px-6 pb-16">
          {products.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                Sản phẩm ({products.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map(({ product, categorySlug }) => (
                  <ProductCard key={product.id} product={product} categorySlug={categorySlug} />
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-800">
                Tin tức ({articles.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
