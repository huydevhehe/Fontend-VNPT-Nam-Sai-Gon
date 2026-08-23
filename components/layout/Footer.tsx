import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, PlayCircle, Share2 } from "lucide-react";
import { categories } from "@/content/category-map";

const CHINH_SACH = [
  { label: "Chính sách bảo mật", href: "/lien-he" },
  { label: "Điều khoản sử dụng", href: "/lien-he" },
  { label: "Chính sách bảo hành", href: "/lien-he" },
  { label: "Hướng dẫn thanh toán", href: "/lien-he" },
  { label: "Câu hỏi thường gặp", href: "/lien-he" },
];

export default function Footer() {
  return (
    <footer className="bg-vnpt-darker text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image
            src="/images/vnpt_logo.png"
            alt="VNPT Nam Sài Gòn"
            width={160}
            height={40}
            className="h-10 w-auto brightness-0 invert"
          />
          <p className="mt-3 text-sm text-slate-300">
            Đồng hành cùng doanh nghiệp, cá nhân trên hành trình Chuyển đổi số.
          </p>
          <div className="mt-4 flex gap-3">
            <Share2 size={18} />
            <PlayCircle size={18} />
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">DỊCH VỤ NỔI BẬT</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/san-pham/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">CHÍNH SÁCH &amp; ĐIỀU KHOẢN</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            {CHINH_SACH.map((c) => (
              <li key={c.label}>
                <Link href={c.href} className="hover:text-white">
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">LIÊN HỆ</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              28bis Nguyễn Thị Minh Khai, P. Đa Kao, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> 0838 999 333
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> kinhdoanh@vnptnamsaigon.vn
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <Image
              src="/images/misc/zalo-qr.png"
              alt="QR Zalo OA VNPT Nam Sài Gòn"
              width={64}
              height={64}
              className="rounded-md bg-white p-1"
            />
            <span className="text-xs text-slate-400">
              Quét QR code
              <br />
              Kết nối Zalo OA
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} VNPT Nam Sài Gòn. All rights reserved.
      </div>
    </footer>
  );
}
