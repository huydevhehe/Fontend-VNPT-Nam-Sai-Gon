import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VNPT Nam Sài Gòn",
  description: "Đồng hành cùng bạn trên hành trình Chuyển đổi số",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
