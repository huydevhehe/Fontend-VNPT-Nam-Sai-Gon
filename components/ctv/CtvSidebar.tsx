"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  FileText,
  Gauge,
  HandCoins,
  Headset,
  Image as ImageIcon,
  Link2,
  Package,
  Phone,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "TỔNG QUAN",
    items: [{ href: "/cong-tac-vien/dashboard", label: "Dashboard", icon: Gauge }],
  },
  {
    label: "QUẢN LÝ",
    items: [
      { href: "/cong-tac-vien/dashboard/khach-hang", label: "Khách hàng", icon: Users },
      { href: "/cong-tac-vien/dashboard/hop-dong", label: "Hợp đồng", icon: FileText },
      { href: "/cong-tac-vien/dashboard/don-hang", label: "Đơn hàng", icon: ShoppingCart },
    ],
  },
  {
    label: "DOANH SỐ - HOA HỒNG",
    items: [
      { href: "/cong-tac-vien/dashboard/doanh-so", label: "Doanh số", icon: BarChart3 },
      { href: "/cong-tac-vien/dashboard/hoa-hong", label: "Hoa hồng", icon: HandCoins },
      { href: "/cong-tac-vien/dashboard/thanh-toan", label: "Thanh toán", icon: Wallet },
    ],
  },
  {
    label: "CÔNG CỤ HỖ TRỢ",
    items: [
      { href: "/cong-tac-vien/dashboard/link-gioi-thieu", label: "Link giới thiệu", icon: Link2 },
      { href: "/cong-tac-vien/dashboard/tai-lieu-banner", label: "Tài liệu & Banner", icon: ImageIcon },
      { href: "/cong-tac-vien/dashboard/san-pham", label: "Sản phẩm", icon: Package },
    ],
  },
  {
    label: "TIỆN ÍCH",
    items: [
      { href: "/cong-tac-vien/dashboard/thong-bao", label: "Thông báo", icon: Bell },
      { href: "/cong-tac-vien/dashboard/ho-tro", label: "Hỗ trợ", icon: Headset },
      { href: "/cong-tac-vien/dashboard/cai-dat", label: "Cài đặt", icon: Settings },
    ],
  },
];

export default function CtvSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-vnpt-darker text-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <Receipt className="text-vnpt-accent" size={22} />
        <div>
          <div className="text-sm font-extrabold leading-tight">VNPT</div>
          <div className="text-[10px] font-semibold leading-tight text-white/60">NAM SÀI GÒN</div>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="px-2 pb-2 text-[10px] font-semibold tracking-wide text-white/40">{group.label}</div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                      active ? "bg-vnpt text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <a
          href="tel:0838999333"
          className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          <Phone size={14} className="text-vnpt-accent" /> Đường dây nóng 0838 999 333
        </a>
      </div>
    </aside>
  );
}
