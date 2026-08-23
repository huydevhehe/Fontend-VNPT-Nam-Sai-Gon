"use client";

import { useMemo, useState } from "react";
import { Phone, Search, SlidersHorizontal } from "lucide-react";
import {
  SIM_CATEGORIES,
  SIM_NUMBERS,
  SIM_PREFIXES,
  formatSimPrice,
  type SimCategory,
} from "@/content/sim-numbers";

const ALL = "all";

export default function SimPicker() {
  const [prefix, setPrefix] = useState<string>(ALL);
  const [category, setCategory] = useState<SimCategory | typeof ALL>(ALL);
  const [keyword, setKeyword] = useState("");

  const results = useMemo(() => {
    const digits = keyword.replace(/\D/g, "");
    return SIM_NUMBERS.filter((sim) => {
      if (prefix !== ALL && sim.prefix !== prefix) return false;
      if (category !== ALL && sim.category !== category) return false;
      if (digits && !sim.number.replace(/\D/g, "").includes(digits)) return false;
      return true;
    });
  }, [prefix, category, keyword]);

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${
      active
        ? "border-vnpt bg-vnpt text-white"
        : "border-slate-200 text-slate-600 hover:border-vnpt hover:text-vnpt"
    }`;

  return (
    <div>
      {/* Chọn đầu số */}
      <div className="mb-5">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <Phone size={15} className="text-vnpt" /> Chọn đầu số
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPrefix(ALL)} className={chip(prefix === ALL)}>
            Tất cả
          </button>
          {SIM_PREFIXES.map((p) => (
            <button
              key={p.prefix}
              type="button"
              title={p.desc}
              onClick={() => setPrefix(p.prefix)}
              className={chip(prefix === p.prefix)}
            >
              {p.prefix}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn loại số */}
      <div className="mb-5">
        <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={15} className="text-vnpt" /> Loại số
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(ALL)}
            className={chip(category === ALL)}
          >
            Tất cả
          </button>
          {SIM_CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              title={c.desc}
              onClick={() => setCategory(c.slug)}
              className={chip(category === c.slug)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tìm theo dãy số */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Nhập dãy số bạn muốn tìm, ví dụ 686"
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-vnpt focus:ring-4 focus:ring-vnpt/10"
        />
      </div>

      {/* Kết quả */}
      <p className="mb-3 text-sm text-slate-500">
        Tìm thấy <span className="font-semibold text-vnpt">{results.length}</span> số phù hợp
      </p>

      {results.length === 0 ? (
        <p className="rounded-lg border border-slate-100 p-6 text-center text-sm text-slate-500">
          Không có số nào khớp bộ lọc. Thử bỏ bớt điều kiện hoặc gọi hotline 0838 999 333 để được
          hỗ trợ chọn số.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((sim) => (
            <div
              key={sim.number}
              className="rounded-xl border border-slate-100 p-4 text-center shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
            >
              <div className="text-lg font-bold tracking-wide text-slate-800">{sim.number}</div>
              <div className="mt-1 text-sm font-semibold text-vnpt">
                {formatSimPrice(sim.price)}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {sim.type === "tra-sau" ? "Trả sau" : "Trả trước"}
              </div>
              <a
                href="/lien-he"
                className="mt-3 block rounded-md bg-vnpt py-2 text-sm font-semibold text-white hover:bg-vnpt-dark"
              >
                ĐẶT SỐ
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
