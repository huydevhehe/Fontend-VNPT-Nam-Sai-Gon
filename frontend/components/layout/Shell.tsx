"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import FloatingContact from "./FloatingContact";

// Các khu vực app (admin CRM, dashboard CTV) có layout/sidebar riêng —
// không dùng header/footer của trang marketing công khai.
const APP_PREFIXES = ["/admin", "/cong-tac-vien"];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAppArea = APP_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (isAppArea) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
