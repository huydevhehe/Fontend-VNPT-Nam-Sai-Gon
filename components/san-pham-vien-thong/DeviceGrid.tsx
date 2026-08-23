"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  House,
  LayoutGrid,
  Router,
  Smartphone,
  Tv,
  type LucideIcon,
} from "lucide-react";
import { TELECOM_DEVICE_GROUPS } from "@/content/telecom-devices";

export type TelecomDevice = {
  slug: string;
  title: string;
  shortDesc: string;
  sourceUrl: string;
  image: string;
  group: string;
  specs: string[];
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  "tat-ca": LayoutGrid,
  "thiet-bi-mang": Router,
  camera: Camera,
  "truyen-hinh": Tv,
  "smart-home": House,
  "thiet-bi-dau-cuoi": Smartphone,
};

const ADVISORY_POINTS = [
  "Tư vấn giải pháp miễn phí",
  "Demo thiết bị trực tiếp",
  "Báo giá nhanh chóng",
];

function truncate(text: string, max = 130): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, "")}...`;
}

export default function DeviceGrid({ devices }: { devices: TelecomDevice[] }) {
  const [activeGroup, setActiveGroup] = useState("tat-ca");

  const filtered = useMemo(
    () => (activeGroup === "tat-ca" ? devices : devices.filter((d) => d.group === activeGroup)),
    [devices, activeGroup],
  );

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-100 p-2 shadow-sm">
          {TELECOM_DEVICE_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.slug] ?? LayoutGrid;
            const isActive = group.slug === activeGroup;
            return (
              <button
                key={group.slug}
                type="button"
                onClick={() => setActiveGroup(group.slug)}
                aria-pressed={isActive}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "bg-vnpt text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-vnpt"
                }`}
              >
                <Icon size={16} />
                {group.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-slate-100 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
            Chưa có sản phẩm nào trong nhóm này. Vui lòng chọn nhóm khác hoặc liên hệ để được tư vấn.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((device, index) => (
              <article
                key={device.slug}
                className="flex flex-col rounded-xl border border-slate-100 p-5 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <div className="relative">
                  <span className="absolute top-0 left-0 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-vnpt text-xs font-semibold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative h-40 w-full overflow-hidden rounded-lg bg-slate-50">
                    <Image
                      src={device.image}
                      alt={device.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-contain p-4"
                    />
                  </div>
                </div>

                <h3 className="mt-4 text-vnpt-dark">{device.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {truncate(device.shortDesc)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {device.specs.map((spec) => (
                    <span
                      key={spec}
                      className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <a
                  href={device.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-vnpt transition hover:border-vnpt hover:bg-vnpt hover:text-white"
                >
                  Xem thông số kỹ thuật
                  <ArrowRight size={15} />
                </a>
              </article>
            ))}

            <div className="flex flex-col rounded-xl border border-vnpt/20 bg-vnpt-light p-6 shadow-sm">
              <h3 className="text-vnpt-dark">BẠN CẦN TƯ VẤN CHI TIẾT?</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Đội ngũ chuyên gia của VNPT Nam Sài Gòn sẵn sàng hỗ trợ bạn lựa chọn thiết bị phù hợp
                nhu cầu của bạn.
              </p>
              <ul className="mt-4 space-y-2.5">
                {ADVISORY_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check size={16} className="shrink-0 text-vnpt" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                href="/lien-he"
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-vnpt px-5 py-3 text-sm font-semibold text-white transition hover:bg-vnpt-dark"
              >
                LIÊN HỆ TƯ VẤN NGAY
              </Link>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          * Hình ảnh sản phẩm chỉ mang tính chất minh họa. Vui lòng xem thông số kỹ thuật chi tiết
          tại từng sản phẩm.
        </p>
      </div>
    </section>
  );
}
