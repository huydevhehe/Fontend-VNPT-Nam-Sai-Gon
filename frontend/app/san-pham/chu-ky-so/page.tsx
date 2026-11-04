import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Banknote,
  Boxes,
  Building2,
  Calculator,
  Check,
  ClipboardList,
  Clock,
  Cloud,
  CloudCog,
  FileSignature,
  FileText,
  GraduationCap,
  Headset,
  HeartPulse,
  IdCard,
  Landmark,
  Lock,
  Mail,
  MessageCircle,
  PenTool,
  Phone,
  Play,
  Receipt,
  Settings,
  Ship,
  ShieldCheck,
  Smartphone,
  Store,
  Unplug,
  User,
  Wifi,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";
import LeadForm from "@/components/sections/LeadForm";
import StatBar from "@/components/sections/StatBar";
import { getCategoryProducts } from "@/content/category-products";

export const metadata: Metadata = {
  title: "Chữ ký số SmartCA — VNPT Nam Sài Gòn",
  description:
    "VNPT SmartCA — chữ ký số từ xa, ký mọi lúc mọi nơi, không cần USB Token. An toàn, bảo mật theo tiêu chuẩn Châu Âu, được pháp luật Việt Nam công nhận.",
};

const HERO_CHECKS = [
  "An toàn - Bảo mật theo tiêu chuẩn Châu Âu",
  "Xác thực nhanh chóng - Ký trong 3 giây",
  "Được pháp luật Việt Nam công nhận",
];

const HERO_BADGES = [
  { icon: Settings, style: { top: "8%", left: "10%" } },
  { icon: Cloud, style: { top: "6%", left: "88%" } },
  { icon: Lock, style: { top: "48%", left: "92%" } },
  { icon: Cloud, style: { top: "88%", left: "86%" } },
];

const DANH_CHO_AI = [
  { icon: User, label: "Cá nhân", desc: "Ký hợp đồng, giao dịch điện tử nhanh chóng" },
  { icon: Store, label: "Hộ kinh doanh", desc: "Ký hóa đơn điện tử, tờ khai thuế" },
  { icon: Building2, label: "Doanh nghiệp", desc: "Ký văn bản, hợp đồng, hóa đơn điện tử" },
  { icon: Calculator, label: "Kế toán", desc: "Ký báo cáo thuế, BHXH, hóa đơn điện tử" },
  { icon: GraduationCap, label: "Trường học", desc: "Ký hồ sơ, chứng từ điện tử" },
  { icon: HeartPulse, label: "Bệnh viện", desc: "Ký hồ sơ, chứng từ dễ dàng, bảo mật" },
];

const TAI_SAO_CHON = [
  { icon: Clock, label: "Ký trong 3 giây", desc: "Xác thực nhanh chóng, tiết kiệm thời gian" },
  { icon: Smartphone, label: "Ký trên mọi thiết bị", desc: "Điện thoại, máy tính, tablet" },
  { icon: Unplug, label: "Không cần USB Token", desc: "Công nghệ bảo mật chuẩn Châu Âu, tiện lợi" },
  { icon: Lock, label: "Bảo mật cao", desc: "Chỉ mình bạn có thể sử dụng" },
  { icon: Wifi, label: "Ký mọi lúc, mọi nơi", desc: "Chỉ cần Internet là có thể ký" },
  { icon: BadgeCheck, label: "Được pháp luật công nhận", desc: "Theo Nghị định 130/2018/NĐ-CP và eIDAS Châu Âu" },
];

const SMARTCA_UNG_DUNG = [
  { icon: Receipt, label: "Hóa đơn điện tử", desc: "Ký hóa đơn nhanh chóng" },
  { icon: FileText, label: "Thuế điện tử", desc: "Ký tờ khai, báo cáo thuế" },
  { icon: ShieldCheck, label: "BHXH điện tử", desc: "Ký hồ sơ BHXH, BHYT" },
  { icon: Banknote, label: "Ngân hàng điện tử", desc: "Ký giao dịch ngân hàng" },
  { icon: FileSignature, label: "eContract", desc: "Ký hợp đồng điện tử" },
  { icon: Ship, label: "Hải quan điện tử", desc: "Ký tờ khai hải quan" },
  { icon: Landmark, label: "Dịch vụ công quốc gia", desc: "Ký hồ sơ, thủ tục hành chính" },
  { icon: Boxes, label: "Phần mềm ERP", desc: "Ký chứng từ, phê duyệt" },
  { icon: PenTool, label: "Ký văn bản điện tử", desc: "Ký văn bản nội bộ, công văn" },
];

const QUY_TRINH = [
  { icon: ClipboardList, title: "Đăng ký", desc: "Cung cấp thông tin đăng ký dịch vụ" },
  { icon: IdCard, title: "Xác thực CCCD", desc: "Xác thực danh tính bằng eKYC" },
  { icon: CloudCog, title: "Kích hoạt SmartCA", desc: "Nhận link kích hoạt và kích hoạt dịch vụ" },
  { icon: PenTool, title: "Sử dụng ngay", desc: "Ký số mọi lúc, mọi nơi" },
];

const HUONG_DAN = [
  { title: "Hướng dẫn kích hoạt SmartCA" },
  { title: "Hướng dẫn ký hóa đơn điện tử" },
  { title: "Hướng dẫn ký hợp đồng điện tử" },
];

const KHACH_HANG_TIEU_BIEU = ["BIDV", "Vietcombank", "Hoà Phát", "Viettel", "FPT", "MobiFone"];

const FAQ = [
  {
    q: "VNPT SmartCA có thay thế được USB Token không?",
    a: "Có. SmartCA là chữ ký số từ xa, có giá trị pháp lý tương đương USB Token và có thể thay thế hoàn toàn trong hầu hết các giao dịch điện tử.",
  },
  {
    q: "Tôi có thể ký trên điện thoại được không?",
    a: "Có. Bạn chỉ cần cài ứng dụng VNPT SmartCA trên điện thoại và ký trực tiếp mà không cần thiết bị phần cứng nào khác.",
  },
  {
    q: "SmartCA có dùng để ký hóa đơn điện tử không?",
    a: "Có. SmartCA được dùng phổ biến để ký hóa đơn điện tử, tờ khai thuế, hợp đồng điện tử và nhiều thủ tục hành chính khác.",
  },
  {
    q: "Thời gian kích hoạt dịch vụ là bao lâu?",
    a: "Sau khi đăng ký và xác thực danh tính (eKYC) thành công, dịch vụ được kích hoạt và sử dụng ngay trong ngày.",
  },
];

const HO_TRO = [
  { icon: Phone, label: "Hotline", value: "0838 999 333" },
  { icon: MessageCircle, label: "Zalo OA", value: "VNPT Nam Sài Gòn" },
  { icon: Mail, label: "Email", value: "kinhdoanh@vnptnamsaigon.vn" },
  { icon: Headset, label: "Thời gian", value: "7h30 - 21h00 (T2 - CN)" },
];

export default function ChuKySoPage() {
  const products = getCategoryProducts("chu-ky-so");
  const smartCaCaNhan = products.find((p) => p.slug === "smartca-ca-nhan");
  const smartCaHoKinhDoanh = products.find((p) => p.slug === "smartca-ho-kinh-doanh");
  const smartCaDoanhNghiep = products.find((p) => p.slug === "smartca-doanh-nghiep");

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/san-pham" },
              { label: "Chữ ký số" },
            ]}
          />
          <div className="mt-4 grid items-center gap-10 lg:grid-cols-2">
            <div className="relative z-10 text-white">
              <h1 className="leading-tight">
                CHỮ KÝ SỐ TỪ XA
                <br />
                VNPT SMARTCA
              </h1>
              <p className="mt-3 text-lg font-semibold text-vnpt-accent">
                Ký mọi lúc - Ký mọi nơi
                <br />
                Không cần USB Token
              </p>
              <div className="mt-4 space-y-2">
                {HERO_CHECKS.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm text-white/85">
                    <Check size={16} className="shrink-0 text-vnpt-accent" /> {c}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/lien-he"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
                >
                  ĐĂNG KÝ NGAY
                </Link>
                <Link
                  href="/lien-he"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  NHẬN BÁO GIÁ
                </Link>
              </div>
            </div>

            <div className="relative hidden h-72 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="VNPT SmartCA - Chữ ký số từ xa"
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 px-8 py-6 backdrop-blur-sm">
                  <FileSignature size={44} className="text-white" />
                  <span className="text-sm font-bold tracking-wide text-white">SmartCA</span>
                </div>
              </div>
              {HERO_BADGES.map((b, i) => (
                <div
                  key={i}
                  style={b.style}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 p-2.5 text-vnpt shadow-lg"
                >
                  <b.icon size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH + FORM SIDEBAR */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* DÀNH CHO AI */}
            <div>
              <h2 className="mb-6 text-center text-slate-800">DÀNH CHO AI?</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {DANH_CHO_AI.map((d) => (
                  <div
                    key={d.label}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                      <d.icon size={22} />
                    </span>
                    <span className="text-sm font-semibold text-slate-800">{d.label}</span>
                    <span className="text-xs text-slate-500">{d.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TẠI SAO CHỌN */}
            <div>
              <h2 className="mb-6 text-center text-slate-800">
                TẠI SAO CHỌN VNPT SMARTCA?
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {TAI_SAO_CHON.map((t) => (
                  <div key={t.label} className="flex flex-col items-center gap-2 text-center">
                    <t.icon size={26} className="text-vnpt" />
                    <span className="text-sm font-semibold text-slate-800">{t.label}</span>
                    <span className="text-xs text-slate-500">{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SMARTCA DÙNG ĐỂ LÀM GÌ */}
            <div>
              <h2 className="mb-6 text-center text-slate-800">
                SMARTCA DÙNG ĐỂ LÀM GÌ?
              </h2>
              <div className="rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="mx-auto mb-6 flex w-fit flex-col items-center gap-2 rounded-full bg-vnpt px-8 py-4 text-white">
                  <FileSignature size={28} />
                  <span className="text-sm font-bold">SmartCA</span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {SMARTCA_UNG_DUNG.map((u) => (
                    <div key={u.label} className="flex items-start gap-2 rounded-lg p-2">
                      <u.icon size={20} className="mt-0.5 shrink-0 text-vnpt" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{u.label}</div>
                        <div className="text-xs text-slate-500">{u.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BẢNG GIÁ */}
            <div>
              <h2 className="mb-6 text-center text-slate-800">
                BẢNG GIÁ VNPT SMARTCA
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                {smartCaCaNhan && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-vnpt">
                      <User size={16} /> CÁ NHÂN
                    </div>
                    <PricingTable pricing={smartCaCaNhan.pricing} />
                  </div>
                )}
                {smartCaHoKinhDoanh && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-vnpt">
                      <Store size={16} /> HỘ KINH DOANH
                    </div>
                    <PricingTable pricing={smartCaHoKinhDoanh.pricing} />
                  </div>
                )}
                {smartCaDoanhNghiep && (
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-vnpt">
                      <Building2 size={16} /> DOANH NGHIỆP
                    </div>
                    <PricingTable pricing={smartCaDoanhNghiep.pricing} />
                  </div>
                )}
              </div>
            </div>

            {/* QUY TRÌNH ĐĂNG KÝ */}
            <div>
              <h2 className="mb-6 text-center text-slate-800">
                QUY TRÌNH ĐĂNG KÝ SMARTCA
              </h2>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {QUY_TRINH.map((q, i) => (
                  <div key={q.title} className="relative flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt text-white">
                      <q.icon size={22} />
                    </span>
                    <span className="mt-2 text-sm font-semibold text-slate-800">{q.title}</span>
                    <span className="mt-1 text-xs text-slate-500">{q.desc}</span>
                    <span className="mt-1 text-xs font-bold text-vnpt-accent">
                      Bước {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* HƯỚNG DẪN SỬ DỤNG */}
            <div>
              <h2 className="mb-6 text-slate-800">HƯỚNG DẪN SỬ DỤNG</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {HUONG_DAN.map((h) => (
                  <div key={h.title} className="overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                    <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-vnpt to-vnpt-dark">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-vnpt">
                        <Play size={20} fill="currentColor" />
                      </span>
                    </div>
                    <div className="p-3 text-sm font-semibold text-slate-800">{h.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:h-fit">
            <LeadForm title="Đăng ký tư vấn" subtitle="Nhanh chóng - Miễn phí" interestOptions={["Chữ ký số"]} showCompany />
          </div>
        </div>
      </section>

      <StatBar
        items={[
          { value: "50.000+", label: "Doanh nghiệp tin dùng", icon: Building2 },
          { value: "500.000+", label: "Người dùng trên toàn quốc", icon: User },
          { value: "10+ năm", label: "Uy tín & kinh nghiệm", icon: BadgeCheck },
          { value: "24/7", label: "Hỗ trợ tận tâm", icon: Headset },
        ]}
      />

      {/* KHÁCH HÀNG TIÊU BIỂU */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-center text-lg font-bold text-slate-800">KHÁCH HÀNG TIÊU BIỂU</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
          {KHACH_HANG_TIEU_BIEU.map((k) => (
            <div
              key={k}
              className="flex h-16 items-center justify-center rounded-lg border border-slate-100 px-3 text-center text-sm font-bold text-slate-500 shadow-sm"
            >
              {k}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ + ƯU ĐÃI + HỖ TRỢ */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="mb-4 text-lg font-bold text-slate-800">CÂU HỎI THƯỜNG GẶP</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-lg border border-slate-100 p-4">
                  <div className="text-sm font-semibold text-slate-800">{f.q}</div>
                  <p className="mt-1 text-sm text-slate-500">{f.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-vnpt to-vnpt-dark p-6 text-white">
            <div>
              <h3 className="text-sm font-semibold uppercase text-white/80">Ưu đãi đặc biệt</h3>
              <p className="mt-2 text-2xl font-bold text-vnpt-accent">Giảm ngay 10%</p>
              <p className="mt-1 text-sm text-white/85">khi đăng ký gói 2 năm trở lên</p>
            </div>
            <Link
              href="/lien-he"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
            >
              ĐĂNG KÝ NGAY
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-800">HỖ TRỢ 24/7</h3>
            <div className="space-y-3">
              {HO_TRO.map((h) => (
                <div key={h.label} className="flex items-center gap-2 text-sm">
                  <h.icon size={16} className="shrink-0 text-vnpt" />
                  <div>
                    <div className="text-xs text-slate-500">{h.label}</div>
                    <div className="font-semibold text-slate-800">{h.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
