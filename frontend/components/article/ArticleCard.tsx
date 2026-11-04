import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import type { Article } from "@/lib/types";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-36 items-center justify-center bg-vnpt-darker">
        {article.images[0] ? (
          <Image
            src={article.images[0]}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <Newspaper size={32} className="text-white" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {article.category && (
          <span className="text-xs font-semibold uppercase text-vnpt-accent">
            {article.category}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold text-slate-800">{article.title}</h3>
        {article.date && <span className="text-xs text-slate-400">{article.date}</span>}
      </div>
    </Link>
  );
}
