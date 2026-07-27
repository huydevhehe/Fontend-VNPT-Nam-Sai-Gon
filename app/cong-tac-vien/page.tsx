import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Boxes,
  Check,
  CircleDollarSign,
  Gift,
  Headset,
  Quote,
  ReceiptText,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PricingTable from "@/components/product/PricingTable";

export const metadata: Metadata = { title: "Cộng tác viên — VNPT Nam Sài Gòn" };

const LY_DO = [
  {
    icon: CircleDollarSign,
    title: "Hoa hồng hấp dẫn",
    desc: "Nhận hoa hồng lên đến 15% giá trị hợp đồng cho mỗi khách hàng bạn giới thiệu.",
  },
  {
    icon: Boxes,
    title: "Sản phẩm đa dạng",
    desc: "Internet, MyTV, Vinaphone, Cloud, chữ ký số và nhiều dịch vụ khác.",
  },
  {
    icon: Award,
    title: "Thương hiệu uy tín",
    desc: "VNPT là thương hiệu Viễn thông hàng đầu Việt Nam với hơn 30 năm phát triển.",
  },
  {
    icon: Headset,
    title: "Hỗ trợ tận tình",
    desc: "Đội ngũ hỗ trợ CTV tận tâm, cung cấp tài liệu, công cụ bán hàng miễn phí.",
  },
  {
    icon: ReceiptText,
    title: "Thanh toán minh bạch",
    desc: "Theo dõi doanh số, hoa hồng rõ ràng, thanh toán đúng hạn hàng tháng.",
  },
];

const QUYEN_LOI = [
  "Mã CTV riêng để giới thiệu khách hàng",
  "Link giới thiệu, banner, landing page chuyên nghiệp",
  "Tài liệu giới thiệu sản phẩm cập nhật liên tục",
  "Công cụ hỗ trợ bán hàng hiệu quả",
  "Báo cáo doanh số và hoa hồng theo thời gian thực",
  "Chương trình thưởng nóng hàng tháng, quý",
];

const HOA_HONG_THAM_KHAO = {
  columns: ["Dịch vụ", "Giá trị hợp đồng", "Mức hoa hồng"],
  rows: [
    ["Internet cáp quang", "300.000đ - 500.000đ", "10%"],
    ["Internet cáp quang FTTH", "> 500.000đ", "12%"],
    ["MyTV", "120.000đ - 200.000đ", "10%"],
    ["Vinaphone trả sau", "> 200.000đ", "8%"],
    ["Cloud, Chữ ký số, IDC", "Theo từng gói sản phẩm", "5% - 15%"],
  ],
  note: "* Mức hoa hồng chỉ mang tính tham khảo, có thể thay đổi theo chương trình khuyến mãi từng thời điểm.",
};

const QUY_TRINH = [
  { title: "Đăng ký", desc: "Điền thông tin đăng ký trở thành CTV" },
  { title: "Xác nhận", desc: "VNPT xác minh và cấp mã CTV cho bạn" },
  { title: "Giới thiệu", desc: "Giới thiệu khách hàng sử dụng dịch vụ" },
  { title: "Khách hàng sử dụng", desc: "Khách hàng ký hợp đồng và sử dụng dịch vụ" },
  { title: "Nhận hoa hồng", desc: "Hoa hồng được ghi nhận và thanh toán hàng tháng" },
];

const TESTIMONIALS = [
  {
    quote:
      "Tham gia CTV VNPT giúp tôi có thêm thu nhập ổn định, hoa hồng minh bạch và thanh toán đúng hạn.",
    name: "Nguyễn Văn Minh",
    role: "CTV khu vực Quận 7",
    avatar: "/images/cong-tac-vien/nguyen-van-minh.jpg",
  },
  {
    quote:
      "Sản phẩm VNPT chất lượng, dễ giới thiệu, tỷ lệ khách hàng chốt cao. Rất hài lòng khi làm CTV VNPT Nam Sài Gòn.",
    name: "Trần Thị Hương",
    role: "CTV khu vực Nhà Bè",
    avatar: "/images/cong-tac-vien/tran-thi-huong.jpg",
  },
  {
    quote: "Thanh toán chính xác, hỗ trợ nhiệt tình. Đội ngũ kỹ thuật luôn sẵn sàng 24/7.",
    name: "Lê Hoàng Nam",
    role: "CTV khu vực Quận 4",
    avatar: "/images/cong-tac-vien/le-hoang-nam.jpg",
  },
];

const CAM_KET = ["Miễn phí tham gia", "Không giới hạn thu nhập", "Hỗ trợ tận tâm 24/7"];

export default function CongTacVienPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
        <Image
          src="/images/cong-tac-vien/banner-cong-tac-vien.png"
          alt="Trở thành Cộng tác viên VNPT"
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
              items={[{ label: "Trang chủ", href: "/" }, { label: "Cộng tác viên" }]}
            />
            <h1 className="mt-3 text-3xl font-extrabold">TRỞ THÀNH CỘNG TÁC VIÊN VNPT</h1>
            <p className="mt-2 text-white/85">
              Giới thiệu khách hàng sử dụng dịch vụ VNPT, nhận hoa hồng hấp dẫn, thanh toán minh
              bạch.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#dang-ky"
                className="rounded-md bg-vnpt-accent px-5 py-2.5 text-sm font-semibold hover:bg-orange-600"
              >
                ĐĂNG KÝ NGAY
              </Link>
              <Link
                href="/lien-he"
                className="rounded-md border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
              >
                ĐĂNG NHẬP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VÌ SAO NÊN TRỞ THÀNH CTV */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-bold text-slate-800">
          VÌ SAO NÊN TRỞ THÀNH CỘNG TÁC VIÊN CỦA VNPT?
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {LY_DO.map((l) => (
            <div key={l.title} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <l.icon size={22} />
              </span>
              <div className="mt-3 text-sm font-semibold text-slate-800">{l.title}</div>
              <p className="mt-1 text-xs text-slate-500">{l.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUYỀN LỢI + BẢNG HOA HỒNG */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-bold text-slate-800">
          BẠN SẼ NHẬN ĐƯỢC GÌ KHI THAM GIA?
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <ul className="space-y-3">
            {QUYEN_LOI.map((q) => (
              <li key={q} className="flex items-start gap-2 text-sm text-slate-700">
                <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {q}
              </li>
            ))}
          </ul>
          <div>
            <PricingTable pricing={[{ name: "MỨC HOA HỒNG THAM KHẢO", ...HOA_HONG_THAM_KHAO }]} />
          </div>
        </div>
      </section>

      {/* QUY TRÌNH */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-bold text-slate-800">
          QUY TRÌNH TRỞ THÀNH CỘNG TÁC VIÊN
        </h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {QUY_TRINH.map((q, i) => (
            <div key={q.title} className="flex flex-col items-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt text-lg font-bold text-white">
                {i + 1}
              </span>
              <div className="mt-3 text-sm font-semibold text-slate-800">{q.title}</div>
              <p className="mt-1 text-xs text-slate-500">{q.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="relative mb-8 text-center">
          <h2 className="text-xl font-bold text-slate-800">CỘNG TÁC VIÊN NÓI VỀ CHÚNG TÔI</h2>
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

      {/* CTA CUỐI TRANG */}
      <section id="dang-ky" className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-vnpt-darker to-vnpt p-8 text-center text-white lg:flex-row lg:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 text-lg font-bold lg:justify-start">
              <Gift size={22} className="text-vnpt-accent" /> ĐĂNG KÝ NGAY HÔM NAY
            </div>
            <p className="mt-1 text-sm text-white/80">Bắt đầu kiếm tiền cùng VNPT!</p>
            <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-white/85 lg:justify-start">
              {CAM_KET.map((c) => (
                <span key={c} className="flex items-center gap-1.5">
                  <Check size={14} className="text-vnpt-accent" /> {c}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/lien-he"
            className="shrink-0 rounded-md bg-vnpt-accent px-6 py-3 text-sm font-semibold hover:bg-orange-600"
          >
            ĐĂNG KÝ NGAY →
          </Link>
        </div>
      </section>
    </div>
  );
}
