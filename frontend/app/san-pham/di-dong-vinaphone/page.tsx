import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileCheck,
  Gift,
  Globe,
  Headset,
  LifeBuoy,
  ListChecks,
  MapPin,
  MessageCircle,
  Package,
  Send,
  Smartphone,
  UserPlus,
  Wifi,
  Zap,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SimPicker from "@/components/sections/SimPicker";
import { getCategoryProducts } from "@/content/category-products";
import { getAllProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Di động Vinaphone — VNPT Nam Sài Gòn",
};

const HERO_STATS = [
  { icon: Wifi, title: "Tốc độ 4G/5G", desc: "Siêu nhanh" },
  { icon: MapPin, title: "Phủ sóng 63 tỉnh thành", desc: "Toàn quốc" },
  { icon: CreditCard, title: "Giá cước ưu đãi", desc: "Nhiều lựa chọn" },
  { icon: Headset, title: "Chăm sóc 24/7", desc: "Tận tâm chuyên nghiệp" },
];

const TINH_NANG = [
  { icon: Wifi, title: "Data 4G/5G", desc: "Tốc độ cao, truy cập mọi lúc mọi nơi" },
  { icon: Package, title: "Gói cước đa dạng", desc: "Trả trước – Trả sau linh hoạt" },
  { icon: Smartphone, title: "eSIM Vinaphone", desc: "Kích hoạt nhanh không cần SIM" },
  { icon: Globe, title: "Roaming quốc tế", desc: "Kết nối toàn cầu giá cước tốt" },
  { icon: MessageCircle, title: "SMS Brandname", desc: "Giải pháp tin nhắn doanh nghiệp" },
  { icon: Gift, title: "Vinaphone Plus", desc: "Ưu đãi, tích điểm đổi quà hấp dẫn" },
];

const VI_SAO = [
  { icon: Wifi, title: "Mạng lưới mạnh nhất", desc: "Phủ sóng 63 tỉnh thành, vùng sâu vùng xa" },
  { icon: Zap, title: "Tốc độ 4G/5G vượt trội", desc: "Công nghệ hiện đại, kết nối siêu nhanh" },
  { icon: Package, title: "Gói cước phù hợp", desc: "Phù hợp mọi nhu cầu cá nhân & doanh nghiệp" },
  { icon: Headset, title: "Chăm sóc tận tâm", desc: "Tổng đài 18001091 hỗ trợ 24/7" },
  { icon: Gift, title: "Nhiều ưu đãi hấp dẫn", desc: "Tích điểm, đổi quà giá trị hấp dẫn" },
];

const QUY_TRINH = [
  { icon: ListChecks, title: "Chọn số & gói cước", desc: "Chọn số đẹp và gói cước phù hợp nhu cầu" },
  { icon: UserPlus, title: "Đăng ký thông tin", desc: "Điền thông tin cá nhân chính xác" },
  { icon: FileCheck, title: "Xác thực & ký hợp đồng", desc: "Xác thực thông tin, ký hợp đồng điện tử" },
  { icon: Zap, title: "Kích hoạt SIM", desc: "Kích hoạt SIM và sử dụng ngay lập tức" },
  { icon: LifeBuoy, title: "Hỗ trợ sau bán hàng", desc: "Chăm sóc & hỗ trợ trong suốt quá trình sử dụng" },
];

const FAQ = [
  "Làm thế nào để kiểm tra dung lượng còn lại?",
  "Cách đăng ký gói cước Vinaphone?",
  "eSIM Vinaphone là gì? Có ưu điểm gì?",
  "Cước roaming quốc tế được tính như thế nào?",
  "Làm sao để tích điểm Vinaphone Plus?",
  "Khiếu nại & hỗ trợ liên hệ ở đâu?",
];

const HERO_BADGES = [
  { icon: MessageCircle, style: { top: "10%", left: "8%" } },
  { icon: Globe, style: { top: "16%", left: "88%" } },
  { icon: Wifi, style: { top: "78%", left: "10%" } },
  { icon: Gift, style: { top: "82%", left: "86%" } },
];

export default function DiDongVinaphonePage() {
  const products = getCategoryProducts("di-dong-vinaphone");
  const goiCuoc = products.filter((p) => p.pricing.length > 0);
  const dichVu = products.filter((p) => p.pricing.length === 0);
  const goiData = getAllProducts().filter((p) => p.category === "Gói data di động");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/san-pham" },
              { label: "Di động Vinaphone" },
            ]}
          />

          <div className="mt-6 grid items-center gap-8 lg:grid-cols-2">
            <div className="relative z-10 text-white">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
                DI ĐỘNG VINAPHONE
              </span>
              <h1 className="mt-4 leading-tight">
                KẾT NỐI <span className="text-vnpt-accent">MỌI LÚC</span>
                <br />
                MỌI NƠI
              </h1>
              <p className="mt-4 max-w-md text-white/85">
                Mạng di động tốc độ cao – Phủ sóng rộng khắp
                <br />
                Ưu đãi hấp dẫn – Dịch vụ vượt trội
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="#chon-so"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
                >
                  CHỌN SỐ &amp; MUA SIM ONLINE <ArrowRight size={16} />
                </Link>
                <Link
                  href="#goi-data"
                  className="inline-flex items-center rounded-md border border-white/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  XEM GÓI DATA
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {HERO_STATS.map((s) => (
                  <div key={s.title} className="flex items-start gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <s.icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight">{s.title}</div>
                      <div className="text-xs text-white/60">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="Di động Vinaphone - Kết nối mọi lúc mọi nơi"
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
                <span className="text-6xl font-extrabold text-white drop-shadow-lg">5G</span>
              </div>
              {HERO_BADGES.map((b) => (
                <div
                  key={`${b.style.top}-${b.style.left}`}
                  style={b.style}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2 text-vnpt shadow-lg"
                >
                  <b.icon size={16} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 6 TÍNH NĂNG NỔI BẬT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {TINH_NANG.map((t) => (
            <div
              key={t.title}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <t.icon size={22} />
              </div>
              <span className="text-sm font-semibold text-slate-800">{t.title}</span>
              <span className="text-xs text-slate-500">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CHỌN SỐ */}
      <section id="chon-so" className="scroll-mt-24 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">CHỌN SỐ THUÊ BAO</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">
            Chọn đầu số VinaPhone và dãy số bạn thích. Không tìm thấy số ưng ý? Gọi
            <a href="tel:0838999333" className="font-semibold text-vnpt"> 0838 999 333 </a>
            để được hỗ trợ tìm số theo yêu cầu.
          </p>
          <div className="mt-8">
            <SimPicker />
          </div>
        </div>
      </section>

      {/* GÓI DATA 4G/5G */}
      <section id="goi-data" className="scroll-mt-24 bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">GÓI DATA 4G/5G</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">
            {goiData.length} gói data theo ngày, tuần và tháng — chọn đúng nhu cầu sử dụng.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {goiData.slice(0, 12).map((p) => {
              const [, cycle, price] = p.pricing[0].rows[0];
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-slate-800">{p.title}</h3>
                    <span className="text-xs text-slate-400">{cycle}</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-vnpt">{price}</p>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {p.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Check size={13} className="mt-0.5 shrink-0 text-vnpt" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/lien-he"
                    className="mt-4 rounded-md bg-vnpt py-2 text-center text-sm font-semibold text-white hover:bg-vnpt-dark"
                  >
                    ĐĂNG KÝ
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GÓI CƯỚC NỔI BẬT */}
      <section id="goi-cuoc" className="scroll-mt-24 bg-vnpt-light/40 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">GÓI CƯỚC NỔI BẬT</h2>

          <div className="mt-6 flex flex-wrap justify-center gap-6 border-b border-slate-200 text-sm font-semibold text-slate-500">
            <span className="border-b-2 border-vnpt pb-3 text-vnpt">TRẢ TRƯỚC</span>
            <span className="pb-3">TRẢ SAU</span>
            <span className="pb-3">DATA 4G/5G</span>
            <span className="pb-3">ESIM</span>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {goiCuoc.map((p, idx) => {
              const row = p.pricing[0]?.rows[0];
              const price = row?.[2] ?? "Liên hệ";
              const cycle = row?.[1] ?? "";
              const highlight = idx === 0;
              return (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-xl border p-5 shadow-sm ${
                    highlight ? "border-vnpt shadow-md" : "border-slate-100"
                  }`}
                >
                  {highlight && (
                    <span className="absolute -top-3 left-4 rounded-full bg-vnpt-accent px-3 py-1 text-xs font-bold text-white">
                      BEST SELLER
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-800">{p.title.toUpperCase()}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-vnpt">{price}</span>
                    {cycle && <span className="text-xs text-slate-400">/{cycle}</span>}
                  </div>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check size={14} className="mt-0.5 shrink-0 text-vnpt" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/san-pham/di-dong-vinaphone/${p.slug}`}
                    className={`mt-4 rounded-md py-2 text-center text-sm font-semibold ${
                      highlight
                        ? "bg-vnpt text-white hover:bg-vnpt-dark"
                        : "border border-slate-200 text-slate-700 hover:border-vnpt hover:text-vnpt"
                    }`}
                  >
                    ĐĂNG KÝ
                  </Link>
                  <p className="mt-2 text-center text-[11px] text-slate-400">
                    Soạn {p.title.split(" ").pop()} gửi 888
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link href="/san-pham/di-dong-vinaphone" className="text-sm font-semibold text-vnpt">
              Xem tất cả gói cước trả trước →
            </Link>
          </div>
        </div>
      </section>

      {/* VÌ SAO CHỌN VINAPHONE */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">VÌ SAO CHỌN VINAPHONE?</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {VI_SAO.map((v) => (
            <div key={v.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <v.icon size={26} />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-800">{v.title}</div>
              <div className="mt-1 text-xs text-slate-500">{v.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PHỦ SÓNG TOÀN QUỐC + DỊCH VỤ NỔI BẬT */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt-dark p-6 text-white">
            <div>
              <h3 className="text-lg font-bold">PHỦ SÓNG TOÀN QUỐC</h3>
              <div className="mt-6 flex items-center gap-2">
                <Globe size={28} className="text-vnpt-accent" />
                <div>
                  <div className="text-3xl font-extrabold">&gt; 99%</div>
                  <div className="text-xs text-white/70">Dân số được phủ sóng 4G</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <MapPin size={28} className="text-vnpt-accent" />
                <div>
                  <div className="text-3xl font-extrabold">63/63</div>
                  <div className="text-xs text-white/70">Tỉnh/Thành phố</div>
                </div>
              </div>
            </div>
            <Link
              href="/lien-he"
              className="mt-8 inline-block rounded-md bg-white/15 px-4 py-2.5 text-center text-sm font-semibold hover:bg-white/25"
            >
              KIỂM TRA PHỦ SÓNG
            </Link>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-800">DỊCH VỤ NỔI BẬT</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {dichVu.map((p) => (
                <div key={p.id} className="flex gap-3 rounded-xl border border-slate-100 p-4 shadow-sm">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                    {p.slug.includes("esim") ? <Smartphone size={20} /> : <Globe size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{p.title.toUpperCase()}</div>
                    <p className="mt-0.5 text-xs text-slate-500">{p.shortDesc}</p>
                    <Link
                      href={`/san-pham/di-dong-vinaphone/${p.slug}`}
                      className="mt-1 inline-block text-xs font-semibold text-vnpt"
                    >
                      Tìm hiểu ngay →
                    </Link>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">SMS BRANDNAME</div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tin nhắn thương hiệu doanh nghiệp, chăm sóc khách hàng hiệu quả
                  </p>
                  <Link href="/lien-he" className="mt-1 inline-block text-xs font-semibold text-vnpt">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
              <div className="flex gap-3 rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Gift size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">VINAPHONE PLUS</div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Tích điểm – Đổi quà ưu đãi độc quyền cho khách hàng
                  </p>
                  <Link href="/lien-he" className="mt-1 inline-block text-xs font-semibold text-vnpt">
                    Tham gia ngay →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MUA SIM ONLINE */}
      <section id="mua-sim" className="mx-auto max-w-7xl scroll-mt-24 px-6 pb-12">
        <div className="grid items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-br from-vnpt-dark to-vnpt-darker px-8 py-8 text-white lg:grid-cols-[1fr_auto]">
          <div>
            <h3 className="text-xl font-extrabold">
              MUA SIM ONLINE
              <br />
              <span className="text-vnpt-accent">GIAO SIM TẬN NƠI</span>
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-vnpt-accent" /> Chính chủ 100%
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-vnpt-accent" /> Kích hoạt nhanh
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-vnpt-accent" /> Giao sim miễn phí
              </li>
            </ul>
            <Link
              href="/lien-he"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-white text-vnpt-dark px-5 py-2.5 text-sm font-semibold hover:bg-slate-100"
            >
              ĐẶT SIM NGAY <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hidden h-32 w-44 shrink-0 items-center justify-center rounded-xl bg-white/10 lg:flex">
            <Send size={40} className="text-white/70" />
          </div>
        </div>
      </section>

      {/* QUY TRÌNH ĐĂNG KÝ */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <h2 className="text-center text-slate-800">QUY TRÌNH ĐĂNG KÝ DỄ DÀNG</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {QUY_TRINH.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <s.icon size={24} />
              </div>
              <div className="mt-3 text-sm font-bold text-slate-800">{s.title}</div>
              <div className="mt-1 text-xs text-slate-500">{s.desc}</div>
              {i < QUY_TRINH.length - 1 && (
                <ArrowRight
                  size={18}
                  className="absolute right-[-14px] top-6 hidden text-slate-300 lg:block"
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-5 text-slate-800">CÂU HỎI THƯỜNG GẶP</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {FAQ.map((q, i) => (
                <div
                  key={q}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-4 text-sm"
                >
                  <span className="text-slate-700">
                    {i + 1}. {q}
                  </span>
                  <ChevronDown size={16} className="shrink-0 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-vnpt-dark to-vnpt-darker p-6 text-white">
            <h3 className="text-lg font-bold">CẦN HỖ TRỢ NGAY?</h3>
            <p className="mt-2 text-sm text-white/80">
              Đội ngũ Vinaphone luôn sẵn sàng hỗ trợ bạn 24/7.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="tel:18001091"
                className="rounded-md bg-white/15 px-4 py-2.5 text-center text-sm font-semibold hover:bg-white/25"
              >
                GỌI 18001091
              </a>
              <Link
                href="/lien-he"
                className="rounded-md border border-white/40 px-4 py-2.5 text-center text-sm font-semibold hover:bg-white/10"
              >
                CHAT ZALO OA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
