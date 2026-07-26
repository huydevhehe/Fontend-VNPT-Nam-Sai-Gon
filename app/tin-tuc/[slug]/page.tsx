import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Newspaper, Tag } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ArticleCard from "@/components/article/ArticleCard";
import LeadForm from "@/components/sections/LeadForm";
import { getAllArticles, getArticleBySlug } from "@/lib/data";
import type { Article } from "@/lib/types";
import ShareButtons from "./share-buttons";

function cleanParagraphs(bodyText: string): string[] {
  return bodyText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

function NewsRow({ article }: { article: Article }) {
  return (
    <Link href={`/tin-tuc/${article.slug}`} className="flex gap-3 rounded-lg p-2 transition hover:bg-vnpt-light">
      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-vnpt-darker">
        {article.images[0] && <Image src={article.images[0]} alt={article.title} fill className="object-cover" />}
      </div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold text-slate-800">{article.title}</h4>
        {article.date && <span className="text-xs text-slate-400">{article.date}</span>}
      </div>
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return { title: article ? `${article.title} — VNPT Nam Sài Gòn` : "Tin tức" };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const paragraphs = cleanParagraphs(article.bodyText);
  const related = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  const sidebarLatest = getAllArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Breadcrumb
        items={[
          { label: "Trang chủ", href: "/" },
          { label: "Tin tức", href: "/tin-tuc" },
          { label: article.title },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {article.category && (
            <span className="inline-block rounded bg-vnpt-light px-2.5 py-1 text-xs font-semibold uppercase text-vnpt">
              {article.category}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-slate-800 md:text-3xl">
            {article.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            {article.date && (
              <span className="flex items-center gap-1.5 text-sm text-slate-400">
                <Calendar size={14} /> {article.date}
              </span>
            )}
            <ShareButtons title={article.title} />
          </div>

          <div className="relative mt-6 h-72 overflow-hidden rounded-xl bg-vnpt-darker md:h-96">
            {article.images[0] ? (
              <Image src={article.images[0]} alt={article.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Newspaper size={48} className="text-white/70" />
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            {paragraphs.map((p) => (
              <p key={p} className="text-sm leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </div>

          {article.category && (
            <div className="mt-8 flex items-center gap-2">
              <Tag size={15} className="text-slate-400" />
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {article.category}
              </span>
            </div>
          )}

          <div className="mt-6 border-t border-slate-100 pt-6">
            <ShareButtons title={article.title} />
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-xl border border-slate-100 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-vnpt text-sm font-bold text-white">
              VN
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Đội ngũ biên tập VNPT Nam Sài Gòn
              </div>
              <p className="text-xs text-slate-500">
                Cập nhật tin tức, kiến thức về sản phẩm, dịch vụ và giải pháp chuyển đổi số từ
                VNPT Nam Sài Gòn.
              </p>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-bold text-slate-800">BÀI VIẾT LIÊN QUAN</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-800">TIN MỚI NHẤT</h3>
            <div className="space-y-1">
              {sidebarLatest.map((a) => (
                <NewsRow key={a.id} article={a} />
              ))}
            </div>
          </div>

          <LeadForm title="Nhận tư vấn miễn phí" subtitle="Đăng ký để được chuyên gia VNPT tư vấn" />
        </aside>
      </div>
    </div>
  );
}
