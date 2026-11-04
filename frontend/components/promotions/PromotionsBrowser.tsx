"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, LayoutGrid, Layers, List } from "lucide-react";
import type { Promotion } from "@/content/promotions";
import { categories } from "@/content/category-map";
import LeadForm from "@/components/sections/LeadForm";

type SortKey = "newest" | "oldest";

function parseVNDate(d: string): number {
  const [dd, mm, yyyy] = d.split("/").map(Number);
  return new Date(yyyy, mm - 1, dd).getTime();
}

function PromoCard({ promo, large = false }: { promo: Promotion; large?: boolean }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 shadow-sm transition hover:shadow-md">
      <div className={`relative overflow-hidden text-white ${large ? "h-40" : "h-32"}`}>
        <Image
          src={promo.image}
          alt={promo.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/90 via-vnpt-darker/20 to-transparent" />
        <span className="absolute left-3 top-3 inline-block rounded bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
          {promo.badge}
        </span>
        <div className="absolute inset-x-3 bottom-2">
          <p className={`font-bold uppercase leading-snug drop-shadow ${large ? "text-lg" : "text-sm"}`}>
            {promo.title}
          </p>
          <p className={`font-extrabold text-vnpt-accent drop-shadow ${large ? "text-3xl" : "text-2xl"}`}>
            {promo.discountLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-slate-800">{promo.title}</h3>
        <p className="text-xs text-slate-500">{promo.note}</p>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} /> Thời hạn: {promo.validUntil}
        </div>
        <Link
          href={`/khuyen-mai/${promo.slug}`}
          className="mt-2 inline-flex items-center justify-center rounded-md border border-vnpt px-3 py-1.5 text-xs font-semibold text-vnpt hover:bg-vnpt-light"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

export default function PromotionsBrowser({
  featured,
  rest,
}: {
  featured: Promotion[];
  rest: Promotion[];
}) {
  const badges = useMemo(() => Array.from(new Set(rest.map((p) => p.badge))), [rest]);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>("newest");

  function toggleBadge(badge: string) {
    setSelected((prev) => (prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]));
  }

  const filtered = useMemo(() => {
    const list = selected.length === 0 ? rest : rest.filter((p) => selected.includes(p.badge));
    return [...list].sort((a, b) => {
      const da = parseVNDate(a.validFrom);
      const db = parseVNDate(b.validFrom);
      return sortBy === "newest" ? db - da : da - db;
    });
  }, [rest, selected, sortBy]);

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[2fr_1fr]">
      <div>
        {/* KHUYẾN MÃI NỔI BẬT */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">KHUYẾN MÃI NỔI BẬT</h2>
            <a href="#tat-ca-khuyen-mai" className="text-sm font-semibold text-vnpt">
              Xem tất cả →
            </a>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {featured.map((promo) => (
              <PromoCard key={promo.slug} promo={promo} large />
            ))}
          </div>
        </div>

        {/* TẤT CẢ KHUYẾN MÃI */}
        <div id="tat-ca-khuyen-mai">
          <h2 className="mb-4 text-lg font-bold text-slate-800">TẤT CẢ KHUYẾN MÃI</h2>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selected.length === 1 ? selected[0] : ""}
                onChange={(e) => setSelected(e.target.value ? [e.target.value] : [])}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                <option value="">Tất cả dịch vụ</option>
                {badges.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="rounded-md border border-vnpt bg-vnpt-light p-1.5 text-vnpt">
                <LayoutGrid size={16} />
              </span>
              <span className="rounded-md border border-slate-200 p-1.5 text-slate-400">
                <List size={16} />
              </span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              Không có khuyến mãi nào phù hợp bộ lọc.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((promo) => (
                <PromoCard key={promo.slug} promo={promo} />
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">DANH MỤC KHUYẾN MÃI</h3>
          <ul className="space-y-1">
            <li>
              <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold text-vnpt">
                <Layers size={15} /> Tất cả khuyến mãi
              </span>
            </li>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/san-pham/${cat.slug}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-vnpt-light hover:text-vnpt"
                >
                  <cat.icon size={15} /> {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-100 p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">BỘ LỌC THEO DỊCH VỤ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={selected.length === 0}
                  onChange={() => setSelected([])}
                  className="rounded border-slate-300 text-vnpt"
                />
                Tất cả dịch vụ
              </label>
            </li>
            {badges.map((b) => (
              <li key={b}>
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={selected.includes(b)}
                    onChange={() => toggleBadge(b)}
                    className="rounded border-slate-300 text-vnpt"
                  />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <LeadForm
          title="NHẬN TƯ VẤN ƯU ĐÃI"
          subtitle="Đăng ký nhận thông tin khuyến mãi mới nhất từ VNPT Nam Sài Gòn"
        />
      </aside>
    </section>
  );
}
