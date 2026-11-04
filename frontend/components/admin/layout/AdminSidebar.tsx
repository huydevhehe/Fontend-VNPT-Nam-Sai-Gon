"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  RotateCw,
  Users,
  BellRing,
  Target,
  FileText,
  Percent,
  MapPin,
  UserCheck,
  CheckSquare,
  UploadCloud,
  ShieldCheck,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_SECTIONS = [
  {
    label: "TỔNG QUAN",
    items: [
      {
        name: "Dashboard tổng hợp",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "KINH DOANH & CSKH",
    items: [
      {
        name: "Quản lý nợ",
        href: "/admin/debt-management",
        icon: Receipt,
      },
      {
        name: "Gia hạn trả trước",
        href: "/admin/renewals",
        icon: RotateCw,
      },
      {
        name: "Khách hàng",
        href: "/admin/customers",
        icon: Users,
      },
      {
        name: "Dịch vụ & Cảnh báo",
        href: "/admin/services",
        icon: BellRing,
      },
      {
        name: "Lead / Cơ hội",
        href: "/admin/leads",
        icon: Target,
      },
      {
        name: "Hợp đồng & Giao dịch",
        href: "/admin/contracts",
        icon: FileText,
      },
      {
        name: "Hoa hồng",
        href: "/admin/commissions",
        icon: Percent,
        badge: "Admin",
      },
    ],
  },
  {
    label: "ĐỊA BÀN & VẬN HÀNH",
    items: [
      {
        name: "Phường / Khu phố",
        href: "/admin/territories",
        icon: MapPin,
      },
      {
        name: "Nhân viên",
        href: "/admin/employees",
        icon: UserCheck,
      },
      {
        name: "Công việc / Nhắc việc",
        href: "/admin/tasks",
        icon: CheckSquare,
      },
      {
        name: "Import / Export",
        href: "/admin/data-transfer",
        icon: UploadCloud,
      },
      {
        name: "Tài khoản & Phân quyền",
        href: "/admin/settings",
        icon: ShieldCheck,
      },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header Brand */}
        <div className="flex h-18 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#009fe3] to-[#0066a6] font-black text-white shadow-md shadow-blue-500/20">
              VN
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-vnpt">
                VNPT CRM
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                NAM SÀI GÒN · V2.0
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-5">
              <div className="px-3 pb-2 text-[10px] font-extrabold tracking-wider text-slate-400">
                {section.label}
              </div>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" &&
                      pathname?.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${
                        isActive
                          ? "bg-blue-50/80 font-bold text-vnpt"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 shrink-0 ${
                          isActive ? "text-vnpt" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 bg-slate-50/70 p-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-[11px] text-slate-600">
            <span className="font-bold text-blue-900">● VNPT CRM V2</span>
            <div className="mt-0.5 text-[10px] text-slate-500">
              Nam Sài Gòn · Đã kết nối Mock Backend
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

