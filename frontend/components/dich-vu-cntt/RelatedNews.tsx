import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Newspaper } from "lucide-react";
import { getAllArticles } from "@/lib/data";

type Tag = {
  label: string;
  className: string;
};

const tags: Tag[] = [
  { label: "DỊCH VỤ CNTT", className: "bg-vnpt" },
  { label: "CHỮ KÝ SỐ", className: "bg-vnpt-dark" },
  { label: "HÓA ĐƠN ĐIỆN TỬ", className: "bg-vnpt-accent" },
  { label: "CHUYỂN ĐỔI SỐ", className: "bg-vnpt-darker" },
  { label: "DATA CENTER", className: "bg-slate-800" },
];

export default function RelatedNews() {
  const articles = getAllArticles()
    .filter((a) => /[à-ỹ]/i.test(a.title))
    .slice(0, 5);

  if (articles.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-vnpt-darker">TIN TỨC LIÊN QUAN</h2>
          <Link
            href="/tin-tuc"
            className="btn-label inline-flex items-center gap-1 text-vnpt hover:text-vnpt-dark"
          >
            Xem tất cả <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {articles.map((article, index) => {
            const tag = tags[index % tags.length];
            const image = article.images[0];
            return (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <div className="relative h-28 bg-vnpt-darker">
                  {image ? (
                    <Image
                      src={image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center">
                      <Newspaper className="h-8 w-8 text-white/50" aria-hidden="true" />
                    </span>
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${tag.className}`}
                  >
                    {tag.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-2 px-4 py-4">
                  <Link
                    href={`/tin-tuc/${article.slug}`}
                    className="line-clamp-2 text-sm font-medium text-vnpt-darker transition group-hover:text-vnpt"
                  >
                    {article.title}
                  </Link>
                  {article.date && (
                    <span className="mt-auto inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                      {article.date}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
