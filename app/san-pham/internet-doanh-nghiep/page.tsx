import type { Metadata } from "next";
import { Building2, Gauge, Headset, ShieldCheck } from "lucide-react";
import InternetLanding from "@/components/sections/InternetLanding";
import { getInternetPackages, getLowestPrice } from "@/content/internet-packages";

export const metadata: Metadata = {
  title: "Internet doanh nghiệp — VNPT Nam Sài Gòn",
  description:
    "Đường truyền Internet cáp quang chuyên dụng cho doanh nghiệp: cam kết băng thông, IP tĩnh, SLA rõ ràng, hỗ trợ 24/7.",
};

export default function InternetDoanhNghiepPage() {
  const packages = getInternetPackages("internet-doanh-nghiep");

  return (
    <InternetLanding
      name="Internet doanh nghiệp"
      heroTitle="INTERNET CHUYÊN DỤNG CHO DOANH NGHIỆP"
      heroSubtitle="Đường truyền riêng, cam kết băng thông quốc tế, IP tĩnh và SLA rõ ràng."
      heroImage="/images/hero/hero-datacenter.jpg"
      packages={packages}
      lowestPrice={getLowestPrice(packages)}
      priceLabel="Giá cước"
      highlights={[
        { icon: Gauge, title: "Băng thông cam kết", desc: "Không chia sẻ" },
        { icon: Building2, title: "IP tĩnh", desc: "Phù hợp server, VPN" },
        { icon: ShieldCheck, title: "SLA rõ ràng", desc: "Cam kết khắc phục" },
        { icon: Headset, title: "Hỗ trợ 24/7", desc: "Ưu tiên doanh nghiệp" },
      ]}
      reasons={[
        "Đường truyền cáp quang chuyên dụng, cam kết tốc độ trong nước và quốc tế",
        "Cấp IP tĩnh, phù hợp triển khai server, camera, VPN, tổng đài",
        "SLA cam kết thời gian khắc phục sự cố, ưu tiên xử lý cho doanh nghiệp",
        "Kết hợp linh hoạt với Cloud, tổng đài số và các giải pháp CNTT khác của VNPT",
        "Đội ngũ kỹ thuật riêng hỗ trợ triển khai và vận hành",
        "Hoá đơn điện tử, hợp đồng điện tử thuận tiện cho công tác kế toán",
      ]}
    />
  );
}
