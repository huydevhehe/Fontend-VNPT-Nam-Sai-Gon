import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/Shell";

// Montserrat: menu + heading (nét hình học, vuông vắn — hợp ngành viễn thông/CNTT).
const montserrat = Montserrat({
  weight: ["500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
});

// Inter: body — x-height cao, dễ đọc ở size nhỏ, đủ dấu tiếng Việt.
const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VNPT Nam Sài Gòn - Đồng hành cùng bạn trên hành trình Chuyển đổi số",
  description:
    "Giải pháp số toàn diện cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan Nhà nước.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${montserrat.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
