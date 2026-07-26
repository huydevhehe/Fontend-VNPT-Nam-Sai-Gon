"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type HeroSlide = {
  image: string;
  title: string[];
  subtitle: string;
  primaryCta: { label: string; href: string; icon: ReactNode };
  secondaryCta: { label: string; href: string; icon: ReactNode };
};

const AUTO_ADVANCE_MS = 7000;
const FADE_DURATION_MS = 1500;

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
    <section className="relative h-[420px] overflow-hidden sm:h-[480px] lg:h-[600px]">
      {slides.map((s, i) => (
        <Image
          key={s.image}
          src={s.image}
          alt={s.title.join(" ")}
          fill
          sizes="100vw"
          quality={95}
          className={`object-cover transition-opacity ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_DURATION_MS}ms` }}
          priority={i === 0}
        />
      ))}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
        <div className="max-w-xl text-white [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.9))_drop-shadow(0_8px_20px_rgba(0,0,0,0.6))]">
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
            {slide.title.map((line, i) => (
              <span key={line}>
                {line}
                {i < slide.title.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-4 text-white/85">{slide.subtitle}</p>
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
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
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

      <button
        type="button"
        aria-label="Banner trước"
        onClick={() => goTo(index - 1)}
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 lg:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Banner sau"
        onClick={() => goTo(index + 1)}
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 lg:block"
      >
        <ChevronRight size={22} />
      </button>
    </section>
  );
}
