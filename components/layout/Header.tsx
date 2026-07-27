"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ChevronDown, LayoutDashboard, Menu, Search, X } from "lucide-react";
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
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/tim-kiem?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/vnpt_logo.png"
            alt="VNPT Nam Sài Gòn"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {searchOpen ? (
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 items-center gap-2 lg:flex">
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm, tin tức..."
              className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm outline-none focus:border-vnpt focus:ring-4 focus:ring-vnpt/10"
            />
            <button
              type="button"
              aria-label="Đóng tìm kiếm"
              onClick={() => setSearchOpen(false)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-vnpt-light hover:text-vnpt"
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          <>
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

            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                aria-label="Tìm kiếm"
                onClick={() => setSearchOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-vnpt-light hover:text-vnpt"
              >
                <Search size={18} />
              </button>
              <Link
                href="/cong-tac-vien/dashboard"
                title="Dashboard CTV (demo)"
                aria-label="Dashboard CTV (demo)"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-vnpt-light hover:text-vnpt"
              >
                <LayoutDashboard size={18} />
              </Link>
              <Link
                href="/lien-he"
                className="rounded-md bg-vnpt-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 hover:shadow-md"
              >
                ĐĂNG KÝ TƯ VẤN
              </Link>
            </div>
          </>
        )}

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
