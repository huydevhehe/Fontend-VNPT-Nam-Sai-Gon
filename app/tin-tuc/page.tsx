import type { Metadata } from "next";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ArticleCard from "@/components/article/ArticleCard";
import { getAllArticles } from "@/lib/data";

export const metadata: Metadata = { title: "Tin tức — VNPT Nam Sài Gòn" };

export default function TinTucPage() {
  const articles = getAllArticles();
  const featured = articles[0];
  const rest = articles.slice(1);
  const categoryList = [...new Set(articles.map((a) => a.category).filter(Boolean))] as string[];

  return (
    <div>
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]} />
          <h1 className="mt-3 text-3xl font-extrabold text-slate-800">TIN TỨC</h1>
          <p className="mt-2 text-slate-600">
            Cập nhật thông tin mới nhất từ VNPT và các giải pháp công nghệ.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {featured && (
            <a href={`/tin-tuc/${featured.slug}`} className="mb-8 block rounded-xl border border-slate-100 shadow-sm">
              <div className="flex h-56 items-center justify-center rounded-t-xl bg-vnpt-darker text-white">
                Tin nổi bật
              </div>
              <div className="p-5">
                {featured.category && (
                  <span className="text-xs font-semibold uppercase text-vnpt-accent">
                    {featured.category}
                  </span>
                )}
                <h2 className="mt-1 text-xl font-bold text-slate-800">{featured.title}</h2>
                {featured.date && <p className="mt-1 text-sm text-slate-400">{featured.date}</p>}
              </div>
            </a>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        <aside>
          <h3 className="mb-3 font-semibold text-slate-800">Danh mục tin tức</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="font-semibold text-vnpt">Tất cả tin tức</li>
            {categoryList.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
