import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  Headset,
  PenTool,
  Receipt,
  Smartphone,
  Tv,
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
    image: "/images/hero/hero-city-night.jpg",
    title: ["CHUYỂN ĐỔI SỐ TOÀN DIỆN", "CÙNG VNPT NAM SÀI GÒN"],
    subtitle:
      "Giải pháp số tin cậy cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan Nhà nước.",
    primaryCta: { label: "TƯ VẤN NGAY", href: "/lien-he", icon: <Headset size={18} /> },
    secondaryCta: { label: "XEM SẢN PHẨM", href: "/san-pham", icon: <ArrowRight size={16} /> },
  },
  {
    image: "/images/hero/hero-datacenter.jpg",
    title: ["HẠ TẦNG CLOUD MẠNH MẼ", "AN TOÀN - LINH HOẠT - MỞ RỘNG"],
    subtitle:
      "Cloud Server, Data Center chuẩn quốc tế cho doanh nghiệp sẵn sàng bứt phá cùng VNPT.",
    primaryCta: { label: "TƯ VẤN GIẢI PHÁP", href: "/lien-he", icon: <Headset size={18} /> },
    secondaryCta: {
      label: "XEM CLOUD & IDC",
      href: "/san-pham/cloud-idc",
      icon: <ArrowRight size={16} />,
    },
  },
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
  { icon: Wifi, title: "Internet siêu tốc độ", discount: "Ưu đãi cực sốc 20%", note: "Gói FiberVNN" },
  { icon: Tv, title: "Combo Internet + MyTV", discount: "Chỉ từ 205.000đ/tháng", note: "Ưu đãi thiết bị, phí lắp đặt" },
  { icon: Receipt, title: "Hóa đơn điện tử", discount: "Tiết kiệm đến 50%", note: "Chi phí khi đăng ký mới" },
  { icon: PenTool, title: "Chữ ký số SmartCA", discount: "Ưu đãi đến 30%", note: "Khi đăng ký gói 2 năm" },
];

export default function HomePage() {
  const news = getAllArticles().slice(0, 3);

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
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm transition hover:shadow-md"
                >
                  <d.icon size={26} className="text-vnpt" />
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
                    className="group overflow-hidden rounded-xl border border-slate-100 shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative h-28 w-full">
                      <Image
                        src={d.image}
                        alt={d.label}
                        fill
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
                    <div
                      key={k.title}
                      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-vnpt to-vnpt-dark p-4 text-white"
                    >
                      <k.icon size={64} className="absolute -bottom-3 -right-3 text-white/10" />
                      <h3 className="relative text-sm font-semibold">{k.title}</h3>
                      <p className="relative mt-2 text-lg font-bold text-vnpt-accent">{k.discount}</p>
                      <p className="relative text-xs text-white/70">{k.note}</p>
                      <Link
                        href="/khuyen-mai"
                        className="relative mt-3 inline-block rounded-md bg-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/25"
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
                <div className="space-y-4">
                  {news.map((a) => (
                    <Link
                      key={a.id}
                      href={`/tin-tuc/${a.slug}`}
                      className="flex gap-3 rounded-lg p-2 transition hover:bg-vnpt-light"
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-vnpt-darker">
                        {a.images[0] && (
                          <Image src={a.images[0]} alt={a.title} fill className="object-cover" />
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

      <StatBar
        items={[
          { value: "20+", label: "Năm kinh nghiệm" },
          { value: "100.000+", label: "Khách hàng tin tưởng" },
          { value: "500+", label: "Đối tác toàn quốc" },
          { value: "24/7", label: "Hỗ trợ tận tâm" },
        ]}
      />
    </div>
  );
}
