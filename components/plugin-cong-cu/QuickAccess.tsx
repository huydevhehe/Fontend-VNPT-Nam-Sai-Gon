import { BookOpen, Download, ShieldCheck, Usb, type LucideIcon } from "lucide-react";

type QuickAccessItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
};

const ITEMS: QuickAccessItem[] = [
  {
    icon: Download,
    title: "Tải plugin ký số",
    description: "Bộ cài đặt cho Windows",
    href: "#danh-muc-tai-ve",
  },
  {
    icon: Usb,
    title: "Driver USB Token",
    description: "Driver cho thiết bị Token",
    href: "#danh-muc-tai-ve",
  },
  {
    icon: BookOpen,
    title: "Hướng dẫn cài đặt",
    description: "Tài liệu hướng dẫn chi tiết",
    href: "#danh-muc-tai-ve",
  },
  {
    icon: ShieldCheck,
    title: "Kiểm tra chứng thư số",
    description: "Kiểm tra hiệu lực chứng thư",
    href: "#thao-tac-truc-tuyen",
  },
];

export default function QuickAccess() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2>TRUY CẬP NHANH</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                className="flex items-center gap-4 rounded-lg border border-slate-100 p-4 shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                  <Icon size={24} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-vnpt-dark">{item.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
