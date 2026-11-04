import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Building2,
  ClipboardList,
  Clock,
  Cloud,
  Cpu,
  CreditCard,
  Database,
  FlaskConical,
  Globe,
  HardDrive,
  Headset,
  LifeBuoy,
  Network,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import PricingTable from "@/components/product/PricingTable";
import { getCategoryProducts } from "@/content/category-products";
import type { Pricing } from "@/lib/types";

export const metadata: Metadata = {
  title: "VNPT Cloud & Data Center — VNPT Nam Sài Gòn",
};

const HERO_ICONS = [
  { icon: Server, label: "Cloud Server" },
  { icon: HardDrive, label: "Bare Metal" },
  { icon: Database, label: "Storage" },
  { icon: Cloud, label: "Backup" },
  { icon: Building2, label: "Data Center" },
];

const HERO_BADGES = [
  { icon: Shield, label: "Bảo mật đa lớp", style: { top: "12%", left: "8%" } },
  { icon: Globe, label: "Hạ tầng Việt Nam", style: { top: "48%", left: "4%" } },
  { icon: Network, label: "Kết nối toàn quốc", style: { top: "82%", left: "14%" } },
];

// 4 dịch vụ có sản phẩm thật trong data cào (sourceId "cloud"), 2 dịch vụ còn lại
// (Bare Metal, Data Center & Colocation) chưa có sản phẩm cào tương ứng nên trỏ về /lien-he.
const DICH_VU_CARDS = [
  {
    icon: Server,
    title: "Cloud Server",
    desc: "Máy chủ ảo linh hoạt, hiệu năng cao",
    price: "Giá từ 180.000đ/ tháng",
    slug: "cloud-vnpt-cloud-server",
  },
  {
    icon: HardDrive,
    title: "Cloud Storage",
    desc: "Lưu trữ dữ liệu an toàn, dung lượng mở rộng linh hoạt",
    price: "Giá từ 500đ/ GB/ tháng",
    slug: "cloud-vnpt-cloud-object-storage",
  },
  {
    icon: Cloud,
    title: "Cloud Backup",
    desc: "Sao lưu dữ liệu tự động định kỳ, phục hồi nhanh chóng",
    price: "Giá từ 250đ/ GB/ tháng",
    slug: "cloud-vnpt-cloud-backup",
  },
  {
    icon: Boxes,
    title: "Kubernetes Service",
    desc: "Nền tảng container mạnh mẽ, tự động mở rộng",
    price: "Giá từ 1.200.000đ/ tháng",
    slug: "cloud-vnpt-kubernetes-service",
  },
  {
    icon: Server,
    title: "Bare Metal Server",
    desc: "Máy chủ vật lý riêng, hiệu năng cao",
    price: "Giá từ 2.200.000đ/ tháng",
    slug: null,
  },
  {
    icon: Building2,
    title: "Data Center & Colocation",
    desc: "Đặt máy chủ tại IDC VNPT đạt chuẩn quốc tế",
    price: "Giá liên hệ",
    slug: null,
  },
];

const TAI_SAO = [
  { icon: Clock, value: "99.99%", label: "Uptime SLA" },
  { icon: Building2, value: "03", label: "Data Center Tier III tại Việt Nam" },
  { icon: ShieldCheck, value: "Bảo mật", label: "đạt chuẩn ISO 27001" },
  { icon: Globe, value: "Hạ tầng", label: "đặt tại Việt Nam, kết nối tốc độ cao" },
  { icon: Headset, value: "Hỗ trợ 24/7", label: "Đội ngũ chuyên sâu" },
  { icon: CreditCard, value: "Thanh toán", label: "linh hoạt theo tháng/quý/năm" },
];

const GIAI_PHAP_NHU_CAU = [
  { icon: Globe, title: "Website & Hosting", desc: "Cloud Server – SSL – Backup – CDN" },
  { icon: Building2, title: "Doanh nghiệp", desc: "Cloud – Storage – Backup – DR Site" },
  { icon: Database, title: "ERP / CRM", desc: "Kubernetes – Database – Backup" },
  { icon: Cpu, title: "AI & Big Data", desc: "GPU Cloud – Object Storage – Analytics" },
];

const CLOUD_SERVER_PRICING: Pricing[] = [
  {
    columns: ["Gói cấu hình", "vCPU", "RAM", "SSD", "Băng thông", "Giá từ (VNĐ/tháng)"],
    rows: [
      ["Basic", "2 vCPU", "4 GB", "50 GB", "Không giới hạn", "180.000"],
      ["Standard", "4 vCPU", "8 GB", "100 GB", "Không giới hạn", "350.000"],
      ["Premium", "8 vCPU", "16 GB", "200 GB", "Không giới hạn", "700.000"],
      ["Business", "16 vCPU", "32 GB", "400 GB", "Không giới hạn", "1.300.000"],
    ],
    note: "Giá tham khảo, chưa bao gồm VAT. Liên hệ để được tư vấn cấu hình phù hợp.",
  },
];

const BANG_GIA_TABS = ["Cloud Server", "Cloud Storage", "Backup", "Data Center"];

const TU_VAN_CHECKS = [
  "Khảo sát & tư vấn miễn phí",
  "Thiết kế kiến trúc phù hợp",
  "Triển khai nhanh chóng",
  "Hỗ trợ kỹ thuật 24/7",
];

// Chưa có logo thật của khách hàng — hiển thị dạng wordmark chữ, không dùng ảnh có bản quyền.
const KHACH_HANG = [
  {
    name: "BECAMEX",
    org: "Tổng công ty Becamex IDC",
    result: "Triển khai Cloud Server & Backup – Giảm 40% chi phí hạ tầng",
  },
  {
    name: "HÒA PHÁT",
    org: "Tập đoàn Hòa Phát",
    result: "Triển khai Private Cloud – Tối ưu hiệu suất hệ thống",
  },
  {
    name: "VIETTEL",
    org: "Viettel Post",
    result: "Triển khai Kubernetes Service – Tăng khả năng mở rộng 300%",
  },
  {
    name: "FPT",
    org: "FPT Software",
    result: "Triển khai Data Center – Đảm bảo an toàn dữ liệu",
  },
  {
    name: "VINFAST",
    org: "VinFast",
    result: "Triển khai Cloud & Storage – Đáp ứng mở rộng toàn cầu",
  },
];

const DATA_CENTER_CHECKS = [
  "Tier III – Uptime 99.982%",
  "ISO 27001 – ISO 20000",
  "Hạ tầng toàn quốc – Kết nối MetroNet",
  "Giám sát 24/7 – NOC đạt chuẩn quốc tế",
];

const IDC_GALLERY = [
  { name: "VNPT IDC Hòa Lạc", note: "Hà Nội" },
  { name: "VNPT IDC Tân Thuận", note: "TP. Hồ Chí Minh" },
  { name: "VNPT IDC Đà Nẵng", note: "Đà Nẵng" },
];

const QUY_TRINH = [
  { icon: ClipboardList, title: "Khảo sát nhu cầu", desc: "Tiếp nhận yêu cầu & phân tích nhu cầu" },
  { icon: Headset, title: "Tư vấn giải pháp", desc: "Đề xuất giải pháp, báo giá chi tiết" },
  { icon: FlaskConical, title: "Demo & Test", desc: "Trải nghiệm dịch vụ miễn phí" },
  { icon: Rocket, title: "Triển khai", desc: "Tiến hành triển khai theo kế hoạch" },
  { icon: LifeBuoy, title: "Vận hành & hỗ trợ", desc: "Giám sát & hỗ trợ đảm bảo 24/7" },
];

const BOTTOM_STATS = [
  { icon: Server, value: "10.000+", label: "Máy chủ đang hoạt động" },
  { icon: Building2, value: "5.000+", label: "Doanh nghiệp tin dùng" },
  { icon: Clock, value: "15+", label: "Năm kinh nghiệm" },
  { icon: Headset, value: "24/7", label: "Hỗ trợ kỹ thuật" },
];

export default function CloudIdcPage() {
  const products = getCategoryProducts("cloud-idc");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/san-pham" },
              { label: "Cloud & Data Center" },
            ]}
          />
          <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="leading-tight">
                VNPT CLOUD
                <br />& DATA CENTER
              </h1>
              <p className="mt-3 font-semibold text-vnpt-accent">HẠ TẦNG SỐ MẠNH MẼ</p>
              <p className="text-white/85">AN TOÀN – LINH HOẠT – SẴN SÀNG MỞ RỘNG</p>

              <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
                {HERO_ICONS.map((h) => (
                  <div key={h.label} className="flex flex-col items-center gap-1.5 text-center">
                    <h.icon size={24} />
                    <span className="text-xs text-white/80">{h.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#dang-ky-tu-van"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt hover:bg-white/90"
                >
                  TƯ VẤN GIẢI PHÁP
                </Link>
                <Link
                  href="#bang-gia"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  NHẬN BÁO GIÁ
                </Link>
              </div>
            </div>

            <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="VNPT Cloud & Data Center"
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/80 via-transparent to-vnpt-dark/30" />
              {HERO_BADGES.map((b) => (
                <div
                  key={b.label}
                  style={b.style}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-vnpt shadow-lg"
                >
                  <b.icon size={14} /> {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DỊCH VỤ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-center text-slate-800">
          DỊCH VỤ CLOUD &amp; DATA CENTER
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DICH_VU_CARDS.map((d) => {
            const exists = d.slug ? products.some((p) => p.slug === d.slug) : false;
            const href = exists ? `/san-pham/cloud-idc/${d.slug}` : "/lien-he";
            return (
              <div
                key={d.title}
                className="flex flex-col rounded-xl border border-slate-100 p-5 text-center shadow-sm transition hover:shadow-md"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <d.icon size={24} />
                </div>
                <h3 className="mt-3 font-semibold text-slate-800">{d.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{d.desc}</p>
                <p className="mt-2 text-sm font-semibold text-vnpt">{d.price}</p>
                <Link
                  href={href}
                  className="mt-3 text-sm font-semibold text-vnpt hover:underline"
                >
                  {exists ? "Xem chi tiết →" : "Liên hệ tư vấn →"}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* TẠI SAO CHỌN VNPT CLOUD */}
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-6 text-center text-slate-800">
            TẠI SAO CHỌN VNPT CLOUD
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {TAI_SAO.map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5 text-center">
                <t.icon size={26} className="text-vnpt" />
                <span className="text-sm font-bold text-slate-800">{t.value}</span>
                <span className="text-xs text-slate-500">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KIẾN TRÚC + GIẢI PHÁP THEO NHU CẦU */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Kiến trúc hệ sinh thái cloud */}
          <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
            <h2 className="mb-6 text-center text-lg font-bold text-slate-800">
              KIẾN TRÚC HỆ SINH THÁI CLOUD
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 text-center text-xs text-slate-600">
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Globe size={22} />
                </div>
                Internet
              </div>
              <ArrowRight className="text-vnpt" size={18} />
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Network size={22} />
                </div>
                Load Balancer
              </div>
              <ArrowRight className="text-vnpt" size={18} />
              <div className="flex flex-col items-center gap-1">
                <div className="grid grid-cols-3 gap-1.5">
                  {[Server, Database, HardDrive].map((Icon, i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-vnpt text-white"
                    >
                      <Icon size={16} />
                    </div>
                  ))}
                </div>
                <span className="mt-1 block">
                  Cloud Server · Database · Storage
                </span>
              </div>
              <ArrowRight className="text-vnpt" size={18} />
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Cloud size={22} />
                </div>
                Backup
              </div>
            </div>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2 rounded-lg bg-vnpt-darker px-5 py-3 text-sm font-semibold text-white">
                <Building2 size={18} /> Data Center VNPT
              </div>
            </div>
          </div>

          {/* Giải pháp theo nhu cầu */}
          <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
            <h2 className="mb-6 text-center text-lg font-bold text-slate-800">
              GIẢI PHÁP THEO NHU CẦU
            </h2>
            <div className="space-y-3">
              {GIAI_PHAP_NHU_CAU.map((g) => (
                <div
                  key={g.title}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-vnpt"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                    <g.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">{g.title}</div>
                    <div className="text-xs text-slate-500">{g.desc}</div>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BẢNG GIÁ THAM KHẢO */}
      <section id="bang-gia" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-10">
        <h2 className="mb-6 text-center text-slate-800">
          BẢNG GIÁ THAM KHẢO
        </h2>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap gap-2">
              {BANG_GIA_TABS.map((tab, i) => (
                <span
                  key={tab}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    i === 0
                      ? "bg-vnpt text-white"
                      : "border border-slate-200 text-slate-600"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <PricingTable pricing={CLOUD_SERVER_PRICING} />
            </div>
            <div className="mt-3 text-right">
              <Link href="/san-pham/cloud-idc/cloud-vnpt-cloud-server" className="text-sm font-semibold text-vnpt hover:underline">
                Xem tất cả cấu hình →
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-vnpt-light p-6">
            <h3 className="font-bold text-slate-800">TƯ VẤN GIẢI PHÁP PHÙ HỢP</h3>
            <p className="mt-1 text-sm text-slate-600">
              Đội ngũ chuyên gia VNPT sẵn sàng tư vấn giải pháp tối ưu cho doanh nghiệp.
            </p>
            <ul className="mt-4 space-y-2">
              {TU_VAN_CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-slate-700">
                  <ShieldCheck size={16} className="shrink-0 text-vnpt" /> {c}
                </li>
              ))}
            </ul>
            <Link
              href="#dang-ky-tu-van"
              className="mt-5 block rounded-md bg-vnpt py-2.5 text-center text-sm font-semibold text-white hover:bg-vnpt-dark"
            >
              ĐĂNG KÝ TƯ VẤN NGAY
            </Link>
          </div>
        </div>
      </section>

      {/* KHÁCH HÀNG TIÊU BIỂU */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-slate-800">KHÁCH HÀNG TIÊU BIỂU</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {KHACH_HANG.map((k) => (
            <div key={k.name} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <div className="text-lg font-black tracking-tight text-slate-800">{k.name}</div>
              <div className="mt-2 text-sm font-semibold text-slate-700">{k.org}</div>
              <p className="mt-1 text-xs text-slate-500">{k.result}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DATA CENTER VNPT */}
      <section className="bg-vnpt-darker px-6 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2>DATA CENTER VNPT</h2>
            <p className="mt-1 text-white/70">
              Hệ thống Data Center hiện đại, đạt chuẩn quốc tế
            </p>
            <ul className="mt-4 space-y-2">
              {DATA_CENTER_CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-white/85">
                  <ShieldCheck size={16} className="shrink-0 text-vnpt-accent" /> {c}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {IDC_GALLERY.map((g) => (
                <div key={g.name} className="overflow-hidden rounded-xl bg-white/10">
                  <div className="flex h-24 items-center justify-center">
                    <Building2 size={32} className="text-white/60" />
                  </div>
                  <div className="p-2 text-center">
                    <div className="text-xs font-semibold">{g.name}</div>
                    <div className="text-[11px] text-white/60">{g.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div id="dang-ky-tu-van" className="scroll-mt-24">
            <LeadForm
              title="Đăng ký tư vấn Cloud & Data Center"
              interestOptions={["Cloud & IDC"]}
              showCompany
            />
          </div>
        </div>
      </section>

      {/* QUY TRÌNH TRIỂN KHAI */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-center text-slate-800">
          QUY TRÌNH TRIỂN KHAI
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {QUY_TRINH.map((q, i) => (
            <div key={q.title} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vnpt text-sm font-bold text-white">
                {i + 1}
              </div>
              <q.icon size={22} className="text-vnpt" />
              <div className="text-sm font-semibold text-slate-800">{q.title}</div>
              <div className="text-xs text-slate-500">{q.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STAT BAR */}
      <div className="bg-vnpt">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center text-white md:grid-cols-4">
          {BOTTOM_STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-2">
              <s.icon size={22} className="shrink-0" />
              <div className="text-left">
                <div className="text-lg font-bold">{s.value}</div>
                <div className="text-xs text-white/80">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
