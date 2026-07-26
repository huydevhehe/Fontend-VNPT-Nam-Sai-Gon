import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Cpu,
  Gift,
  Layers,
  Megaphone,
  Newspaper,
  Package,
  PartyPopper,
  Search,
  Workflow,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getAllArticles } from "@/lib/data";
import type { Article } from "@/lib/types";

export const metadata: Metadata = { title: "Tin tức — VNPT Nam Sài Gòn" };

const DANH_MUC = [
  { icon: Layers, label: "Tất cả tin tức" },
  { icon: Newspaper, label: "Tin tức VNPT" },
  { icon: Package, label: "Sản phẩm - Dịch vụ" },
  { icon: Cpu, label: "Công nghệ" },
  { icon: Workflow, label: "Chuyển đổi số" },
  { icon: PartyPopper, label: "Sự kiện" },
  { icon: Gift, label: "Khuyến mãi" },
  { icon: Megaphone, label: "Hướng dẫn sử dụng" },
];

function excerpt(bodyText: string, len = 130): string {
  const clean = bodyText
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > len ? `${clean.slice(0, len)}…` : clean;
}

function NewsCard({ article }: { article: Article }) {
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
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <Newspaper size={28} className="text-white" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {article.category && (
          <span className="text-xs font-semibold uppercase text-vnpt-accent">{article.category}</span>
        )}
        <h3 className="line-clamp-2 font-semibold text-slate-800">{article.title}</h3>
        <p className="line-clamp-2 text-xs text-slate-500">{excerpt(article.bodyText)}</p>
        {article.date && <span className="mt-auto text-xs text-slate-400">{article.date}</span>}
      </div>
    </Link>
  );
}

function NewsRow({ article }: { article: Article }) {
  return (
    <Link href={`/tin-tuc/${article.slug}`} className="flex gap-3 rounded-lg p-2 transition hover:bg-vnpt-light">
      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md bg-vnpt-darker">
        {article.images[0] && (
          <Image src={article.images[0]} alt={article.title} fill sizes="80px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold text-slate-800">{article.title}</h4>
        {article.date && <span className="text-xs text-slate-400">{article.date}</span>}
      </div>
    </Link>
  );
}

export default function TinTucPage() {
  const articles = getAllArticles();
  const featured = articles[0];
  const highlights = articles.slice(1, 4);
  const gridArticles = articles.slice(4, 10);
  const sidebarLatest = articles.slice(0, 5);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Tin tức" }]} />
          <h1 className="mt-3 text-3xl font-extrabold">TIN TỨC</h1>
          <p className="mt-2 text-white/85">
            Cập nhật thông tin mới nhất từ VNPT và các giải pháp công nghệ.
          </p>
          <form className="mt-5 flex max-w-md overflow-hidden rounded-md">
            <input
              type="search"
              placeholder="Nhập từ khóa cần tìm..."
              className="w-full px-4 py-2.5 text-sm text-slate-800 outline-none"
            />
            <button type="submit" className="flex items-center justify-center bg-vnpt-accent px-4 hover:bg-orange-600">
              <Search size={18} />
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div>
          {featured && (
            <div className="mb-6">
              <h2 className="mb-4 text-lg font-bold text-slate-800">TIN NỔI BẬT</h2>
              <Link
                href={`/tin-tuc/${featured.slug}`}
                className="grid overflow-hidden rounded-xl border border-slate-100 shadow-sm md:grid-cols-2"
              >
                <div className="relative h-56 bg-vnpt-darker">
                  {featured.images[0] ? (
                    <Image
                      src={featured.images[0]}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Newspaper size={36} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {featured.category && (
                    <span className="text-xs font-semibold uppercase text-vnpt-accent">{featured.category}</span>
                  )}
                  <h3 className="mt-1 text-xl font-bold text-slate-800">{featured.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{excerpt(featured.bodyText, 180)}</p>
                  {featured.date && <p className="mt-2 text-sm text-slate-400">{featured.date}</p>}
                </div>
              </Link>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {highlights.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </div>
          )}

          <h2 className="mb-4 mt-10 text-lg font-bold text-slate-800">TIN TỨC MỚI NHẤT</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {gridArticles.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-800">DANH MỤC TIN TỨC</h3>
            <ul className="space-y-1">
              {DANH_MUC.map((d, i) => (
                <li key={d.label}>
                  <span
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                      i === 0 ? "font-semibold text-vnpt" : "text-slate-600"
                    }`}
                  >
                    <d.icon size={15} /> {d.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-800">TIN MỚI NHẤT</h3>
            <div className="space-y-1">
              {sidebarLatest.map((a) => (
                <NewsRow key={a.id} article={a} />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-vnpt p-5 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Bell size={18} /> ĐĂNG KÝ NHẬN TIN
            </div>
            <p className="mt-2 text-sm text-white/80">
              Nhận thông tin, chương trình khuyến mãi mới nhất từ VNPT Nam Sài Gòn.
            </p>
            <form className="mt-3 space-y-2">
              <input
                type="email"
                required
                placeholder="Nhập email của bạn..."
                className="w-full rounded-md px-3 py-2 text-sm text-slate-800 outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-md bg-vnpt-accent py-2 text-sm font-semibold hover:bg-orange-600"
              >
                ĐĂNG KÝ NGAY
              </button>
            </form>
            <p className="mt-2 text-xs text-white/60">Chúng tôi cam kết bảo mật thông tin của bạn.</p>
          </div>
        </aside>
      </section>
    </div>
  );
}
