import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Cloud,
  Handshake,
  Headset,
  PenTool,
  Quote,
  Receipt,
  Smartphone,
  Tv,
  Users,
  Wifi,
  Workflow,
} from "lucide-react";
import { getAllArticles } from "@/lib/data";
import HeroCarousel, { type HeroSlide } from "@/components/sections/HeroCarousel";
import LeadForm from "@/components/sections/LeadForm";
import StatBar from "@/components/sections/StatBar";

const DICH_VU = [
  { icon: Wifi, label: "Internet", desc: "Cáp quang tốc độ cao ổn định", href: "/san-pham/bang-rong-co-dinh" },
  { icon: Tv, label: "Truyền hình MyTV", desc: "Hơn 180 kênh đặc sắc kho phim đa dạng", href: "/san-pham/bang-rong-co-dinh" },
  { icon: Smartphone, label: "Vinaphone", desc: "Di động 4G/5G ưu đãi vượt trội", href: "/san-pham/di-dong-vinaphone" },
  { icon: Receipt, label: "Hóa đơn điện tử", desc: "Tiết kiệm - An toàn đúng pháp luật", href: "/san-pham/hoa-don-thue" },
  { icon: PenTool, label: "Chữ ký số", desc: "SmartCA ký số mọi lúc mọi nơi", href: "/san-pham/chu-ky-so" },
  { icon: Cloud, label: "Cloud & Data Center", desc: "Hạ tầng số hiện đại bảo mật vượt trội", href: "/san-pham/cloud-idc" },
  { icon: Workflow, label: "Giải pháp số", desc: "Giải pháp toàn diện cho doanh nghiệp & CQNN", href: "/san-pham/chuyen-doi-so" },
];

const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/images/hero/hero-fiber.jpg",
    title: ["KẾT NỐI SIÊU TỐC", "TRẢI NGHIỆM ĐỈNH CAO"],
    subtitle:
      "Internet cáp quang tốc độ cao, ổn định - Phù hợp mọi nhu cầu gia đình và doanh nghiệp.",
    primaryCta: { label: "ĐĂNG KÝ NGAY", href: "/lien-he", icon: <Headset size={18} /> },
    secondaryCta: {
      label: "XEM GÓI CƯỚC",
      href: "/san-pham/bang-rong-co-dinh",
      icon: <ArrowRight size={16} />,
    },
  },
  // Tạm ẩn 2 slide dưới đây, giữ lại để bật lại sau:
  // {
  //   image: "/images/hero/hero-city-night.jpg",
  //   title: ["CHUYỂN ĐỔI SỐ TOÀN DIỆN", "CÙNG VNPT NAM SÀI GÒN"],
  //   subtitle:
  //     "Giải pháp số tin cậy cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan Nhà nước.",
  //   primaryCta: { label: "TƯ VẤN NGAY", href: "/lien-he", icon: <Headset size={18} /> },
  //   secondaryCta: { label: "XEM SẢN PHẨM", href: "/san-pham", icon: <ArrowRight size={16} /> },
  // },
  // {
  //   image: "/images/hero/hero-datacenter.jpg",
  //   title: ["HẠ TẦNG CLOUD MẠNH MẼ", "AN TOÀN - LINH HOẠT - MỞ RỘNG"],
  //   subtitle:
  //     "Cloud Server, Data Center chuẩn quốc tế cho doanh nghiệp sẵn sàng bứt phá cùng VNPT.",
  //   primaryCta: { label: "TƯ VẤN GIẢI PHÁP", href: "/lien-he", icon: <Headset size={18} /> },
  //   secondaryCta: {
  //     label: "XEM CLOUD & IDC",
  //     href: "/san-pham/cloud-idc",
  //     icon: <ArrowRight size={16} />,
  //   },
  // },
];

const DOI_TUONG = [
  { slug: "ca-nhan", label: "Cá nhân", image: "/images/doi-tuong/ca-nhan.jpg" },
  { slug: "ho-kinh-doanh", label: "Hộ kinh doanh", image: "/images/doi-tuong/ho-kinh-doanh.jpg" },
  { slug: "doanh-nghiep", label: "Doanh nghiệp", image: "/images/doi-tuong/doanh-nghiep.jpg" },
  { slug: "co-quan-nha-nuoc", label: "Cơ quan nhà nước", image: "/images/doi-tuong/co-quan-nha-nuoc.jpg" },
  { slug: "truong-hoc", label: "Trường học", image: "/images/doi-tuong/truong-hoc.jpg" },
  { slug: "benh-vien", label: "Bệnh viện", image: "/images/doi-tuong/benh-vien.jpg" },
];

const KHUYEN_MAI = [
  {
    image: "/images/hero/hero-fiber.jpg",
    title: "Internet siêu tốc độ",
    discount: "Ưu đãi cực sốc 20%",
    note: "Gói FiberVNN",
  },
  {
    image: "/images/khuyen-mai/mytv.jpg",
    title: "Combo Internet + MyTV",
    discount: "Chỉ từ 205.000đ/tháng",
    note: "Ưu đãi thiết bị, phí lắp đặt",
  },
  {
    image: "/images/khuyen-mai/hoa-don.jpg",
    title: "Hóa đơn điện tử",
    discount: "Tiết kiệm đến 50%",
    note: "Chi phí khi đăng ký mới",
  },
  {
    image: "/images/khuyen-mai/chu-ky-so.jpg",
    title: "Chữ ký số SmartCA",
    discount: "Ưu đãi đến 30%",
    note: "Khi đăng ký gói 2 năm",
  },
];

const NEWS_TAGS = [
  { label: "HƯỚNG DẪN", className: "bg-vnpt-accent" },
  { label: "SẢN PHẨM", className: "bg-vnpt" },
  { label: "KHUYẾN MÃI", className: "bg-vnpt-dark" },
  { label: "TIN TỨC VNPT", className: "bg-slate-800" },
  { label: "CÔNG NGHỆ", className: "bg-vnpt-darker" },
];

const DOI_TAC_TIEU_BIEU = [
  { name: "BIDV", logo: "/images/partners/bidv.png" },
  { name: "Vietcombank", logo: "/images/partners/vietcombank.png" },
  { name: "Hoà Phát", logo: "/images/partners/hoaphat.png" },
  { name: "Viettel", logo: "/images/partners/viettel.png" },
  { name: "FPT", logo: "/images/partners/fpt.png" },
  { name: "Becamex", logo: "/images/partners/becamex.png" },
  { name: "VinFast", logo: "/images/partners/vinfast.png" },
  { name: "MobiFone", logo: "/images/partners/mobifone.png" },
];

const TESTIMONIALS = [
  {
    quote: "Dịch vụ Internet VNPT rất ổn định, tốc độ cao, hỗ trợ kỹ thuật nhanh chóng. Rất hài lòng!",
    name: "Anh Minh Tuấn",
    role: "Giám đốc công ty TNHH ABC",
    avatar: "/images/testimonials/minh-tuan.jpg",
  },
  {
    quote: "Hóa đơn điện tử VNPT Invoice giúp chúng tôi tiết kiệm thời gian và chi phí đáng kể.",
    name: "Chị Thu Hằng",
    role: "Kế toán trưởng",
    avatar: "/images/testimonials/thu-hang.jpg",
  },
  {
    quote: "Đội ngũ nhân viên tư vấn chuyên nghiệp, tận tâm. Luôn đồng hành cùng doanh nghiệp.",
    name: "Anh Quang Huy",
    role: "CEO - Công ty DEF",
    avatar: "/images/testimonials/quang-huy.jpg",
  },
];

export default function HomePage() {
  const cleanNews = getAllArticles().filter((a) => /[à-ỹ]/i.test(a.title));
  const news = cleanNews.slice(0, 4);
  const newsGrid = cleanNews.slice(0, 5);

  return (
    <div>
      <HeroCarousel slides={HERO_SLIDES} />

      {/* NỘI DUNG CHÍNH + FORM SIDEBAR */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* 7 DỊCH VỤ */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {DICH_VU.map((d) => (
                <Link
                  key={d.label}
                  href={d.href}
                  className="flex h-full flex-col items-center gap-2 rounded-lg border border-slate-100 p-4 text-center shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                    <d.icon size={24} />
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{d.label}</span>
                  <span className="text-xs text-slate-500">{d.desc}</span>
                </Link>
              ))}
            </div>

            {/* GIẢI PHÁP THEO ĐỐI TƯỢNG */}
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-800">GIẢI PHÁP THEO ĐỐI TƯỢNG</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {DOI_TUONG.map((d) => (
                  <Link
                    key={d.slug}
                    href={`/giai-phap/${d.slug}`}
                    className="group overflow-hidden rounded-lg border border-slate-100 shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-28 w-full">
                      <Image
                        src={d.image}
                        alt={d.label}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 text-center">
                      <div className="text-sm font-semibold text-slate-800">{d.label}</div>
                      <div className="text-xs text-vnpt">Xem giải pháp →</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* KHUYẾN MÃI + TIN TỨC */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">KHUYẾN MÃI NỔI BẬT</h2>
                  <Link href="/khuyen-mai" className="text-sm font-semibold text-vnpt">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {KHUYEN_MAI.map((k) => (
                    <div key={k.title} className="relative overflow-hidden rounded-lg p-4 text-white">
                      <Image
                        src={k.image}
                        alt={k.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/95 via-vnpt-darker/40 to-transparent" />
                      <h3 className="relative text-sm font-semibold">{k.title}</h3>
                      <p className="relative mt-2 text-lg font-bold text-vnpt-accent">{k.discount}</p>
                      <p className="relative text-xs text-white/70">{k.note}</p>
                      <Link
                        href="/khuyen-mai"
                        className="relative mt-3 inline-block rounded bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm hover:bg-white/25"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">TIN TỨC MỚI</h2>
                  <Link href="/tin-tuc" className="text-sm font-semibold text-vnpt">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="space-y-6">
                  {news.map((a) => (
                    <Link
                      key={a.id}
                      href={`/tin-tuc/${a.slug}`}
                      className="flex gap-3 rounded-lg transition hover:bg-vnpt-light"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-vnpt-darker">
                        {a.images[0] && (
                          <Image src={a.images[0]} alt={a.title} fill sizes="80px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">{a.title}</h3>
                        {a.date && <span className="text-xs text-slate-400">{a.date}</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* TIN TỨC MỚI NHẤT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="relative mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">TIN TỨC MỚI NHẤT</h2>
          <Link
            href="/tin-tuc"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-semibold text-vnpt"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {newsGrid.map((a, i) => {
            const tag = NEWS_TAGS[i % NEWS_TAGS.length];
            return (
              <Link
                key={a.id}
                href={`/tin-tuc/${a.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-28 w-full">
                  {a.images[0] && (
                    <Image
                      src={a.images[0]}
                      alt={a.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition group-hover:scale-105"
                    />
                  )}
                  <span
                    className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold text-white ${tag.className}`}
                  >
                    {tag.label}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">{a.title}</h3>
                  <span className="mt-2 inline-block text-xs font-semibold text-vnpt">Xem chi tiết →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ĐỐI TÁC TIÊU BIỂU */}
      <section className="mx-auto max-w-7xl px-6 pb-10">
        <h2 className="mb-6 text-center text-xl font-bold text-slate-800">ĐỐI TÁC TIÊU BIỂU</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {DOI_TAC_TIEU_BIEU.map((d) => (
            <div
              key={d.name}
              className="relative flex h-16 items-center justify-center rounded-lg border border-slate-100 px-4 py-3 shadow-sm"
            >
              <Image
                src={d.logo}
                alt={d.name}
                fill
                sizes="120px"
                className="object-contain p-3"
              />
            </div>
          ))}
        </div>
      </section>

      <StatBar
        items={[
          { value: "20+", label: "Năm kinh nghiệm", icon: Award },
          { value: "100.000+", label: "Khách hàng tin tưởng", icon: Users },
          { value: "500+", label: "Đối tác toàn quốc", icon: Handshake },
          { value: "24/7", label: "Hỗ trợ tận tâm", icon: Headset },
        ]}
      />

      {/* KHÁCH HÀNG NÓI VỀ CHÚNG TÔI */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-800">KHÁCH HÀNG NÓI VỀ CHÚNG TÔI</h2>
          <Link
            href="/khach-hang"
            className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-semibold text-vnpt"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
              <Quote size={28} className="text-vnpt-light" fill="currentColor" />
              <p className="mt-3 text-sm text-slate-600">{t.quote}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                  <Image src={t.avatar} alt={t.name} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
