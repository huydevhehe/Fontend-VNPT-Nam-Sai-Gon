import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Antenna,
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  Gauge,
  Gift,
  GraduationCap,
  Headset,
  Laptop,
  MapPin,
  Search,
  ShieldCheck,
  Signal,
  Smartphone,
  Tv,
  Wifi,
  Wrench,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import { getCategoryBySlug } from "@/content/category-map";
import { getCategoryProducts } from "@/content/category-products";

export const metadata: Metadata = { title: "Internet VNPT - Băng rộng cố định — VNPT Nam Sài Gòn" };

const HERO_FEATURES = [
  { icon: Gauge, title: "Tốc độ cao", desc: "Ổn định 24/7" },
  { icon: Wifi, title: "Công nghệ", desc: "hiện đại" },
  { icon: Headset, title: "Hỗ trợ", desc: "tận tâm" },
  { icon: Wrench, title: "Lắp đặt", desc: "nhanh chóng" },
];

const HIGHLIGHTS = [
  { icon: Gauge, title: "Tốc độ siêu nhanh", desc: "Đáp ứng mọi nhu cầu" },
  { icon: Signal, title: "Kết nối ổn định", desc: "Ít gián đoạn" },
  { icon: MapPin, title: "Phủ sóng rộng", desc: "Toàn thành phố" },
  { icon: Wifi, title: "Thiết bị WiFi 6", desc: "Hiệu suất vượt trội" },
  { icon: ShieldCheck, title: "Bảo mật nhiều lớp", desc: "An toàn tuyệt đối" },
  { icon: Headset, title: "Hỗ trợ 24/7", desc: "Tận tâm - chuyên nghiệp" },
];

const PACKAGE_META: Array<{
  name: string;
  tag: string;
  popular?: boolean;
  feature: string;
  color: "emerald" | "blue" | "violet" | "amber";
}> = [
  { name: "Fiber Eco", tag: "Phù hợp nhu cầu cơ bản", feature: "Web, lướt mạng, mạng xã hội", color: "emerald" },
  { name: "Fiber Plus", tag: "Phù hợp gia đình", popular: true, feature: "Xem phim HD, học online, làm việc", color: "blue" },
  { name: "Fiber Turbo", tag: "Phù hợp gia đình nhiều thiết bị", feature: "4K/8K, game online, họp trực tuyến", color: "violet" },
  { name: "Fiber VIP", tag: "Dành cho doanh nghiệp", feature: "Tốc độ tối đa, IP tĩnh, ưu tiên", color: "amber" },
];

const PACKAGE_STYLES: Record<
  string,
  { text: string; border: string; button: string }
> = {
  emerald: { text: "text-emerald-600", border: "border-slate-100", button: "bg-emerald-600 hover:bg-emerald-700" },
  blue: { text: "text-vnpt", border: "border-vnpt ring-1 ring-vnpt/15", button: "bg-vnpt hover:bg-vnpt-dark" },
  violet: { text: "text-violet-600", border: "border-slate-100", button: "bg-violet-600 hover:bg-violet-700" },
  amber: { text: "text-vnpt-accent", border: "border-slate-100", button: "bg-vnpt-accent hover:bg-orange-600" },
};

const TRAI_NGHIEM = [
  { icon: Tv, title: "Xem phim 4K/8K", desc: "Không giật lag" },
  { icon: GraduationCap, title: "Học tập trực tuyến", desc: "Ổn định, hiệu quả" },
  { icon: Laptop, title: "Làm việc từ xa", desc: "Kết nối liên tục" },
  { icon: Gamepad2, title: "Game online", desc: "Ping thấp, mượt mà" },
  { icon: Camera, title: "Camera an ninh", desc: "Giám sát mọi lúc" },
  { icon: Smartphone, title: "Kết nối nhiều thiết bị", desc: "Không lo quá tải" },
];

const TAI_SAO = [
  { title: "Hạ tầng cáp quang hiện đại", desc: "Phủ sóng rộng khắp" },
  { title: "Tốc độ thật - Giá trị thật", desc: "Cam kết đúng tốc độ" },
  { title: "Dịch vụ chuyên nghiệp", desc: "Hỗ trợ nhanh chóng" },
  { title: "Thương hiệu uy tín", desc: "Top 1 nhà mạng Việt Nam" },
];

const PHU_SONG_STATS = [
  { value: "100%", label: "Quận/Huyện" },
  { value: "99%", label: "Hộ gia đình" },
  { value: "500.000+", label: "Khách hàng tin dùng" },
];

const DISTRICTS = ["Củ Chi", "Hóc Môn", "Quận 12", "Gò Vấp", "Bình Chánh", "Thủ Đức", "Quận 7", "Quận 9", "Nhà Bè"];

const QUY_TRINH = [
  { icon: ClipboardList, title: "Đăng ký", desc: "Tư vấn gói cước phù hợp" },
  { icon: Search, title: "Khảo sát", desc: "Kiểm tra hạ tầng miễn phí" },
  { icon: Wrench, title: "Lắp đặt", desc: "Thi công nhanh chóng trong ngày" },
  { icon: CheckCircle2, title: "Nghiệm thu", desc: "Kiểm tra & bàn giao" },
  { icon: Headset, title: "Hỗ trợ", desc: "Đồng hành 24/7" },
];

const FAQS = [
  {
    q: "Lắp đặt internet VNPT mất bao lâu?",
    a: "Sau khi đăng ký và khảo sát hạ tầng, đội ngũ kỹ thuật VNPT Nam Sài Gòn thi công và bàn giao trong vòng 24 giờ đối với khu vực đã có hạ tầng sẵn.",
  },
  {
    q: "Tôi có thể kiểm tra hạ tầng tại nhà không?",
    a: "Có. Bạn có thể để lại thông tin qua form đăng ký hoặc gọi hotline 0838 999 333 để được kiểm tra hạ tầng miễn phí tại địa chỉ lắp đặt.",
  },
  {
    q: "Internet VNPT có cam kết tốc độ không?",
    a: "VNPT cam kết đúng tốc độ đã đăng ký, kèm chính sách bồi hoàn nếu chất lượng đường truyền không đạt như cam kết trong hợp đồng.",
  },
  {
    q: "Nếu sự cố thì liên hệ hỗ trợ như thế nào?",
    a: "Bạn liên hệ hotline 0838 999 333 hoặc Zalo OA VNPT Nam Sài Gòn, đội ngũ kỹ thuật hỗ trợ 24/7 và xử lý sự cố nhanh chóng.",
  },
];

export default function BangRongCoDinhPage() {
  const category = getCategoryBySlug("bang-rong-co-dinh");
  if (!category) return null;

  const products = getCategoryProducts(category.slug);
  const giaDinh = products.find((p) => p.slug === "internet-gia-dinh");
  const doanhNghiep = products.find((p) => p.slug === "internet-doanh-nghiep");
  const priceRows = new Map(
    [...(giaDinh?.pricing[0]?.rows ?? []), ...(doanhNghiep?.pricing[0]?.rows ?? [])].map(
      (row) => [row[0], row] as const,
    ),
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm", href: "/san-pham" }, { label: "Internet" }]}
          />

          <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-wide text-vnpt-accent">INTERNET VNPT</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
                KẾT NỐI SIÊU TỐC
                <br />
                TRẢI NGHIỆM ĐỈNH CAO
              </h1>
              <p className="mt-3 text-white/85">
                Đường truyền ổn định - Tốc độ vượt trội
                <br />
                Phù hợp cho mọi nhu cầu
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {HERO_FEATURES.map((f) => (
                  <div key={f.title} className="flex items-center gap-2">
                    <f.icon size={20} className="shrink-0 text-vnpt-accent" />
                    <div className="text-xs leading-tight">
                      <div className="font-semibold">{f.title}</div>
                      <div className="text-white/70">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/lien-he"
                  className="rounded-md bg-vnpt-accent px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                >
                  ĐĂNG KÝ NGAY
                </Link>
                <Link
                  href="/lien-he"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  KIỂM TRA HẠ TẦNG
                </Link>
              </div>
            </div>

            <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="Internet VNPT tốc độ cao"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/80 via-transparent to-vnpt-dark/20" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-vnpt-darker/60 px-8 py-5 text-center backdrop-blur-sm">
                <div className="text-4xl font-extrabold text-white">1000</div>
                <div className="text-sm font-semibold tracking-widest text-vnpt-accent">Mbps</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH + SIDEBAR */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* HIGHLIGHTS */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h.title}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm"
                >
                  <h.icon size={24} className="text-vnpt" />
                  <span className="text-sm font-semibold text-slate-800">{h.title}</span>
                  <span className="text-xs text-slate-500">{h.desc}</span>
                </div>
              ))}
            </div>

            {/* GÓI CƯỚC */}
            <div>
              <h2 className="text-center text-xl font-bold text-slate-800">GÓI CƯỚC INTERNET VNPT</h2>
              <p className="mt-1 text-center text-sm text-slate-500">
                Đa dạng gói cước - Phù hợp mọi nhu cầu
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PACKAGE_META.map((pkg) => {
                  const row = priceRows.get(pkg.name);
                  const speed = row?.[1] ?? "-";
                  const price = row?.[2] ?? "Liên hệ";
                  const style = PACKAGE_STYLES[pkg.color];
                  return (
                    <div
                      key={pkg.name}
                      className={`relative rounded-xl border ${style.border} p-5 shadow-sm`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-vnpt px-3 py-1 text-xs font-semibold text-white">
                          Phổ biến
                        </span>
                      )}
                      <div className={`text-center font-bold ${style.text}`}>{pkg.name}</div>
                      <p className="mt-1 text-center text-xs text-slate-500">{pkg.tag}</p>

                      <div className="mt-4 text-center">
                        <div className="text-xs text-slate-400">Tốc độ</div>
                        <div className="text-2xl font-extrabold text-slate-800">{speed}</div>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                        <Wifi size={14} className="shrink-0 text-slate-400" />
                        {pkg.feature}
                      </div>

                      <div className="mt-4 text-center">
                        {price === "Liên hệ" ? (
                          <div className={`text-lg font-extrabold ${style.text}`}>Liên hệ</div>
                        ) : (
                          <div className="text-lg font-extrabold text-slate-800">
                            {price}
                            <span className="text-xs font-normal text-slate-400">/tháng</span>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/lien-he"
                        className={`mt-4 block rounded-md ${style.button} py-2 text-center text-sm font-semibold text-white`}
                      >
                        {price === "Liên hệ" ? "LIÊN HỆ TƯ VẤN" : "ĐĂNG KÝ NGAY"}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-xl bg-vnpt-light py-3 text-sm font-semibold text-vnpt">
                <span className="flex items-center gap-1.5">
                  <Gift size={16} /> Tặng modem WiFi 6
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span>Miễn phí lắp đặt</span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span>Hỗ trợ kỹ thuật 24/7</span>
              </div>
            </div>

            {/* TRẢI NGHIỆM + TẠI SAO CHỌN VNPT */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-800">TRẢI NGHIỆM TUYỆT VỜI VỚI INTERNET VNPT</h2>
                <div className="grid grid-cols-2 gap-4">
                  {TRAI_NGHIEM.map((t) => (
                    <div key={t.title} className="flex items-start gap-3">
                      <t.icon size={20} className="mt-0.5 shrink-0 text-vnpt" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                        <div className="text-xs text-slate-500">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-800">TẠI SAO CHỌN VNPT?</h2>
                <div className="flex items-center gap-6 rounded-xl border border-slate-100 p-5 shadow-sm">
                  <ul className="flex-1 space-y-3">
                    {TAI_SAO.map((t) => (
                      <li key={t.title} className="flex items-start gap-2">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-vnpt" />
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{t.title}</div>
                          <div className="text-xs text-slate-500">{t.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <ShieldCheck size={72} className="hidden shrink-0 text-vnpt/20 sm:block" />
                </div>
              </div>
            </div>

            {/* PHỦ SÓNG RỘNG KHẮP */}
            <div>
              <h2 className="text-lg font-bold text-slate-800">PHỦ SÓNG RỘNG KHẮP</h2>
              <p className="mt-1 text-sm text-slate-500">
                Internet VNPT có mặt tại toàn bộ TP. Hồ Chí Minh và các tỉnh lân cận
              </p>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="grid grid-cols-3 gap-4 lg:grid-cols-1">
                  {PHU_SONG_STATS.map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
                      <div className="text-2xl font-extrabold text-vnpt">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-vnpt-light p-6">
                  <div className="mb-4 flex items-center justify-center gap-2 text-vnpt">
                    <Antenna size={22} />
                    <span className="text-sm font-semibold">Trạm phát sóng VNPT khu vực TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DISTRICTS.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-vnpt/20 bg-white px-3 py-1.5 text-xs font-medium text-vnpt shadow-sm"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QUY TRÌNH LẮP ĐẶT */}
            <div>
              <h2 className="mb-6 text-lg font-bold text-slate-800">QUY TRÌNH LẮP ĐẶT</h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
                {QUY_TRINH.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    {i < QUY_TRINH.length - 1 && (
                      <ArrowRight
                        size={16}
                        className="absolute right-[-20px] top-6 hidden text-slate-300 sm:block"
                      />
                    )}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                      <step.icon size={22} />
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">{step.title}</div>
                    <div className="text-xs text-slate-500">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="mb-4 text-lg font-bold text-slate-800">CÂU HỎI THƯỜNG GẶP</h2>
              <div className="space-y-3">
                {FAQS.map((f) => (
                  <details key={f.q} className="group rounded-lg border border-slate-100 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800">
                      {f.q}
                      <ArrowRight size={14} className="shrink-0 text-vnpt transition group-open:rotate-90" />
                    </summary>
                    <p className="mt-2 text-sm text-slate-500">{f.a}</p>
                  </details>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/lien-he" className="text-sm font-semibold text-vnpt hover:underline">
                  Xem tất cả câu hỏi →
                </Link>
              </div>
            </div>
          </div>

          {/* SIDEBAR PHẢI */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <LeadForm
              title="Đăng ký tư vấn"
              subtitle="Nhận ưu đãi tốt nhất từ VNPT"
              interestOptions={PACKAGE_META.map((p) => p.name)}
            />

            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-vnpt to-vnpt-dark p-5 text-white">
              <Gift size={28} className="text-vnpt-accent" />
              <h3 className="mt-3 text-sm font-semibold">KHUYẾN MÃI HẤP DẪN</h3>
              <p className="mt-2 text-2xl font-extrabold">
                Giảm đến 20%
                <br />
                <span className="text-base font-semibold text-white/85">khi đăng ký trực tuyến</span>
              </p>
              <Link
                href="/khuyen-mai"
                className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25"
              >
                XEM CHI TIẾT <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
