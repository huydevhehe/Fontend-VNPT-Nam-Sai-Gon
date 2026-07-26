import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  Globe,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  PlayCircle,
  Share2,
  Users,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = { title: "Giới thiệu — VNPT Nam Sài Gòn" };

const HERO_STATS = [
  { icon: Award, value: "25+ năm", label: "Kinh nghiệm phát triển" },
  { icon: Globe, value: "63 tỉnh/thành", label: "Phủ sóng trên toàn quốc" },
  { icon: Users, value: "500.000+", label: "Khách hàng tin tưởng" },
  { icon: Phone, value: "24/7", label: "Hỗ trợ mọi lúc mọi nơi" },
];

const VNPT_CHECKS = [
  "Thành lập: 26/6/1995",
  "100% vốn Nhà nước",
  "Lĩnh vực hoạt động: Viễn thông, CNTT, Công nghệ số, Truyền thông",
  'Sứ mệnh: "Đồng hành cùng Chuyển đổi số quốc gia"',
  "Tầm nhìn: Trở thành Tập đoàn công nghệ số hàng đầu Việt Nam, ngang tầm khu vực vào năm 2030",
];

const NAM_SAI_GON_CHECKS = [
  "Phục vụ hơn 60.000+ khách hàng cá nhân & doanh nghiệp",
  "Đội ngũ kỹ thuật – kinh doanh chuyên nghiệp, tận tâm",
  "Hạ tầng mạng hiện đại, phủ sóng mạnh mẽ, an toàn, ổn định",
  "Luôn tiên phong đưa công nghệ mới đến gần hơn với khách hàng",
];

const DOI_NGU = [
  {
    name: "Vũ Tiến Khoa",
    role: "Trưởng phòng Kinh doanh",
    phone: "0838 999 333",
    email: "khoavt.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/vu-tien-khoa.jpg",
  },
  {
    name: "Nguyễn Thị Hằng",
    role: "Phó phòng Kinh doanh",
    phone: "0936 123 456",
    email: "hangnt.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/nguyen-thi-hang.jpg",
  },
  {
    name: "Trần Minh Đức",
    role: "Chuyên viên Kinh doanh",
    phone: "0912 345 678",
    email: "ductm.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/tran-minh-duc.jpg",
  },
  {
    name: "Lê Thị Thanh Thảo",
    role: "Chuyên viên Kinh doanh",
    phone: "0978 456 789",
    email: "thaolt.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/le-thi-thanh-thao.jpg",
  },
  {
    name: "Phạm Hoàng Nam",
    role: "Chuyên viên Kinh doanh",
    phone: "0981 234 567",
    email: "namph.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/pham-hoang-nam.jpg",
  },
  {
    name: "Bùi Thùy Linh",
    role: "Chuyên viên Kinh doanh",
    phone: "0902 678 910",
    email: "linhbt.hcm@vnpt.vn",
    avatar: "/images/doi-ngu/bui-thuy-linh.jpg",
  },
];

const CHI_NHANH = [
  "421 Nguyễn Thị Thập, P. Tân Phong, Quận 7",
  "324 Phạm Hùng, P. 5, Quận 8",
  "1236 Lê Văn Lương, Nhà Bè",
];

const SOCIALS = [
  { icon: MessageCircle, label: "Zalo OA" },
  { icon: Share2, label: "Facebook" },
  { icon: PlayCircle, label: "YouTube" },
  { icon: Link2, label: "Linkedin" },
];

export default function GioiThieuPage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
        <Image
          src="/images/gioi-thieu/banner-gioi-thieu.png"
          alt="Tòa nhà VNPT"
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
              items={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]}
            />
            <h1 className="mt-3 text-3xl font-extrabold">GIỚI THIỆU</h1>
            <p className="mt-2 text-white/85">
              VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {HERO_STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <s.icon size={18} className="text-vnpt-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{s.value}</div>
                    <div className="text-xs text-white/70">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GIỚI THIỆU TẬP ĐOÀN */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU TẬP ĐOÀN VNPT</h2>
            <p className="mt-3 text-slate-600">
              VNPT là Tập đoàn công nghệ hàng đầu Việt Nam, tiên phong trong kiến tạo hạ
              tầng số, cung cấp các dịch vụ Viễn thông, CNTT và Giải pháp số toàn diện cho
              cá nhân, doanh nghiệp và cơ quan Nhà nước.
            </p>
            <ul className="mt-4 space-y-2">
              {VNPT_CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {c}
                </li>
              ))}
            </ul>
            <a
              href="https://vnpt.com.vn"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded border border-vnpt px-6 py-4 text-sm font-semibold text-vnpt hover:bg-vnpt-light"
            >
              Xem chi tiết về VNPT <ArrowRight size={14} />
            </a>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/gioi-thieu/tap-doan-vnpt.png"
              alt="Tập đoàn VNPT"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* GIỚI THIỆU VNPT NAM SÀI GÒN */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 rounded-xl border border-slate-100 p-6 shadow-sm lg:grid-cols-[1fr_1.3fr_0.9fr]">
          <div className="relative h-56 overflow-hidden rounded-xl lg:h-full">
            <Image
              src="/images/gioi-thieu/vnpt-nam-sai-gon.png"
              alt="Văn phòng VNPT Nam Sài Gòn"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU VNPT NAM SÀI GÒN</h2>
            <p className="mt-3 text-slate-600">
              VNPT Nam Sài Gòn là đơn vị trực thuộc VNPT TP. Hồ Chí Minh, phụ trách cung
              cấp dịch vụ Viễn thông – CNTT – Giải pháp số trên địa bàn Quận 7, Quận 8,
              Nhà Bè và khu vực lân cận.
            </p>
            <ul className="mt-4 space-y-2">
              {NAM_SAI_GON_CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-slate-700">
                  <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {c}
                </li>
              ))}
            </ul>
            <Link
              href="/lien-he"
              className="mt-5 inline-flex items-center gap-2 rounded-md border border-vnpt px-4 py-2 text-sm font-semibold text-vnpt hover:bg-vnpt-light"
            >
              Tìm hiểu thêm về chúng tôi <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <MapPin size={15} className="text-vnpt" /> Phạm vi hoạt động
              </div>
              <div className="mt-1 text-slate-500">Quận 7 - Quận 8 - Nhà Bè và khu vực lân cận</div>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Năm thành lập</div>
              <div className="mt-1 text-slate-500">1996</div>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Khách hàng tiêu biểu</div>
              <div className="mt-1 text-slate-500">
                Doanh nghiệp, Trường học, Bệnh viện, Cơ quan Nhà nước, Hộ kinh doanh, Cá nhân
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-800">Cam kết</div>
              <div className="mt-1 text-slate-500">Chất lượng - Uy tín - Đồng hành lâu dài</div>
            </div>
          </div>
        </div>
      </section>

      {/* ĐỘI NGŨ KINH DOANH */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-2 text-center text-xl font-bold text-slate-800">ĐỘI NGŨ KINH DOANH</h2>
        <p className="mb-8 text-center text-slate-500">
          Chúng tôi luôn sẵn sàng đồng hành và mang đến giải pháp phù hợp nhất cho bạn.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DOI_NGU.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <div className="relative mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full">
                <Image src={p.avatar} alt={p.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="text-sm font-semibold text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.role}</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-vnpt">
                <Phone size={11} /> {p.phone}
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 truncate text-xs text-slate-400">
                <Mail size={11} className="shrink-0" /> {p.email}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/lien-he"
            className="inline-block rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-vnpt hover:text-vnpt"
          >
            Xem tất cả nhân sự →
          </Link>
        </div>
      </section>

      {/* THÔNG TIN LIÊN HỆ */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="mb-6 text-xl font-bold text-slate-800">THÔNG TIN LIÊN HỆ</h2>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-6 text-white">
            <div>
              <Building2 size={28} className="text-vnpt-accent" />
              <div className="mt-3 text-lg font-extrabold">VNPT NAM SÀI GÒN</div>
              <p className="mt-1 text-xs text-white/75">
                Đồng hành cùng bạn trên hành trình Chuyển đổi số
              </p>
            </div>
            <Link
              href="/lien-he"
              className="mt-6 rounded-md bg-vnpt-accent px-3 py-2.5 text-center text-xs font-semibold hover:bg-orange-600"
            >
              ĐĂNG KÝ TƯ VẤN NGAY
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <MapPin size={16} />
                </span>
                <h3 className="text-sm font-semibold text-slate-800">ĐỊA CHỈ</h3>
              </div>
              <p className="text-sm text-slate-600">
                Tòa nhà VNPT, 28bis Nguyễn Thị Minh Khai, P. Đa Kao, Quận 1, TP. Hồ Chí Minh
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Chi nhánh Giao dịch:</p>
              <ul className="mt-1 space-y-1 text-xs text-slate-500">
                {CHI_NHANH.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Phone size={16} />
                </span>
                <h3 className="text-sm font-semibold text-slate-800">LIÊN HỆ</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-vnpt" /> Hotline: 0838 999 333
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-vnpt" /> Điện thoại: (028) 38 999 333
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-vnpt" /> kinhdoanh@vnptnamsaigon.vn
                </li>
                <li className="flex items-center gap-2">
                  <Globe size={14} className="text-vnpt" /> www.vnptnamsaigon.vn
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-slate-100 p-5 shadow-sm sm:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">KẾT NỐI VỚI CHÚNG TÔI</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SOCIALS.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col items-center gap-2 rounded-lg border border-slate-100 p-3 text-xs font-medium text-slate-600 transition hover:border-vnpt/40 hover:text-vnpt"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                      <s.icon size={16} />
                    </span>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
