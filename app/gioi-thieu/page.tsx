import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = { title: "Giới thiệu — VNPT Nam Sài Gòn" };

const DOI_NGU = [
  { name: "Vũ Tiến Khoa", role: "Trưởng phòng Kinh doanh", phone: "0838 999 333" },
  { name: "Nguyễn Thị Hằng", role: "Phó phòng Kinh doanh", phone: "0936 123 456" },
  { name: "Trần Minh Đức", role: "Chuyên viên Kinh doanh", phone: "0912 345 678" },
  { name: "Lê Thị Thanh Thảo", role: "Chuyên viên Kinh doanh", phone: "0978 456 789" },
  { name: "Phạm Hoàng Nam", role: "Chuyên viên Kinh doanh", phone: "0981 234 567" },
  { name: "Bùi Thùy Linh", role: "Chuyên viên Kinh doanh", phone: "0902 678 910" },
];

export default function GioiThieuPage() {
  return (
    <div>
      <section className="bg-vnpt px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Giới thiệu" }]} />
          <h1 className="mt-3 text-3xl font-extrabold">GIỚI THIỆU</h1>
          <p className="mt-2 text-white/85">
            VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU TẬP ĐOÀN VNPT</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          VNPT là Tập đoàn công nghệ hàng đầu Việt Nam, tiên phong trong kiến tạo hạ
          tầng số, cung cấp các dịch vụ Viễn thông, CNTT và Giải pháp số toàn diện cho
          cá nhân, doanh nghiệp và cơ quan Nhà nước. Thành lập 26/6/1995, sứ mệnh "Đồng
          hành cùng Chuyển đổi số quốc gia".
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 rounded-xl border border-slate-100 p-6 shadow-sm md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-xl font-bold text-slate-800">GIỚI THIỆU VNPT NAM SÀI GÒN</h2>
            <p className="mt-3 text-slate-600">
              VNPT Nam Sài Gòn là đơn vị trực thuộc VNPT TP. Hồ Chí Minh, phụ trách cung
              cấp dịch vụ Viễn thông – CNTT – Giải pháp số trên địa bàn Quận 7, Quận 8,
              Nhà Bè và khu vực lân cận. Phục vụ hơn 60.000+ khách hàng cá nhân và
              doanh nghiệp với đội ngũ kỹ thuật – kinh doanh chuyên nghiệp, tận tâm.
            </p>
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Phạm vi hoạt động: </span>
              Quận 7 - Quận 8 - Nhà Bè và khu vực lân cận
            </div>
            <div>
              <span className="font-semibold text-slate-800">Năm thành lập: </span>
              1996
            </div>
            <div>
              <span className="font-semibold text-slate-800">Cam kết: </span>
              Chất lượng - Uy tín - Đồng hành lâu dài
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-2 text-xl font-bold text-slate-800">ĐỘI NGŨ KINH DOANH</h2>
        <p className="mb-6 text-slate-500">
          Chúng tôi luôn sẵn sàng đồng hành và mang đến giải pháp phù hợp nhất cho bạn.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DOI_NGU.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-vnpt-light" />
              <div className="text-sm font-semibold text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.role}</div>
              <div className="mt-1 text-xs text-vnpt">{p.phone}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl bg-vnpt-light p-6">
          <h2 className="text-xl font-bold text-slate-800">THÔNG TIN LIÊN HỆ</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-vnpt" /> 28bis Nguyễn Thị Minh Khai, P.
              Đa Kao, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-vnpt" /> 0838 999 333
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-vnpt" /> kinhdoanh@vnptnamsaigon.vn
            </li>
          </ul>
        </div>
        <LeadForm title="Tìm hiểu thêm về chúng tôi" />
      </section>
    </div>
  );
}
