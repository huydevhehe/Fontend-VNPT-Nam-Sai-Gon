import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Archive,
  Award,
  BarChart3,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileDown,
  FilePlus2,
  FileText,
  Headset,
  Landmark,
  Mail,
  MessageCircle,
  Phone,
  PenTool,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Video,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import LeadForm from "@/components/sections/LeadForm";
import { getCategoryProducts, getProductInCatalog } from "@/content/category-products";

export const metadata: Metadata = {
  title: "Hóa đơn - Thuế — VNPT Nam Sài Gòn",
  description:
    "Bộ giải pháp hóa đơn điện tử VNPT Invoice, hóa đơn từ máy tính tiền, SmartPOS, Thuế điện tử, BHXH điện tử IVAN — dễ dàng, an toàn, đúng chuẩn.",
};

const SAN_PHAM_ICON: Record<string, typeof Receipt> = {
  "vnpt-invoice": Receipt,
  "hoa-don-tu-may-tinh-tien": Store,
  smartpos: CreditCard,
  "thue-dien-tu": Landmark,
  "bhxh-dien-tu-ivan": ShieldCheck,
};

const HERO_DIEM_MANH = [
  { icon: Receipt, label: "Khởi tạo nhanh chóng" },
  { icon: Landmark, label: "Kết nối trực tiếp Tổng cục Thuế" },
  { icon: Archive, label: "Lưu trữ an toàn theo chuẩn ISO" },
  { icon: BarChart3, label: "Báo cáo - tra cứu tiện lợi" },
  { icon: Headset, label: "Hỗ trợ 24/7 mọi lúc mọi nơi" },
];

const DANH_CHO_AI = [
  { icon: Building2, title: "Doanh nghiệp", desc: "Mọi quy mô" },
  { icon: Store, title: "Hộ kinh doanh", desc: "Cá thể" },
  { icon: ShoppingBag, title: "Cửa hàng bán lẻ", desc: "Siêu thị, shop" },
  { icon: UtensilsCrossed, title: "Nhà hàng – Khách sạn", desc: "Quán ăn, khách sạn" },
  { icon: Calculator, title: "Kế toán dịch vụ", desc: "Đại lý thuế" },
  { icon: Landmark, title: "Cơ quan, đơn vị", desc: "Hành chính sự nghiệp" },
];

const VI_SAO_CHON = [
  "Kết nối trực tiếp Tổng cục Thuế – an toàn tuyệt đối",
  "Giao diện thân thiện – dễ dùng – tiết kiệm thời gian",
  "Tích hợp đa nền tảng: Web, Mobile, Phần mềm kế toán",
  "Lưu trữ hóa đơn 10 năm – tra cứu nhanh chóng",
  "Báo cáo, thống kê doanh thu theo thời gian thực",
  "Chi phí hợp lý – không cần đầu tư hạ tầng",
  "Hỗ trợ triển khai & CSKH 24/7 toàn quốc",
];

const DUNG_DE_LAM_GI = [
  { icon: FilePlus2, label: "Khởi tạo & phát hành hóa đơn điện tử" },
  { icon: Store, label: "Phát hành hóa đơn từ máy tính tiền" },
  { icon: PenTool, label: "Ký số & gửi hóa đơn cho khách hàng" },
  { icon: Archive, label: "Lưu trữ & tra cứu hóa đơn dễ dàng" },
  { icon: BarChart3, label: "Báo cáo doanh thu – quản lý thuế theo thời gian thực" },
  { icon: FileText, label: "Kê khai – nộp thuế điện tử" },
  { icon: ShieldCheck, label: "Giao dịch BHXH điện tử nhanh chóng" },
];

const QUY_TRINH = [
  { icon: Headset, label: "Tiếp nhận thông tin" },
  { icon: Search, label: "Tư vấn giải pháp phù hợp" },
  { icon: FileText, label: "Ký hợp đồng & đăng ký sử dụng" },
  { icon: FilePlus2, label: "Cài đặt & đào tạo sử dụng" },
  { icon: BarChart3, label: "Kết nối & kiểm thử" },
  { icon: Check, label: "Nghiệm thu & vận hành" },
  { icon: Headset, label: "Hỗ trợ 24/7 & đồng hành lâu dài" },
];

const HUONG_DAN_SU_DUNG = [
  "Hướng dẫn phát hành hóa đơn",
  "Hướng dẫn ký số & gửi hóa đơn",
  "Hướng dẫn tra cứu hóa đơn",
];

const TAI_LIEU = [
  "Catalogue VNPT Invoice",
  "Bảng giá dịch vụ",
  "Hướng dẫn sử dụng chi tiết",
  "Mẫu quy trình triển khai",
];

const FAQ = [
  {
    q: "Hóa đơn điện tử VNPT Invoice có được Tổng cục Thuế chấp nhận không?",
    a: "Có. VNPT Invoice kết nối trực tiếp với Tổng cục Thuế, đáp ứng đầy đủ Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.",
  },
  {
    q: "Tôi có thể tích hợp VNPT Invoice với phần mềm kế toán không?",
    a: "Có. VNPT Invoice hỗ trợ tích hợp linh hoạt với các phần mềm kế toán, ERP phổ biến qua API.",
  },
  {
    q: "Dữ liệu hóa đơn được lưu trữ trong bao lâu?",
    a: "Hóa đơn điện tử được lưu trữ an toàn tới 10 năm, tra cứu nhanh chóng mọi lúc, mọi nơi.",
  },
  {
    q: "Hóa đơn từ máy tính tiền có bắt buộc phải kết nối với cơ quan thuế không?",
    a: "Có. Dữ liệu hóa đơn từ máy tính tiền được truyền trực tiếp về cơ quan thuế theo đúng quy định hiện hành.",
  },
  {
    q: "Chi phí khởi tạo có phát sinh thêm không?",
    a: "Không. Chi phí đã được niêm yết rõ ràng theo từng gói, không phát sinh thêm phụ phí ẩn.",
  },
  {
    q: "Thời gian triển khai và sử dụng mất bao lâu?",
    a: "Đội ngũ VNPT Nam Sài Gòn hỗ trợ khởi tạo và bàn giao trong thời gian ngắn nhất sau khi đăng ký.",
  },
  {
    q: "Tôi có thể dùng thử trước khi đăng ký không?",
    a: "Có. Khách hàng được dùng thử miễn phí 30 ngày với đầy đủ tính năng trước khi quyết định đăng ký.",
  },
  {
    q: "VNPT có hỗ trợ khi gặp sự cố không?",
    a: "Có. Đội ngũ chuyên gia VNPT Nam Sài Gòn hỗ trợ 24/7 qua hotline, Zalo OA và email.",
  },
];

export default function HoaDonThuePage() {
  const sanPham = getCategoryProducts("hoa-don-thue");
  const vnptInvoice = getProductInCatalog("hoa-don-thue", "vnpt-invoice");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/san-pham" },
              { label: "Hóa đơn - Thuế" },
            ]}
          />

          <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_360px]">
            <div className="relative z-10 text-white">
              <span className="inline-block rounded-full bg-emerald-500 px-4 py-1 text-xs font-bold tracking-wide">
                HÓA ĐƠN - THUẾ
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
                HÓA ĐƠN ĐIỆN TỬ VNPT INVOICE
              </h1>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                Dễ dàng – An toàn – Đúng chuẩn
              </p>
              <p className="mt-4 max-w-xl text-white/85">
                Giải pháp hóa đơn điện tử được Tổng cục Thuế khuyến nghị. Đáp ứng đầy đủ
                Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {HERO_DIEM_MANH.map((d) => (
                  <div key={d.label} className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                      <d.icon size={22} className="text-white" />
                    </div>
                    <span className="text-xs text-white/80">{d.label}</span>
                  </div>
                ))}
              </div>

              <div className="relative mt-8 hidden h-52 max-w-md overflow-hidden rounded-2xl lg:block">
                <Image
                  src="/images/hero/hero-city-night.jpg"
                  alt="VNPT Invoice - Hóa đơn điện tử"
                  fill
                  sizes="(max-width: 1024px) 0px, 448px"
                  quality={90}
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={64} className="text-white/90" />
                </div>
              </div>
            </div>

            <div className="lg:mt-0">
              <LeadForm
                title="DÙNG THỬ MIỄN PHÍ 30 NGÀY"
                subtitle="Trải nghiệm đầy đủ tính năng"
                interestOptions={sanPham.map((p) => p.title)}
                showCompany
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* BỘ GIẢI PHÁP */}
        <section>
          <h2 className="text-xl font-bold text-slate-800">
            BỘ GIẢI PHÁP HÓA ĐƠN - THUẾ TOÀN DIỆN
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {sanPham.map((p) => {
              const Icon = SAN_PHAM_ICON[p.slug] ?? Receipt;
              return (
                <div
                  key={p.id}
                  className="flex flex-col items-center rounded-xl border border-slate-100 p-5 text-center shadow-sm transition hover:shadow-md"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light">
                    <Icon size={26} className="text-vnpt" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-800">{p.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{p.shortDesc}</p>
                  <Link
                    href={`/san-pham/hoa-don-thue/${p.slug}`}
                    className="mt-3 text-xs font-semibold text-vnpt hover:underline"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* DANH CHO AI + VI SAO CHON */}
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">DÀNH CHO AI?</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {DANH_CHO_AI.map((d) => (
                <div
                  key={d.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vnpt-light">
                    <d.icon size={20} className="text-vnpt" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{d.title}</div>
                    <div className="text-xs text-slate-500">{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">VÌ SAO CHỌN VNPT INVOICE?</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_260px]">
              <ul className="space-y-3">
                {VI_SAO_CHON.map((v) => (
                  <li key={v} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={16} className="mt-0.5 shrink-0 text-vnpt" />
                    {v}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-slate-100 bg-vnpt-light p-4 text-center shadow-sm">
                <Award size={36} className="mx-auto text-vnpt" />
                <p className="mt-2 text-sm font-bold text-slate-800">
                  ĐƯỢC TỔNG CỤC THUẾ KHUYẾN NGHỊ SỬ DỤNG
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Đáp ứng đầy đủ Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC
                </p>
                <Link
                  href="/lien-he"
                  className="mt-4 inline-block rounded-md bg-vnpt px-4 py-2 text-xs font-semibold text-white hover:bg-vnpt-dark"
                >
                  XEM CHỨNG NHẬN
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* DUNG DE LAM GI */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-800">DÙNG ĐỂ LÀM GÌ?</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {DUNG_DE_LAM_GI.map((d) => (
              <div
                key={d.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center"
              >
                <d.icon size={26} className="text-vnpt" />
                <span className="text-xs font-medium text-slate-700">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BANG GIA */}
        {vnptInvoice && vnptInvoice.pricing.length > 0 && (
          <section id="bang-gia" className="mt-14 scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-800">BẢNG GIÁ DỊCH VỤ VNPT INVOICE</h2>
            <div className="mt-6">
              <PricingTable pricing={vnptInvoice.pricing} />
            </div>
            <p className="mt-2 text-xs text-slate-400">* Giá trên chưa bao gồm VAT</p>
          </section>
        )}

        {/* QUY TRINH */}
        <section className="mt-14">
          <h2 className="text-xl font-bold text-slate-800">QUY TRÌNH ĐĂNG KÝ & TRIỂN KHAI</h2>
          <div className="mt-8 flex flex-wrap items-start justify-between gap-y-6">
            {QUY_TRINH.map((q, i) => (
              <div key={q.label} className="flex items-start">
                <div className="flex w-24 flex-col items-center gap-2 text-center sm:w-28">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-vnpt-light">
                    <q.icon size={24} className="text-vnpt" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{q.label}</span>
                </div>
                {i < QUY_TRINH.length - 1 && (
                  <ChevronRight
                    size={18}
                    className="mt-6 hidden shrink-0 text-slate-300 sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* HUONG DAN + TAI LIEU */}
        <section className="mt-14 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">HƯỚNG DẪN SỬ DỤNG</h2>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {HUONG_DAN_SU_DUNG.map((h) => (
                <div key={h} className="rounded-xl border border-slate-100 p-4 text-center">
                  <Video size={24} className="mx-auto text-vnpt" />
                  <p className="mt-2 text-xs font-medium text-slate-700">{h}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-vnpt">
                    Xem video →
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">TÀI LIỆU & BIỂU MẪU</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {TAI_LIEU.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 p-4"
                >
                  <FileText size={20} className="shrink-0 text-vnpt" />
                  <div>
                    <p className="text-xs font-medium text-slate-700">{t}</p>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <FileDown size={12} /> PDF
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ + CAN HO TRO */}
        <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div id="faq" className="scroll-mt-24">
            <h2 className="text-xl font-bold text-slate-800">CÂU HỎI THƯỜNG GẶP</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {FAQ.map((f, i) => (
                <details
                  key={f.q}
                  className="group rounded-lg border border-slate-100 p-4 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-2 text-sm font-semibold text-slate-800">
                    <span>
                      {i + 1}. {f.q}
                    </span>
                    <ChevronDown
                      size={16}
                      className="mt-0.5 shrink-0 text-slate-400 transition group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 text-sm text-slate-500">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-vnpt-dark p-6 text-white lg:h-fit">
            <h3 className="text-lg font-bold">CẦN HỖ TRỢ NGAY?</h3>
            <p className="mt-2 text-sm text-white/80">
              Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ bạn!
            </p>
            <div className="mt-4 space-y-3 text-sm">
              <a href="tel:0838999333" className="flex items-center gap-2 hover:underline">
                <Phone size={16} /> Hotline: 0838 999 333
              </a>
              <span className="flex items-center gap-2">
                <MessageCircle size={16} /> Zalo OA: VNPT Nam Sài Gòn
              </span>
              <a
                href="mailto:kinhdoanh@vnptnamsaigon.vn"
                className="flex items-center gap-2 hover:underline"
              >
                <Mail size={16} /> Email: kinhdoanh@vnptnamsaigon.vn
              </a>
            </div>
            <Link
              href="/lien-he"
              className="mt-5 block rounded-md bg-white py-2.5 text-center text-sm font-semibold text-vnpt-dark hover:bg-white/90"
            >
              LIÊN HỆ NGAY
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
