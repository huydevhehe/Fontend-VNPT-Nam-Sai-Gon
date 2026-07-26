import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  Building2,
  Cpu,
  FileText,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  MessageCircle,
  Phone,
  Plane,
  QrCode,
  Radar,
  ShieldCheck,
  Sprout,
  UserCog,
  Users,
  Wallet,
  Workflow,
  Zap,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";
import { getCategoryProducts } from "@/content/category-products";
import SolutionTabs from "./SolutionTabs";

export const metadata = {
  title: "Chuyển đổi số — VNPT Nam Sài Gòn",
};

const STATS = [
  { value: "100+", label: "Giải pháp số đồng bộ" },
  { value: "10.000+", label: "Khách hàng tiêu biểu" },
  { value: "20+ năm", label: "Kinh nghiệm triển khai" },
  { value: "24/7", label: "Hỗ trợ & vận hành chuyên nghiệp" },
];

const HERO_BADGES = [
  { icon: Building2, label: "DOANH NGHIỆP THÔNG MINH", style: { top: "10%", left: "8%" } },
  { icon: Landmark, label: "CHÍNH QUYỀN SỐ", style: { top: "6%", left: "78%" } },
  { icon: Cpu, label: "NỀN TẢNG SỐ", style: { top: "80%", left: "80%" } },
  { icon: Users, label: "CÔNG DÂN SỐ", style: { top: "84%", left: "10%" } },
];

// Ánh xạ 10 giải pháp trong hệ sinh thái với sản phẩm thật (getCategoryProducts) theo tên
// gần đúng. Chỉ 3/10 tên khớp trực tiếp với dữ liệu đã cào (iOffice, ERP, HIS) — các mục
// còn lại (CRM, HRM, vnEdu, IOC, Smart City, Smart Agriculture, Smart Tourism) chưa có sản
// phẩm cùng tên trong nguồn cào nên link chung về trang danh mục /san-pham/chuyen-doi-so.
const ECOSYSTEM = [
  {
    name: "iOffice",
    desc: "Nền tảng quản trị công việc toàn diện cho doanh nghiệp hiện đại.",
    icon: FileText,
    color: "bg-emerald-500",
    slug: "vnptit-he-thong-van-ban-dieu-hanh",
  },
  {
    name: "CRM",
    desc: "Quản lý quan hệ khách hàng tập trung, tối ưu quy trình bán hàng.",
    icon: Users,
    color: "bg-blue-500",
    slug: null,
  },
  {
    name: "ERP",
    desc: "Quản trị nguồn lực doanh nghiệp tổng thể, liên thông mọi nghiệp vụ.",
    icon: Boxes,
    color: "bg-orange-500",
    slug: "vnptit-vnpt-erp",
  },
  {
    name: "HRM",
    desc: "Quản trị nhân sự toàn diện, tinh gọn quy trình, nâng cao hiệu suất.",
    icon: UserCog,
    color: "bg-purple-500",
    slug: null,
  },
  {
    name: "vnEdu",
    desc: "Giải pháp chuyển đổi số toàn diện cho ngành Giáo dục & Đào tạo.",
    icon: GraduationCap,
    color: "bg-indigo-500",
    slug: null,
  },
  {
    name: "HIS",
    desc: "Hệ thống thông tin bệnh viện hiện đại, nâng cao chất lượng khám chữa bệnh.",
    icon: HeartPulse,
    color: "bg-rose-500",
    slug: "vnptit-vnpt-his",
  },
  {
    name: "IOC",
    desc: "Trung tâm điều hành thông minh, ra quyết định dựa trên dữ liệu thời gian thực.",
    icon: Radar,
    color: "bg-sky-500",
    slug: null,
  },
  {
    name: "Smart City",
    desc: "Giải pháp đô thị thông minh, cải thiện chất lượng sống cho người dân.",
    icon: Building2,
    color: "bg-cyan-500",
    slug: null,
  },
  {
    name: "Smart Agriculture",
    desc: "Nông nghiệp thông minh, tối ưu sản xuất – truy xuất nguồn gốc.",
    icon: Sprout,
    color: "bg-lime-600",
    slug: null,
  },
  {
    name: "Smart Tourism",
    desc: "Du lịch thông minh, nâng cao trải nghiệm du khách, thúc đẩy ngành du lịch.",
    icon: Plane,
    color: "bg-amber-500",
    slug: null,
  },
];

const VI_SAO_CHON = [
  { icon: Workflow, title: "Hệ sinh thái đồng bộ", desc: "Giải pháp toàn diện, tích hợp linh hoạt, dễ mở rộng." },
  { icon: Cpu, title: "Công nghệ hiện đại", desc: "Ứng dụng AI, Big Data, Cloud, IoT, Blockchain." },
  { icon: Zap, title: "Triển khai nhanh chóng", desc: "Quy trình chuẩn hóa, đội ngũ giàu kinh nghiệm." },
  { icon: ShieldCheck, title: "Bảo mật an toàn", desc: "Tiêu chuẩn bảo mật quốc tế, đảm bảo an toàn dữ liệu." },
  { icon: Phone, title: "Hỗ trợ 24/7", desc: "Đồng hành xuyên suốt, hỗ trợ nhanh chóng." },
  { icon: Wallet, title: "Chi phí tối ưu – Hiệu quả cao", desc: "Giải pháp phù hợp, tối ưu chi phí đầu tư." },
];

const PRICING = [
  {
    name: "iOffice",
    desc: "Quản trị công việc",
    price: "25.000đ",
    unit: "/người dùng/tháng",
    featured: false,
    items: ["Quản lý công việc", "Văn bản – hồ sơ", "Lịch họp – nhắc việc"],
    cta: "ĐĂNG KÝ DÙNG THỬ",
    slug: "vnptit-he-thong-van-ban-dieu-hanh",
  },
  {
    name: "CRM",
    desc: "Quản trị khách hàng",
    price: "35.000đ",
    unit: "/người dùng/tháng",
    featured: false,
    items: ["Quản lý khách hàng", "Quản lý cơ hội", "Báo cáo – phân tích"],
    cta: "ĐĂNG KÝ DÙNG THỬ",
    slug: null,
  },
  {
    name: "ERP",
    desc: "Quản trị tổng thể",
    price: "120.000đ",
    unit: "/người dùng/tháng",
    featured: true,
    items: ["Tài chính – Kế toán", "Mua hàng – Kho", "Bán hàng – Sản xuất"],
    cta: "ĐĂNG KÝ TƯ VẤN",
    slug: "vnptit-vnpt-erp",
  },
  {
    name: "HRM",
    desc: "Quản trị nhân sự",
    price: "30.000đ",
    unit: "/người dùng/tháng",
    featured: false,
    items: ["Hồ sơ nhân sự", "Chấm công – tính lương", "Đánh giá KPI"],
    cta: "ĐĂNG KÝ DÙNG THỬ",
    slug: null,
  },
  {
    name: "vnEdu",
    desc: "Giải pháp giáo dục",
    price: "Liên hệ",
    unit: "để được báo giá",
    featured: false,
    items: ["Quản lý trường học", "Học tập trực tuyến", "Thanh toán học phí"],
    cta: "LIÊN HỆ TƯ VẤN",
    slug: null,
  },
];

const KHACH_HANG = ["Sacombank", "AEON", "TTC Group", "Bệnh viện Chợ Rẫy", "UBND Quận 7 TP. Hồ Chí Minh", "Vinamilk"];

const QUY_TRINH = [
  { step: "01", title: "Khảo sát & Tư vấn", desc: "Phân tích nhu cầu, đề xuất giải pháp phù hợp" },
  { step: "02", title: "Demo & Báo giá", desc: "Trình diễn giải pháp, báo giá chi tiết" },
  { step: "03", title: "Ký kết hợp đồng", desc: "Thống nhất giải pháp, ký kết hợp đồng" },
  { step: "04", title: "Triển khai & Đào tạo", desc: "Triển khai hệ thống, đào tạo người dùng" },
  { step: "05", title: "Nghiệm thu & Bàn giao", desc: "Nghiệm thu, bàn giao đưa vào sử dụng" },
  { step: "06", title: "Hỗ trợ & Bảo trì", desc: "Hỗ trợ 24/7, nâng cấp và bảo trì định kỳ" },
];

export default function ChuyenDoiSoPage() {
  const products = getCategoryProducts("chuyen-doi-so");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/san-pham" },
              { label: "Chuyển đổi số" },
            ]}
          />

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
            <div className="relative z-10 text-white">
              <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                CHUYỂN ĐỔI SỐ TOÀN DIỆN
                <br />
                <span className="text-vnpt-accent">KIẾN TẠO TƯƠNG LAI SỐ</span>
              </h1>
              <p className="mt-4 max-w-xl text-white/85">
                VNPT cung cấp hệ sinh thái giải pháp chuyển đổi số toàn diện cho Doanh
                nghiệp, Cơ quan và các ngành kinh tế – xã hội
              </p>

              <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="mt-1 text-xs text-white/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden h-80 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="VNPT Nam Sài Gòn - Chuyển đổi số"
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-vnpt-darker/80 via-transparent to-vnpt-dark/30" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-6 backdrop-blur-sm">
                <span className="text-lg font-extrabold text-white">VNPT</span>
              </div>
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

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* HỆ SINH THÁI GIẢI PHÁP */}
        <div>
          <h2 className="text-center text-xl font-bold text-vnpt">
            HỆ SINH THÁI GIẢI PHÁP CHUYỂN ĐỔI SỐ
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {ECOSYSTEM.map((s) => (
              <Link
                key={s.name}
                href={s.slug ? `/san-pham/chuyen-doi-so/${s.slug}` : "/san-pham/chuyen-doi-so"}
                className="rounded-xl border border-slate-100 p-5 shadow-sm transition hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon size={22} className="text-white" />
                </div>
                <div className="mt-3 text-sm font-bold text-slate-800">{s.name}</div>
                <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
                <span className="mt-3 inline-block text-xs font-semibold text-vnpt">
                  Xem chi tiết →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* VÌ SAO CHỌN VNPT */}
        <div className="mt-16 rounded-2xl bg-vnpt-light p-8">
          <h2 className="text-center text-xl font-bold text-vnpt">
            VÌ SAO CHỌN VNPT CHO CHUYỂN ĐỔI SỐ?
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {VI_SAO_CHON.map((v) => (
              <div key={v.title} className="text-center">
                <v.icon size={26} className="mx-auto text-vnpt" />
                <div className="mt-2 text-sm font-bold text-slate-800">{v.title}</div>
                <p className="mt-1 text-xs text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GIẢI PHÁP THEO NHU CẦU */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-bold text-vnpt">GIẢI PHÁP THEO NHU CẦU</h2>
          <div className="mt-8">
            <SolutionTabs />
          </div>
        </div>

        {/* BẢNG GIÁ DỊCH VỤ */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-bold text-vnpt">BẢNG GIÁ DỊCH VỤ</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-xl border p-5 ${
                  p.featured ? "border-vnpt shadow-lg" : "border-slate-100 shadow-sm"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-vnpt-accent px-3 py-1 text-[10px] font-bold text-white">
                    PHỔ BIẾN
                  </span>
                )}
                <div className="text-center">
                  <div className="text-sm font-bold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.desc}</div>
                  <div className="mt-3 text-xl font-extrabold text-vnpt">{p.price}</div>
                  <div className="text-[11px] text-slate-400">{p.unit}</div>
                </div>
                <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-1.5">
                      <span className="text-vnpt">✓</span> {it}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.slug ? `/san-pham/chuyen-doi-so/${p.slug}` : "/lien-he"}
                  className={`mt-5 block rounded-md py-2 text-center text-xs font-semibold ${
                    p.featured
                      ? "bg-vnpt text-white hover:bg-vnpt-dark"
                      : "border border-slate-200 text-slate-700 hover:border-vnpt hover:text-vnpt"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            * Giá trên chưa bao gồm VAT — {products.length}+ giải pháp chuyển đổi số khác, xem
            tại{" "}
            <Link href="/san-pham/chuyen-doi-so" className="text-vnpt hover:underline">
              danh mục sản phẩm
            </Link>
          </p>
        </div>

        {/* KHÁCH HÀNG TIÊU BIỂU */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-bold text-vnpt">KHÁCH HÀNG TIÊU BIỂU</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {KHACH_HANG.map((k) => (
              <div
                key={k}
                className="flex h-20 items-center justify-center rounded-xl border border-slate-100 px-3 text-center text-sm font-bold text-slate-500 shadow-sm"
              >
                {k}
              </div>
            ))}
          </div>
        </div>

        {/* QUY TRÌNH TRIỂN KHAI */}
        <div className="mt-16">
          <h2 className="text-center text-xl font-bold text-vnpt">QUY TRÌNH TRIỂN KHAI</h2>
          <div className="relative mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-slate-200 lg:block" />
            {QUY_TRINH.map((q) => (
              <div key={q.step} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-vnpt text-sm font-bold text-white">
                  {q.step}
                </div>
                <div className="mt-2 text-sm font-bold text-slate-800">{q.title}</div>
                <p className="mt-1 px-1 text-xs text-slate-500">{q.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA CUỐI TRANG */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[auto_1fr_auto]">
          <Handshake size={72} className="hidden shrink-0 text-vnpt-accent lg:block" />

          <div className="text-white">
            <h2 className="text-xl font-extrabold">BẮT ĐẦU CHUYỂN ĐỔI SỐ CÙNG VNPT NAM SÀI GÒN</h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng đồng hành cùng bạn trên hành
              trình chuyển đổi số thành công.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="tel:0838999333"
                className="flex items-center gap-2 rounded-md border border-white/60 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <Phone size={16} /> Hotline: 0838 999 333
              </a>
              <Link
                href="/lien-he"
                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-vnpt hover:bg-white/90"
              >
                ĐĂNG KÝ TƯ VẤN NGAY
              </Link>
              <a
                href="/lien-he"
                className="flex items-center gap-2 rounded-md bg-vnpt-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <MessageCircle size={16} /> CHAT ZALO OA
              </a>
            </div>
          </div>

          <div className="hidden flex-col items-center gap-2 rounded-xl bg-white/95 p-4 text-center lg:flex">
            <QrCode size={72} className="text-vnpt" />
            <p className="text-xs text-slate-600">Quét mã Zalo OA để được tư vấn</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <LeadForm title="Đăng ký tư vấn Chuyển đổi số" interestOptions={["Chuyển đổi số"]} showCompany />
      </section>
    </div>
  );
}
