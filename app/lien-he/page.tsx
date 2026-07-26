"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Check,
  Cloud,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
  Wifi,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

const HERO_CHECKS = [
  "Tư vấn giải pháp phù hợp",
  "Hỗ trợ nhanh chóng 24/7",
  "Cam kết bảo mật thông tin",
  "Đồng hành lâu dài",
];

const HERO_BADGES = [
  { icon: Cloud, style: { top: "10%", left: "10%" } },
  { icon: Wifi, style: { top: "18%", left: "85%" } },
  { icon: Mail, style: { top: "62%", left: "6%" } },
  { icon: MessageCircle, style: { top: "68%", left: "88%" } },
];

const INFO_CARDS = [
  { icon: Phone, label: "Hotline", value: "0838 999 333", note: "Tư vấn miễn phí 24/7" },
  { icon: MessageCircle, label: "Zalo OA", value: "VNPT Nam Sài Gòn", note: "Chat ngay trên Zalo" },
  { icon: Mail, label: "Email", value: "kinhdoanh@vnptnamsaigon.vn", note: "Phản hồi trong 30 phút" },
  { icon: Phone, label: "Hỗ trợ kỹ thuật", value: "1800 1166 (nhánh 5)", note: "Hỗ trợ 24/7 toàn quốc" },
];

const CHI_NHANH = [
  { name: "Quận 7", address: "466 Nguyễn Văn Linh, P. Tân Phong, Quận 7" },
  { name: "Quận 8", address: "1249 Phạm Thế Hiển, P. 5, Quận 8" },
  { name: "Nhà Bè", address: "254 Huỳnh Tấn Phát, TT. Nhà Bè, H. Nhà Bè" },
  { name: "Quận Bình Tân", address: "952 Tỉnh lộ 10, P. Tân Tạo, Q. Bình Tân" },
];

const GIO_LAM_VIEC = [
  { label: "Thứ 2 - Thứ 6", value: "07:30 - 17:30" },
  { label: "Thứ 7", value: "07:30 - 12:00" },
  { label: "Chủ nhật & Ngày lễ", value: "Nghỉ" },
];

function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-vnpt/20 bg-vnpt-light p-6 text-center">
        <p className="font-semibold text-vnpt">Cảm ơn bạn đã liên hệ!</p>
        <p className="mt-1 text-sm text-slate-600">
          Đội ngũ VNPT Nam Sài Gòn sẽ phản hồi bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800">GỬI LIÊN HỆ CHO CHÚNG TÔI</h2>
      <p className="mt-1 text-sm text-slate-500">
        Vui lòng điền thông tin, chúng tôi sẽ liên hệ lại bạn sớm nhất.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label htmlFor="hoTen" className="mb-1 block text-sm text-slate-600">
            Họ và tên *
          </label>
          <input
            required
            id="hoTen"
            name="hoTen"
            placeholder="Nhập họ và tên"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
          />
        </div>
        <div>
          <label htmlFor="soDienThoai" className="mb-1 block text-sm text-slate-600">
            Số điện thoại *
          </label>
          <input
            required
            id="soDienThoai"
            name="soDienThoai"
            placeholder="Nhập số điện thoại"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-slate-600">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Nhập email"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
          />
        </div>
        <div>
          <label htmlFor="dichVu" className="mb-1 block text-sm text-slate-600">
            Dịch vụ quan tâm
          </label>
          <select
            id="dichVu"
            name="dichVu"
            defaultValue=""
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-vnpt"
          >
            <option value="" disabled>
              Chọn dịch vụ
            </option>
            <option value="internet">Internet & Truyền hình MyTV</option>
            <option value="vinaphone">Di động Vinaphone</option>
            <option value="hoa-don">Hóa đơn - Thuế</option>
            <option value="chu-ky-so">Chữ ký số</option>
            <option value="cloud">Cloud & IDC</option>
            <option value="chuyen-doi-so">Chuyển đổi số</option>
          </select>
        </div>
        <div>
          <label htmlFor="noiDung" className="mb-1 block text-sm text-slate-600">
            Nội dung liên hệ *
          </label>
          <textarea
            required
            id="noiDung"
            name="noiDung"
            placeholder="Nhập nội dung bạn muốn trao đổi"
            rows={4}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
          />
        </div>
        <label className="flex items-start gap-2 text-xs text-slate-500">
          <input required type="checkbox" name="dongY" className="mt-0.5" />
          Tôi đồng ý với{" "}
          <Link href="/lien-he" className="text-vnpt hover:underline">
            Chính sách bảo mật thông tin
          </Link>
        </label>
        <button
          type="submit"
          className="w-full rounded-md bg-vnpt-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          GỬI THÔNG TIN
        </button>
      </form>
    </div>
  );
}

export default function LienHePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]} />
          <div className="mt-3 grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-extrabold">LIÊN HỆ VỚI CHÚNG TÔI</h1>
              <p className="mt-2 text-white/85">
                VNPT Nam Sài Gòn luôn sẵn sàng hỗ trợ bạn mọi lúc – mọi nơi.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {HERO_CHECKS.map((c) => (
                  <span key={c} className="flex items-center gap-2">
                    <Check size={16} className="shrink-0 text-vnpt-accent" /> {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative hidden h-56 overflow-hidden rounded-2xl lg:block">
              <Image
                src="/images/hero/hero-city-night.jpg"
                alt="VNPT Nam Sài Gòn"
                fill
                sizes="(max-width: 1024px) 0px, 50vw"
                quality={90}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-vnpt/50 mix-blend-multiply" />
              {HERO_BADGES.map((b, i) => (
                <div
                  key={i}
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

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-4">
          {INFO_CARDS.map((c) => (
            <div key={c.label} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 shadow-sm">
              <c.icon size={22} className="shrink-0 text-vnpt" />
              <div>
                <div className="text-xs text-slate-500">{c.label}</div>
                <div className="text-sm font-semibold text-slate-800">{c.value}</div>
                <div className="text-xs text-slate-400">{c.note}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-800">ĐỊA CHỈ VĂN PHÒNG</h2>
          <iframe
            title="Bản đồ VNPT Nam Sài Gòn"
            className="h-72 w-full rounded-xl border border-slate-100"
            loading="lazy"
            src="https://www.google.com/maps?q=28bis+Nguy%E1%BB%85n+Th%E1%BB%8B+Minh+Khai%2C+%C4%90a+Kao%2C+Qu%E1%BA%ADn+1%2C+TP.HCM&output=embed"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="mt-0.5 shrink-0 text-vnpt" />
              <div>
                <div className="font-semibold text-slate-800">Trụ sở chính VNPT Nam Sài Gòn</div>
                <div className="text-slate-500">
                  28bis Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Phone size={16} className="mt-0.5 shrink-0 text-vnpt" />
              <div>
                <div className="font-semibold text-slate-800">Điện thoại</div>
                <div className="text-slate-500">(028) 38 999 333</div>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Printer size={16} className="mt-0.5 shrink-0 text-vnpt" />
              <div>
                <div className="font-semibold text-slate-800">Fax</div>
                <div className="text-slate-500">(028) 38 999 334</div>
              </div>
            </div>
          </div>

          <h3 className="mt-8 mb-3 font-semibold text-slate-800">Chi nhánh & điểm giao dịch</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {CHI_NHANH.map((c) => (
              <div key={c.name} className="rounded-lg border border-slate-100 p-3 text-sm">
                <div className="font-semibold text-slate-800">{c.name}</div>
                <div className="text-slate-500">{c.address}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/lien-he"
              className="inline-block rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-vnpt hover:text-vnpt"
            >
              Xem tất cả điểm giao dịch →
            </Link>
          </div>
        </div>

        <ContactForm />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <h3 className="font-semibold text-slate-800">GIỜ LÀM VIỆC</h3>
              <p className="mt-1 text-sm text-slate-500">
                Chúng tôi luôn sẵn sàng phục vụ bạn trong khung giờ làm việc và hỗ trợ
                ngoài giờ khi cần thiết.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {GIO_LAM_VIEC.map((g) => (
                <div key={g.label} className="text-center">
                  <div className="text-sm font-semibold text-vnpt">{g.label}</div>
                  <div className="mt-1 text-sm text-slate-700">{g.value}</div>
                </div>
              ))}
              <div className="rounded-lg bg-vnpt-light p-3 text-center">
                <div className="text-sm font-semibold text-vnpt-accent">Hỗ trợ 24/7</div>
                <div className="mt-1 text-sm text-slate-700">Hotline: 0838 999 333</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
