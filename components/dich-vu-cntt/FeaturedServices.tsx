import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  FileCheck,
  FileSignature,
  GraduationCap,
  Puzzle,
  Receipt,
  Workflow,
} from "lucide-react";

const SERVICES = [
  {
    icon: FileSignature,
    name: "Chữ ký số SmartCA",
    desc: "Ký mọi lúc, mọi nơi – An toàn, bảo mật theo tiêu chuẩn Châu Âu.",
    href: "/san-pham/chu-ky-so",
  },
  {
    icon: Receipt,
    name: "Hoá đơn điện tử",
    desc: "Giải pháp hóa đơn điện tử toàn diện, tiết kiệm, dễ sử dụng.",
    href: "/san-pham/hoa-don-thue",
  },
  {
    icon: FileCheck,
    name: "Hợp đồng điện tử eContract",
    desc: "Ký kết hợp đồng online, pháp lý vững chắc, quản lý tập trung.",
    href: "/san-pham/hop-dong-dien-tu",
  },
  {
    icon: GraduationCap,
    name: "vnEdu (giáo dục số)",
    desc: "Hệ sinh thái giáo dục thông minh, kết nối nhà trường – phụ huynh – học sinh.",
    href: "/san-pham/vnedu",
  },
  {
    icon: Cloud,
    name: "Cloud & Data Center",
    desc: "Hạ tầng Cloud & trung tâm dữ liệu đạt chuẩn Tier III, bảo mật tối ưu.",
    href: "/san-pham/cloud-idc",
  },
  {
    icon: Workflow,
    name: "Chuyển đổi số doanh nghiệp",
    desc: "Tư vấn & triển khai giải pháp chuyển đổi số toàn diện, nâng cao năng lực vận hành.",
    href: "/san-pham/chuyen-doi-so",
  },
  {
    icon: Puzzle,
    name: "Plugin & Công cụ",
    desc: "Bộ công cụ và tiện ích mở rộng hỗ trợ vận hành, tích hợp linh hoạt.",
    href: "/plugin-cong-cu",
  },
];

export default function FeaturedServices() {
  return (
    <section id="dich-vu-noi-bat" className="scroll-mt-24 bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-slate-800">DỊCH VỤ NỔI BẬT</h2>
          <p className="mt-2 text-sm text-slate-500">
            Các dịch vụ số tin cậy – Linh hoạt – Bảo mật – Hiệu quả
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="group flex flex-col items-center rounded-xl border border-slate-100 p-5 text-center shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-vnpt-light">
                <service.icon size={30} className="text-vnpt" />
              </div>
              <h3 className="mt-4 text-slate-800">{service.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{service.desc}</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-vnpt">
                Xem chi tiết
                <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
