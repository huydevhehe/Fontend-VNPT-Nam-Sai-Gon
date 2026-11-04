import type { Metadata } from "next";
import { Gauge, Headset, ShieldCheck, Wrench } from "lucide-react";
import InternetLanding from "@/components/sections/InternetLanding";
import { getInternetPackages, getLowestPrice } from "@/content/internet-packages";

export const metadata: Metadata = {
  title: "Internet cá nhân / gia đình — VNPT Nam Sài Gòn",
  description:
    "Gói cước Internet cáp quang VNPT dành cho cá nhân và hộ gia đình: tốc độ cao, WiFi Mesh, tích hợp camera an ninh.",
};

export default function InternetCaNhanGiaDinhPage() {
  const packages = getInternetPackages("internet-ca-nhan-gia-dinh");

  return (
    <InternetLanding
      name="Internet cá nhân/gia đình"
      heroTitle="INTERNET CÁP QUANG CHO GIA ĐÌNH"
      heroSubtitle="Tốc độ từ 300 Mbps, WiFi phủ toàn nhà, tích hợp bảo mật và camera an ninh."
      heroImage="/images/hero/hero-fiber.jpg"
      packages={packages}
      lowestPrice={getLowestPrice(packages)}
      highlights={[
        { icon: Gauge, title: "Từ 300 Mbps", desc: "Nâng cấp XGSPON" },
        { icon: ShieldCheck, title: "Bảo mật", desc: "GreenNet, Family Safe" },
        { icon: Wrench, title: "Lắp đặt nhanh", desc: "Miễn phí khảo sát" },
        { icon: Headset, title: "Hỗ trợ 24/7", desc: "Tận nơi, tận tâm" },
      ]}
      reasons={[
        "Tốc độ cao, ổn định — thoải mái xem phim 4K, học và làm việc online",
        "Trang bị modem WiFi băng tần kép, hỗ trợ mở rộng bằng WiFi Mesh",
        "Tích hợp sẵn giải pháp bảo mật GreenNet / Family Safe cho gia đình",
        "Tuỳ chọn gói kèm camera an ninh, giám sát nhà cửa mọi lúc",
        "Ưu đãi tặng thêm tháng cước khi đóng trước 12 tháng",
        "Kỹ thuật viên VNPT Nam Sài Gòn hỗ trợ tại nhà, xử lý sự cố nhanh",
      ]}
    />
  );
}
