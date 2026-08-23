import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Cpu,
  Home,
  Radio,
  Router,
  Smartphone,
  Tv,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { getProductsBySource } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sản phẩm Viễn thông — VNPT Nam Sài Gòn",
  description:
    "Thiết bị viễn thông do VNPT nghiên cứu và sản xuất: modem quang XGS-PON/GPON, Mesh WiFi, camera, SmartBox, Smart Home.",
};

/** Icon minh hoạ cho từng nhóm thiết bị, khớp theo từ khoá trong tên sản phẩm. */
const ICON_RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /pon|ont|olt/i, icon: Router },
  { match: /mesh|wifi/i, icon: Wifi },
  { match: /fwa|5g/i, icon: Radio },
  { match: /camera/i, icon: Camera },
  { match: /smartbox|dvb|đầu thu/i, icon: Tv },
  { match: /điện thoại/i, icon: Smartphone },
  { match: /smart home/i, icon: Home },
];

function iconFor(title: string): LucideIcon {
  return ICON_RULES.find((r) => r.match.test(title))?.icon ?? Cpu;
}

/** Cắt phần mô tả dài thành đoạn ngắn hiển thị trên card. */
function excerpt(text: string, len = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > len ? `${clean.slice(0, len)}…` : clean;
}

export default function SanPhamVienThongPage() {
  const devices = getProductsBySource("vnpt-technology");

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            variant="light"
            items={[{ label: "Trang chủ", href: "/" }, { label: "SP Viễn thông" }]}
          />
          <h1 className="mt-3">SẢN PHẨM VIỄN THÔNG</h1>
          <p className="mt-2 max-w-2xl text-white/85">
            Thiết bị viễn thông do VNPT nghiên cứu và sản xuất — từ modem quang, WiFi Mesh,
            camera an ninh đến các giải pháp nhà thông minh.
          </p>
        </div>
      </section>

      {/* DANH SÁCH THIẾT BỊ */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">DANH MỤC THIẾT BỊ</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">
          {devices.length} nhóm thiết bị phục vụ nhà mạng, doanh nghiệp và hộ gia đình.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => {
            const Icon = iconFor(d.title);
            return (
              <div
                key={d.id}
                className="flex flex-col rounded-xl border border-slate-100 p-5 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Icon size={22} />
                </span>
                <h3 className="mt-3 text-slate-800">{d.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-500">{excerpt(d.shortDesc)}</p>
                <a
                  href={d.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 text-sm font-semibold text-vnpt hover:underline"
                >
                  Xem thông số kỹ thuật →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-vnpt-darker to-vnpt p-8 text-center text-white lg:flex-row lg:text-left">
          <div>
            <div className="text-lg font-bold">Cần tư vấn thiết bị phù hợp?</div>
            <p className="mt-1 text-sm text-white/80">
              VNPT Nam Sài Gòn hỗ trợ khảo sát và đề xuất thiết bị theo đúng nhu cầu triển khai.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/lien-he"
              className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
            >
              LIÊN HỆ TƯ VẤN
            </Link>
            <a
              href="tel:0838999333"
              className="rounded-md border border-white/60 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Hotline: 0838 999 333
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
