import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Check,
  Clock,
  FileSignature,
  Landmark,
  PenLine,
  ScrollText,
  Search,
  Send,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = {
  title: "Hợp đồng điện tử VNPT eContract — VNPT Nam Sài Gòn",
  description:
    "VNPT eContract: nền tảng soạn thảo, ký kết và lưu trữ hợp đồng điện tử trực tuyến, có giá trị pháp lý, tiết kiệm thời gian và chi phí.",
};

const HERO_STATS = [
  { icon: Clock, title: "Ký trong vài phút", desc: "Thay vì vài ngày" },
  { icon: Wallet, title: "Tiết kiệm 70%", desc: "Chi phí in ấn, chuyển phát" },
  { icon: ShieldCheck, title: "Giá trị pháp lý", desc: "Đúng quy định pháp luật" },
  { icon: Users, title: "Ký nhiều bên", desc: "Không giới hạn vị trí" },
];

const TINH_NANG = [
  {
    icon: ScrollText,
    title: "Soạn thảo trực tuyến",
    desc: "Tạo hợp đồng từ mẫu có sẵn hoặc tải lên file, thiết lập vị trí ký cho từng bên.",
  },
  {
    icon: PenLine,
    title: "Ký số đa dạng",
    desc: "Hỗ trợ SmartCA, USB Token, ký ảnh, OTP — phù hợp cả cá nhân và doanh nghiệp.",
  },
  {
    icon: Send,
    title: "Gửi & nhắc ký tự động",
    desc: "Gửi hợp đồng qua email, hệ thống tự nhắc bên còn lại khi chưa ký.",
  },
  {
    icon: Search,
    title: "Tra cứu & xác thực",
    desc: "Kiểm tra tính toàn vẹn, lịch sử ký của hợp đồng bất cứ lúc nào.",
  },
  {
    icon: FileSignature,
    title: "Quản lý tập trung",
    desc: "Toàn bộ hợp đồng lưu trên một hệ thống, phân quyền theo phòng ban.",
  },
  {
    icon: ShieldCheck,
    title: "Lưu trữ an toàn",
    desc: "Mã hoá dữ liệu, chống sửa đổi, đáp ứng yêu cầu lưu trữ lâu dài.",
  },
];

const DOI_TUONG = [
  {
    icon: Building2,
    title: "Doanh nghiệp",
    desc: "Hợp đồng mua bán, hợp đồng lao động, phụ lục, biên bản nghiệm thu.",
  },
  {
    icon: Landmark,
    title: "Cơ quan Nhà nước",
    desc: "Văn bản thoả thuận, hợp đồng dịch vụ công, biên bản làm việc.",
  },
  {
    icon: Users,
    title: "Hộ kinh doanh & cá nhân",
    desc: "Hợp đồng thuê, hợp đồng cộng tác, giấy tờ giao dịch thường ngày.",
  },
];

const QUY_TRINH = [
  { title: "Tạo hợp đồng", desc: "Soạn mới hoặc tải file hợp đồng lên hệ thống" },
  { title: "Thiết lập bên ký", desc: "Chọn người ký, thứ tự ký và vị trí chữ ký" },
  { title: "Gửi ký", desc: "Hệ thống gửi thông báo tới từng bên qua email" },
  { title: "Các bên ký số", desc: "Ký bằng SmartCA, USB Token hoặc OTP" },
  { title: "Lưu trữ & tra cứu", desc: "Hợp đồng hoàn tất được lưu và tra cứu online" },
];

const LOI_ICH = [
  "Rút ngắn thời gian ký kết từ nhiều ngày xuống còn vài phút",
  "Tiết kiệm chi phí in ấn, chuyển phát và lưu trữ hồ sơ giấy",
  "Ký mọi lúc mọi nơi, không cần các bên có mặt cùng địa điểm",
  "Hạn chế thất lạc, sai sót so với quản lý hợp đồng giấy",
  "Kết hợp sẵn với chữ ký số VNPT SmartCA đang sử dụng",
  "Có giá trị pháp lý, phục vụ tốt công tác thanh tra, kiểm toán",
];

export default function HopDongDienTuPage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb
            variant="light"
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Dịch vụ CNTT", href: "/san-pham/chuyen-doi-so" },
              { label: "Hợp đồng điện tử" },
            ]}
          />

          <div className="mt-4 grid gap-10 lg:grid-cols-[1.3fr_340px]">
            <div>
              <p className="text-sm font-semibold tracking-wide text-vnpt-accent">
                VNPT eCONTRACT
              </p>
              <h1 className="mt-2 leading-tight">HỢP ĐỒNG ĐIỆN TỬ</h1>
              <p className="mt-3 max-w-xl text-white/85">
                Soạn thảo, ký kết và lưu trữ hợp đồng hoàn toàn trực tuyến — nhanh hơn, tiết
                kiệm hơn và vẫn đảm bảo giá trị pháp lý.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {HERO_STATS.map((s) => (
                  <div key={s.title} className="flex items-start gap-2">
                    <s.icon size={20} className="mt-0.5 shrink-0 text-vnpt-accent" />
                    <div className="text-xs leading-tight">
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-white/70">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/lien-he"
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
                >
                  ĐĂNG KÝ DÙNG THỬ
                </Link>
                <a
                  href="tel:0838999333"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Hotline: 0838 999 333
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <LeadForm
                title="Đăng ký tư vấn eContract"
                subtitle="Nhận demo và báo giá chi tiết"
                showInterest={false}
                showCompany
              />
            </div>
          </div>
        </div>
      </section>

      {/* TÍNH NĂNG */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">TÍNH NĂNG CHÍNH</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TINH_NANG.map((t) => (
            <div key={t.title} className="rounded-xl border border-slate-100 p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <t.icon size={22} />
              </span>
              <h3 className="mt-3 text-slate-800">{t.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ĐỐI TƯỢNG SỬ DỤNG */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">DÀNH CHO AI?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {DOI_TUONG.map((d) => (
              <div key={d.title} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <d.icon size={22} />
                </span>
                <h3 className="mt-3 text-slate-800">{d.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUY TRÌNH */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">QUY TRÌNH KÝ HỢP ĐỒNG ĐIỆN TỬ</h2>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
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

      {/* LỢI ÍCH */}
      <section className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-slate-800">LỢI ÍCH KHI SỬ DỤNG</h2>
          <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
            {LOI_ICH.map((l) => (
              <li
                key={l}
                className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-700"
              >
                <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {l}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-vnpt-darker to-vnpt p-8 text-center text-white lg:flex-row lg:text-left">
          <div>
            <div className="text-lg font-bold">Số hoá quy trình ký kết ngay hôm nay</div>
            <p className="mt-1 text-sm text-white/80">
              VNPT Nam Sài Gòn hỗ trợ triển khai, đào tạo sử dụng và tích hợp vào hệ thống sẵn có.
            </p>
          </div>
          <Link
            href="/lien-he"
            className="shrink-0 rounded-md bg-white px-6 py-3 text-sm font-semibold text-vnpt-dark hover:bg-slate-100"
          >
            ĐĂNG KÝ TƯ VẤN
          </Link>
        </div>
      </section>
    </div>
  );
}
