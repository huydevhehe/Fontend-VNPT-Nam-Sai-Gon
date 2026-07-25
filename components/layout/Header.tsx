"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Headset, Mail, MessageCircle, Menu, Phone, Search, X } from "lucide-react";
import { categories } from "@/content/category-map";

const NAV = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  {
    label: "Sản phẩm",
    href: "/san-pham",
    children: categories.map((c) => ({ label: c.name, href: `/san-pham/${c.slug}` })),
  },
  { label: "Khuyến mãi", href: "/khuyen-mai" },
  { label: "Tin tức", href: "/tin-tuc" },
  { label: "Khách hàng", href: "/khach-hang" },
  { label: "Liên hệ", href: "/lien-he" },
] as const;

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="hidden bg-vnpt-darker text-xs text-white md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <span>VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={14} /> Hotline: 0838 999 333
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} /> Zalo OA
            </span>
            <span className="flex items-center gap-1">
              <Mail size={14} /> Email
            </span>
            <span className="flex items-center gap-1">
              <Headset size={14} /> Hỗ trợ 24/7
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-xl font-extrabold text-vnpt">
          VNPT
          <span className="block text-xs font-semibold tracking-wide text-vnpt-accent">
            NAM SÀI GÒN
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) =>
            "children" in item ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(true)}
                onMouseLeave={() => setOpenDropdown(false)}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-vnpt">
                  {item.label}
                  <ChevronDown size={14} />
                </button>
                {openDropdown && (
                  <div className="absolute left-0 top-full w-56 rounded-lg border border-slate-100 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-vnpt-light hover:text-vnpt"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-700 hover:text-vnpt"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Search size={18} className="text-slate-500" />
          <Link
            href="/lien-he"
            className="rounded-md bg-vnpt-accent px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            ĐĂNG KÝ TƯ VẤN
          </Link>
        </div>

        <button
          className="lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Mở menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 px-6 py-3 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm font-medium text-slate-700"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
