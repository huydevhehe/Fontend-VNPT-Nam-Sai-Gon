import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  Check,
  ClipboardList,
  CreditCard,
  GraduationCap,
  MessagesSquare,
  MonitorPlay,
  School,
  Smartphone,
  Users,
} from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = {
  title: "vnEdu — Hệ sinh thái giáo dục số VNPT | VNPT Nam Sài Gòn",
  description:
    "vnEdu: hệ sinh thái giáo dục số của VNPT gồm quản lý nhà trường, sổ liên lạc điện tử, học trực tuyến, thu học phí và soạn bài giảng.",
};

const HERO_STATS = [
  { icon: School, title: "Quản lý nhà trường", desc: "Toàn diện, tập trung" },
  { icon: Users, title: "Kết nối phụ huynh", desc: "Sổ liên lạc điện tử" },
  { icon: MonitorPlay, title: "Học trực tuyến", desc: "Lớp học số" },
  { icon: CreditCard, title: "Thu học phí", desc: "Không dùng tiền mặt" },
];

const PHAN_HE = [
  {
    icon: ClipboardList,
    title: "Quản lý nhà trường",
    desc: "Quản lý hồ sơ học sinh, giáo viên, điểm số, học bạ và báo cáo theo quy định.",
  },
  {
    icon: MessagesSquare,
    title: "Sổ liên lạc điện tử",
    desc: "Nhà trường gửi điểm, thông báo, tình hình học tập tới phụ huynh theo thời gian thực.",
  },
  {
    icon: MonitorPlay,
    title: "Học và thi trực tuyến",
    desc: "Tổ chức lớp học online, giao bài tập, kiểm tra và chấm điểm trên hệ thống.",
  },
  {
    icon: BookOpen,
    title: "Soạn bài giảng",
    desc: "Công cụ soạn giáo án, bài giảng điện tử và kho học liệu dùng chung.",
  },
  {
    icon: CalendarDays,
    title: "Xếp thời khoá biểu",
    desc: "Tự động xếp thời khoá biểu cho toàn trường, hạn chế trùng tiết.",
  },
  {
    icon: CreditCard,
    title: "Thu phí không tiền mặt",
    desc: "Thu học phí, các khoản đóng góp qua ngân hàng và ví điện tử, đối soát tự động.",
  },
];

const DOI_TUONG = [
  {
    icon: School,
    title: "Nhà trường",
    desc: "Số hoá toàn bộ nghiệp vụ quản lý, giảm hồ sơ giấy và báo cáo thủ công.",
  },
  {
    icon: GraduationCap,
    title: "Giáo viên",
    desc: "Nhập điểm, điểm danh, soạn bài giảng và trao đổi với phụ huynh trên một ứng dụng.",
  },
  {
    icon: Smartphone,
    title: "Phụ huynh & học sinh",
    desc: "Theo dõi kết quả học tập, lịch học, thông báo và đóng học phí ngay trên điện thoại.",
  },
];

const LOI_ICH = [
  "Hệ sinh thái đồng bộ, dùng chung một tài khoản cho nhiều phân hệ",
  "Đáp ứng quy định về học bạ, sổ điểm điện tử của ngành giáo dục",
  "Giảm khối lượng công việc hành chính, báo cáo cho giáo viên",
  "Phụ huynh nắm tình hình học tập của con hằng ngày",
  "Triển khai nhanh, có đội ngũ VNPT hỗ trợ tập huấn tại trường",
  "Kết nối sẵn với hạ tầng Internet, camera, WiFi của VNPT",
];

export default function VnEduPage() {
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
              { label: "vnEdu" },
            ]}
          />

          <div className="mt-4 grid gap-10 lg:grid-cols-[1.3fr_340px]">
            <div>
              <p className="text-sm font-semibold tracking-wide text-vnpt-accent">
                HỆ SINH THÁI GIÁO DỤC SỐ
              </p>
              <h1 className="mt-2 leading-tight">vnEdu</h1>
              <p className="mt-3 max-w-xl text-white/85">
                Bộ giải pháp giáo dục số của VNPT: quản lý nhà trường, kết nối phụ huynh, dạy
                học trực tuyến và thu phí không dùng tiền mặt.
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
                  ĐĂNG KÝ TƯ VẤN
                </Link>
                <a
                  href="https://vnedu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  TRUY CẬP vnEdu.vn
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <LeadForm
                title="Đăng ký tư vấn vnEdu"
                subtitle="Dành cho nhà trường & phòng giáo dục"
                showInterest={false}
                showCompany
              />
            </div>
          </div>
        </div>
      </section>

      {/* CÁC PHÂN HỆ */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">CÁC PHÂN HỆ CHÍNH</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">
          Triển khai riêng lẻ hoặc trọn bộ tuỳ nhu cầu của từng đơn vị.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PHAN_HE.map((p) => (
            <div key={p.title} className="rounded-xl border border-slate-100 p-5 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                <p.icon size={22} />
              </span>
              <h3 className="mt-3 text-slate-800">{p.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ĐỐI TƯỢNG */}
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

      {/* LỢI ÍCH */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-center text-slate-800">VÌ SAO CHỌN vnEdu?</h2>
        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          {LOI_ICH.map((l) => (
            <li
              key={l}
              className="flex items-start gap-2 rounded-lg border border-slate-100 p-4 text-sm text-slate-700"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-vnpt" /> {l}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="flex flex-col items-center justify-between gap-6 rounded-xl bg-gradient-to-r from-vnpt-darker to-vnpt p-8 text-center text-white lg:flex-row lg:text-left">
          <div>
            <div className="text-lg font-bold">Đưa nhà trường lên môi trường số</div>
            <p className="mt-1 text-sm text-white/80">
              VNPT Nam Sài Gòn hỗ trợ khảo sát, triển khai và tập huấn sử dụng tận nơi.
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
