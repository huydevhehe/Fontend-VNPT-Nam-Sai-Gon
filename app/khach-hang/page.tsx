import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Camera,
  Cloud,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Smartphone,
  Users,
  Warehouse,
  Wifi,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = { title: "Khách hàng — VNPT Nam Sài Gòn" };

const HERO_STATS = [
  { icon: Building2, value: "3.000+", label: "Khách hàng doanh nghiệp" },
  { icon: Users, value: "200.000+", label: "Khách hàng cá nhân & hộ gia đình" },
  { icon: Landmark, value: "500+", label: "Dự án đã triển khai" },
  { icon: Cloud, value: "25+ năm", label: "Đồng hành & phát triển" },
];

const DU_AN_TIEU_BIEU = [
  {
    image: "/images/doi-tuong/co-quan-nha-nuoc.jpg",
    icon: Landmark,
    title: "Trung tâm Hành chính Quận 7",
    desc: "Triển khai giải pháp Chính quyền số, hệ thống quản lý văn bản và điều hành.",
  },
  {
    image: "/images/khach-hang/benh-vien-nha-be.jpg",
    icon: HeartPulse,
    title: "Bệnh viện Đa khoa Nhà Bè",
    desc: "Triển khai hệ thống HIS, PACS và hạ tầng mạng, WiFi toàn bệnh viện.",
  },
  {
    image: "/images/khach-hang/truong-hoc-le-thanh-ton.jpg",
    icon: GraduationCap,
    title: "Trường THCS & THPT Lê Thánh Tôn",
    desc: "Ứng dụng giải pháp vnEdu quản lý học tập toàn diện.",
  },
  {
    image: "/images/khach-hang/kho-van-mien-nam.jpg",
    icon: Warehouse,
    title: "Công ty CP Kho vận Miền Nam",
    desc: "Triển khai giải pháp hóa đơn điện tử, chữ ký số và dịch vụ Cloud.",
  },
  {
    image: "/images/gioi-thieu/van-phong.jpg",
    icon: Building2,
    title: "Chung cư Green Tower Quận 7",
    desc: "Cung cấp Internet, truyền hình và giải pháp Smart Building.",
  },
];

const KHACH_HANG_DOANH_NGHIEP = [
  { name: "BIDV", logo: "/images/partners/bidv.png" },
  { name: "Vietcombank", logo: "/images/partners/vietcombank.png" },
  { name: "Hoà Phát", logo: "/images/partners/hoaphat.png" },
  { name: "Viettel", logo: "/images/partners/viettel.png" },
  { name: "FPT", logo: "/images/partners/fpt.png" },
  { name: "Becamex", logo: "/images/partners/becamex.png" },
  { name: "VinFast", logo: "/images/partners/vinfast.png" },
  { name: "MobiFone", logo: "/images/partners/mobifone.png" },
];

const KHACH_HANG_CA_NHAN = [
  { icon: Wifi, title: "Internet – Truyền hình", desc: "200.000+ hộ gia đình tin dùng dịch vụ Internet cáp quang và truyền hình MyTV." },
  { icon: Smartphone, title: "Di động Vinaphone", desc: "Phủ sóng rộng khắp, chất lượng ổn định với hàng trăm nghìn thuê bao di động." },
  { icon: Camera, title: "Camera an ninh", desc: "Giải pháp camera thông minh được hàng chục nghìn hộ gia đình lắp đặt và sử dụng." },
  { icon: Home, title: "Giải pháp Smart Home", desc: "Biến ngôi nhà của bạn trở nên thông minh, an toàn và tiện nghi hơn mỗi ngày." },
];

const CASE_STUDIES = [
  {
    badge: "CÔNG NGHỆ",
    image: "/images/khach-hang/case-study-cloud.jpg",
    title: "Tập đoàn Sao Việt – Tối ưu hạ tầng CNTT với giải pháp Cloud của VNPT",
    desc: "VNPT Nam Sài Gòn đã triển khai giải pháp Cloud Server và Cloud Backup giúp Tập đoàn Sao Việt nâng cao khả năng vận hành, bảo mật dữ liệu.",
    stats: [
      { value: "40%", label: "Giảm chi phí hạ tầng" },
      { value: "99,99%", label: "Uptime hệ thống" },
      { value: "2 lần", label: "Tăng tốc độ xử lý" },
    ],
  },
  {
    badge: "GIÁO DỤC",
    image: "/images/doi-tuong/truong-hoc.jpg",
    title: "Trường THPT Lê Thánh Tôn – Chuyển đổi số trong quản lý và giảng dạy",
    desc: "Triển khai bộ giải pháp vnEdu giúp nhà trường tuyển sinh, học tập điện tử và học phí kết nối phụ huynh nhanh chóng.",
    stats: [
      { value: "80%", label: "Giảm thời gian quản lý" },
      { value: "100%", label: "Phụ huynh hài lòng" },
      { value: "60%", label: "Giảm chi phí vận hành" },
    ],
  },
  {
    badge: "DOANH NGHIỆP",
    image: "/images/doi-tuong/doanh-nghiep.jpg",
    title: "Công ty CP Kho vận Miền Nam – Số hóa quy trình với Hóa đơn điện tử",
    desc: "Áp dụng Hóa đơn điện tử VNPT Invoice giúp doanh nghiệp tiết kiệm thời gian, chi phí và tuân thủ quy định pháp luật.",
    stats: [
      { value: "70%", label: "Giảm thời gian xuất hóa đơn" },
      { value: "100%", label: "Hợp lệ cơ quan thuế" },
      { value: "30%", label: "Tiết kiệm chi phí in ấn, lưu trữ" },
    ],
  },
];

export default function KhachHangPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
        <Image
          src="/images/khach-hang/banner-khach-hang.png"
          alt="Khách hàng VNPT Nam Sài Gòn"
          fill
          sizes="100vw"
          quality={95}
          priority
          className="object-cover"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          <div className="max-w-xl -ml-[620px] [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.9))_drop-shadow(0_8px_20px_rgba(0,0,0,0.7))]">
            <Breadcrumb
              variant="light"
              items={[{ label: "Trang chủ", href: "/" }, { label: "Khách hàng" }]}
            />
            <h1 className="mt-3 text-3xl font-extrabold">KHÁCH HÀNG</h1>
            <p className="mt-2 text-white/85">
              VNPT Nam Sài Gòn tự hào là đối tác tin cậy của hàng nghìn khách hàng trên mọi
              lĩnh vực.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <s.icon size={18} className="text-vnpt-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{s.value}</div>
                    <div className="text-xs text-white/70">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DỰ ÁN TIÊU BIỂU */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">DỰ ÁN TIÊU BIỂU</h2>
            <p className="mt-1 text-sm text-slate-500">
              Những dự án, công trình chuyển đổi số nổi bật mà VNPT Nam Sài Gòn đã triển khai
              và mang lại hiệu quả rõ rệt cho khách hàng.
            </p>
          </div>
          <Link
            href="/khach-hang"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-vnpt hover:underline sm:flex"
          >
            Xem tất cả dự án <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {DU_AN_TIEU_BIEU.map((d) => (
            <div key={d.title} className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
              <div className="relative h-36 w-full">
                <Image
                  src={d.image}
                  alt={d.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-vnpt text-white shadow">
                  <d.icon size={16} />
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-slate-800">{d.title}</div>
                <p className="mt-1 text-xs text-slate-500">{d.desc}</p>
                <Link
                  href="/khach-hang"
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-vnpt hover:underline"
                >
                  Xem chi tiết <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* KHÁCH HÀNG DOANH NGHIỆP */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-800">KHÁCH HÀNG DOANH NGHIỆP</h2>
          <Link
            href="/khach-hang"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-vnpt hover:underline sm:flex"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {KHACH_HANG_DOANH_NGHIEP.map((c) => (
            <div
              key={c.name}
              className="relative flex h-16 items-center justify-center rounded-lg border border-slate-100 px-4 py-3 shadow-sm"
            >
              <Image src={c.logo} alt={c.name} fill sizes="120px" className="object-contain p-3" />
            </div>
          ))}
        </div>
      </section>

      {/* KHÁCH HÀNG HỘ CÁ NHÂN / HCNS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-800">KHÁCH HÀNG HỘ CÁ NHÂN / HCNS</h2>
          <Link
            href="/khach-hang"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-vnpt hover:underline sm:flex"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {KHACH_HANG_CA_NHAN.map((c) => (
            <div key={c.title} className="rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-vnpt text-white">
                <c.icon size={18} />
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-800">{c.title}</div>
              <p className="mt-1 text-xs text-slate-500">{c.desc}</p>
            </div>
          ))}
          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-5 text-white">
            <div>
              <div className="text-sm font-bold">Bạn đã sẵn sàng trải nghiệm dịch vụ của VNPT?</div>
              <p className="mt-1 text-xs text-white/75">
                Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
            </div>
            <div className="mt-4 space-y-2">
              <Link
                href="/lien-he"
                className="block rounded-md bg-vnpt-accent px-3 py-2 text-center text-xs font-semibold hover:bg-orange-600"
              >
                ĐĂNG KÝ TƯ VẤN NGAY
              </Link>
              <a href="tel:0838999333" className="block text-center text-xs text-white/80 hover:underline">
                Hoặc gọi ngay: 0838 999 333
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-bold text-slate-800">CASE STUDY – CÂU CHUYỆN THÀNH CÔNG</h2>
          <Link
            href="/khach-hang"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-vnpt hover:underline sm:flex"
          >
            Xem tất cả <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {CASE_STUDIES.map((cs) => (
            <div key={cs.title} className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
              <div className="relative h-40 w-full">
                <Image
                  src={cs.image}
                  alt={cs.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 rounded bg-vnpt-darker/90 px-2 py-1 text-[10px] font-bold tracking-wide text-white">
                  {cs.badge}
                </span>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold leading-snug text-slate-800">{cs.title}</div>
                <p className="mt-2 text-xs text-slate-500">{cs.desc}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  {cs.stats.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-sm font-extrabold text-vnpt">{s.value}</div>
                      <div className="text-[10px] leading-tight text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/khach-hang"
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-vnpt hover:underline"
                >
                  Xem chi tiết case study <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA + FORM */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid gap-8 rounded-xl bg-vnpt-light p-6 lg:grid-cols-[1.2fr_1fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-slate-800">
              Bạn đã sẵn sàng trải nghiệm dịch vụ của VNPT?
            </h2>
            <p className="mt-3 text-slate-600">
              Dù bạn là doanh nghiệp, trường học, bệnh viện hay hộ gia đình, VNPT Nam Sài Gòn
              luôn có giải pháp phù hợp đồng hành cùng bạn trên hành trình chuyển đổi số.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lien-he"
                className="rounded-md bg-vnpt-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                ĐĂNG KÝ TƯ VẤN NGAY
              </Link>
              <a
                href="tel:0838999333"
                className="rounded-md border border-vnpt px-5 py-2.5 text-sm font-semibold text-vnpt hover:bg-white"
              >
                Gọi ngay: 0838 999 333
              </a>
            </div>
          </div>
          <LeadForm title="Đăng ký tư vấn" subtitle="Chúng tôi sẽ liên hệ với bạn sớm nhất!" showCompany />
        </div>
      </section>
    </div>
  );
}
