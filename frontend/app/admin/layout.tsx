"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { useAuth } from "@/lib/auth/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fb] text-slate-500">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-800">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <div className="flex items-center justify-end gap-2 border-b border-slate-200 bg-white px-5 py-1.5 lg:px-8">
          <span className="text-caption text-slate-500">
            {user.name} ({user.role})
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="btn-label rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            Đăng xuất
          </button>
        </div>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

