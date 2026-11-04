"use client";

import { Menu, Search, Bell, Shield } from "lucide-react";
import { useState } from "react";

interface AdminTopbarProps {
  onOpenMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export default function AdminTopbar({
  onOpenMobileMenu,
  title = "Dashboard tổng hợp",
  subtitle = "Hệ thống CRM quản trị VNPT Nam Sài Gòn",
}: AdminTopbarProps) {
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [selectedStaff, setSelectedStaff] = useState("all");

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur-xs lg:px-8">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="text-[11px] font-bold tracking-wider text-vnpt uppercase">
            VNPT NAM SÀI GÒN · V2
          </div>
          <h1 className="text-base font-bold text-slate-900 lg:text-lg">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle/Right: Quick Search & Filter tools */}
      <div className="flex items-center gap-3">
        {/* Global search */}
        <div className="relative hidden md:block">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm mã thuê bao, MST, khách hàng..."
            className="h-9 w-64 rounded-xl border border-slate-200 bg-slate-50/80 pr-3 pl-9 text-xs text-slate-800 transition-all focus:border-blue-500 focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Filter Month */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase">KỲ:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 outline-hidden"
          >
            <option value="2026-10">Tháng 10/2026 (T)</option>
            <option value="2026-09">Tháng 09/2026 (T-1)</option>
            <option value="2026-08">Tháng 08/2026</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          title="Thông báo hệ thống"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-vnpt">
            AD
          </div>
          <div className="hidden text-left xl:block">
            <div className="text-xs font-bold text-slate-800">
              Quản trị hệ thống
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Shield className="h-2.5 w-2.5 text-blue-600" />
              <span>Admin Toàn quyền</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

