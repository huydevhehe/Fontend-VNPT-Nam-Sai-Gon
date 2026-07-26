"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// icon nhận vào là ReactNode đã render sẵn (vd <Wifi size={14} />), KHÔNG phải tham
// chiếu component — vì component (hàm) không thể truyền từ Server Component sang
// đây (Client Component) qua props, chỉ React element đã render mới truyền được.
export type HeroBadge = {
  icon: ReactNode;
  label: string;
  style: CSSProperties;
};

export type HeroSlide = {
  image: string;
  title: string[];
  subtitle: string;
  primaryCta: { label: string; href: string; icon: ReactNode };
  secondaryCta: { label: string; href: string; icon: ReactNode };
  badges: HeroBadge[];
};

const AUTO_ADVANCE_MS = 6000;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[index];

  function goTo(i: number) {
    setIndex((i + slides.length) % slides.length);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative z-10 text-white">
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              {slide.title.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < slide.title.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-xl text-white/85">{slide.subtitle}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={slide.primaryCta.href}
                className="flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt hover:bg-white/90"
              >
                {slide.primaryCta.icon} {slide.primaryCta.label}
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="flex items-center gap-2 rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                {slide.secondaryCta.label} {slide.secondaryCta.icon}
              </Link>
            </div>
          </div>

          <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block">
            {slides.map((s, i) => (
              <Image
                key={s.image}
                src={s.image}
                alt={s.title.join(" ")}
                fill
                className={`object-cover transition-opacity duration-700 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
              />
            ))}
            <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/80 via-transparent to-vnpt-dark/30" />
            {slide.badges.map((b) => (
              <div
                key={b.label}
                style={b.style}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-vnpt shadow-lg"
              >
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              type="button"
              aria-label={`Xem banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Banner trước"
        onClick={() => goTo(index - 1)}
        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 lg:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Banner sau"
        onClick={() => goTo(index + 1)}
        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 lg:block"
      >
        <ChevronRight size={22} />
      </button>
    </section>
  );
}
