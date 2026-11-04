import type { Metadata } from "next";
import CtaSection from "@/components/san-pham-vien-thong/CtaSection";
import DeviceGrid, { type TelecomDevice } from "@/components/san-pham-vien-thong/DeviceGrid";
import HeroSection from "@/components/san-pham-vien-thong/HeroSection";
import ProductStrengths from "@/components/san-pham-vien-thong/ProductStrengths";
import { getTelecomDeviceMeta } from "@/content/telecom-devices";
import { getProductsBySource } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sản phẩm Viễn thông — VNPT Nam Sài Gòn",
  description:
    "Thiết bị viễn thông do VNPT nghiên cứu và sản xuất: modem quang XGS-PON/GPON, Mesh WiFi, camera an ninh, SmartBox và giải pháp Smart Home.",
};

/** Gộp dữ liệu sản phẩm đã cào với ảnh + nhóm + thông số khai báo trong content. */
function getDevices(): TelecomDevice[] {
  return getProductsBySource("vnpt-technology").flatMap((product) => {
    const meta = getTelecomDeviceMeta(product.slug);
    if (!meta) return [];
    return [
      {
        slug: product.slug,
        title: product.title,
        shortDesc: product.shortDesc,
        sourceUrl: product.sourceUrl,
        image: meta.image,
        group: meta.group,
        specs: meta.specs,
      },
    ];
  });
}

export default function SanPhamVienThongPage() {
  return (
    <div>
      <HeroSection />
      <DeviceGrid devices={getDevices()} />
      <ProductStrengths />
      <CtaSection />
    </div>
  );
}
