"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Check,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Printer,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

const HERO_CHECKS = [
  "Tư vấn giải pháp phù hợp",
  "Hỗ trợ nhanh chóng 24/7",
  "Cam kết bảo mật thông tin",
  "Đồng hành lâu dài",
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
          className="w-full rounded-md bg-vnpt py-2.5 text-sm font-semibold text-white hover:bg-vnpt-dark"
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
      <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
        <Image
          src="/images/lien-he/banner-lien-he.png"
          alt="Liên hệ VNPT Nam Sài Gòn"
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
              items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
            />
            <h1 className="mt-3">LIÊN HỆ VỚI CHÚNG TÔI</h1>
            <p className="mt-2 text-white/85">
              VNPT Nam Sài Gòn luôn sẵn sàng hỗ trợ bạn mọi lúc – mọi nơi.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {HERO_CHECKS.map((c) => (
                <span key={c} className="flex items-center gap-2">
                  <Check size={16} className="shrink-0 text-vnpt-accent" /> {c}
                </span>
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
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
              <Clock size={20} />
            </span>
            <div>
              <h3 className="font-semibold text-slate-800">GIỜ LÀM VIỆC</h3>
              <p className="text-sm text-slate-500">
                Chúng tôi luôn sẵn sàng phục vụ bạn trong khung giờ làm việc và hỗ trợ
                ngoài giờ khi cần thiết.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GIO_LAM_VIEC.map((g) => (
              <div key={g.label} className="rounded-lg border border-slate-100 p-4 text-center">
                <div className="text-sm font-semibold text-slate-800">{g.label}</div>
                <div
                  className={`mt-1 text-sm ${g.value === "Nghỉ" ? "text-slate-400" : "font-semibold text-vnpt"}`}
                >
                  {g.value}
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-gradient-to-br from-vnpt-darker to-vnpt p-4 text-center text-white">
              <div className="text-sm font-semibold text-vnpt-accent">Hỗ trợ 24/7</div>
              <div className="mt-1 text-sm">Hotline: 0838 999 333</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
