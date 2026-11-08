"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CtvSidebar from "@/components/ctv/CtvSidebar";
import { useAuth } from "@/lib/auth/auth-context";

export default function CtvDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "CTV") {
      router.replace("/admin/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "CTV") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CtvSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
