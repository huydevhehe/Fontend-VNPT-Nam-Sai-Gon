import type { Metadata } from "next";
import { Montserrat, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  weight: ["500", "600", "700", "800"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
});

const beVN = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["vietnamese", "latin"],
  variable: "--font-be-vn",
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
    <html lang="vi" className={`${montserrat.variable} ${beVN.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
