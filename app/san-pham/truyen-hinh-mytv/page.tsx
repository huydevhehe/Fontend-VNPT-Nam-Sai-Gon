import type { Metadata } from "next";
import { Clapperboard, Headset, Tv, Wifi } from "lucide-react";
import InternetLanding from "@/components/sections/InternetLanding";
import { getInternetPackages, getLowestPrice } from "@/content/internet-packages";

export const metadata: Metadata = {
  title: "Truyền hình MyTV — VNPT Nam Sài Gòn",
  description:
    "Combo Internet + Truyền hình MyTV: hơn 180 kênh trong nước và quốc tế, kho phim theo yêu cầu, xem trên nhiều thiết bị.",
};

export default function TruyenHinhMyTvPage() {
  const packages = getInternetPackages("truyen-hinh-mytv");

  return (
    <InternetLanding
      name="Truyền hình MyTV"
      heroTitle="COMBO INTERNET + TRUYỀN HÌNH MYTV"
      heroSubtitle="Hơn 180 kênh đặc sắc, kho phim khổng lồ, xem mọi lúc trên TV, điện thoại, máy tính bảng."
      heroImage="/images/khuyen-mai/mytv.jpg"
      packages={packages}
      lowestPrice={getLowestPrice(packages)}
      highlights={[
        { icon: Tv, title: "180+ kênh", desc: "Trong nước & quốc tế" },
        { icon: Clapperboard, title: "Kho phim VOD", desc: "Cập nhật liên tục" },
        { icon: Wifi, title: "Kèm Internet", desc: "Cáp quang tốc độ cao" },
        { icon: Headset, title: "Hỗ trợ 24/7", desc: "Lắp đặt tận nơi" },
      ]}
      reasons={[
        "Trọn gói Internet cáp quang và truyền hình trong cùng một hoá đơn",
        "Hơn 180 kênh truyền hình trong nước, quốc tế và các kênh HD đặc sắc",
        "Kho phim, chương trình theo yêu cầu cập nhật liên tục",
        "Xem trên nhiều thiết bị: TV, điện thoại, máy tính bảng",
        "Tuỳ chọn nâng cấp WiFi Mesh cho nhà nhiều tầng, nhiều thiết bị",
        "Ưu đãi thiết bị đầu thu và phí lắp đặt khi đăng ký combo",
      ]}
    />
  );
}
