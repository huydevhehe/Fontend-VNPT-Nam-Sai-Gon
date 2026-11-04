import type { Metadata } from "next";
import CtvSidebar from "@/components/ctv/CtvSidebar";

export const metadata: Metadata = { title: "Dashboard CTV — VNPT Nam Sài Gòn" };

export default function CtvDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <CtvSidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
