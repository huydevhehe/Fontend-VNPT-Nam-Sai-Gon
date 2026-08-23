"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

const SUGGESTIONS = ["Plugin ký số", "Driver Token", "Hướng dẫn", "SmartCA"];

export default function HeroSection() {
  const [keyword, setKeyword] = useState("");

  const scrollToDanhMuc = () => {
    document.getElementById("danh-muc-tai-ve")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    scrollToDanhMuc();
  };

  return (
    <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px]">
      <Image
        src="/images/plugin-cong-cu/banner-plugin-cong-cu.jpg"
        alt="Plugin & Công cụ VNPT Nam Sài Gòn"
        fill
        sizes="100vw"
        quality={95}
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-vnpt-darker/85 via-vnpt-darker/60 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="max-w-xl">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Dịch vụ CNTT", href: "/dich-vu-cntt" },
              { label: "Plugin & Công cụ" },
            ]}
          />
          <h1 className="mt-4">PLUGIN &amp; CÔNG CỤ</h1>
          <p className="mt-4 text-lg text-white sm:text-xl">
            Bộ cài plugin ký số, driver USB Token
            <br />
            và tài liệu hướng dẫn.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md items-center gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm kiếm công cụ, tài liệu, driver..."
              aria-label="Tìm kiếm công cụ, tài liệu, driver"
              className="min-w-0 flex-1 rounded-lg border border-white/40 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-vnpt focus:ring-4 focus:ring-vnpt/10"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-vnpt-dark transition hover:bg-slate-100"
            >
              <Search size={18} />
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/80">Gợi ý:</span>
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setKeyword(item)}
                className="rounded-full border border-white/60 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
