import type { Metadata } from "next";
import Image from "next/image";
import { Headset, Percent, ShieldCheck, Wallet } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PromotionsBrowser from "@/components/promotions/PromotionsBrowser";
import { getAllPromotions } from "@/content/promotions";

export const metadata: Metadata = { title: "Khuyến mãi — VNPT Nam Sài Gòn" };

const DIEM_NOI_BAT = [
  { icon: Percent, label: "Ưu đãi hấp dẫn mỗi tháng" },
  { icon: Wallet, label: "Tiết kiệm chi phí tối đa" },
  { icon: ShieldCheck, label: "Dịch vụ uy tín, chất lượng" },
  { icon: Headset, label: "Hỗ trợ nhanh chóng 24/7" },
];

export default function KhuyenMaiPage() {
  const promotions = getAllPromotions();
  const featured = promotions.slice(0, 3);
  const rest = promotions.slice(3);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
        <Image
          src="/images/khuyen-mai/banner-khuyen-mai.png"
          alt="Khuyến mãi VNPT"
          fill
          sizes="100vw"
          quality={95}
          priority
          className="object-cover"
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
          <div className="max-w-xl -ml-[620px] [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.9))_drop-shadow(0_8px_20px_rgba(0,0,0,0.7))]">
            <Breadcrumb
              variant="light"
              items={[{ label: "Trang chủ", href: "/" }, { label: "Khuyến mãi" }]}
            />
            <h1 className="mt-3">KHUYẾN MÃI</h1>
            <p className="mt-2 text-white/85">
              Nhiều ưu đãi hấp dẫn dành cho cá nhân và doanh nghiệp
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              {DIEM_NOI_BAT.map((d) => (
                <div key={d.label} className="flex items-start gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <d.icon size={16} />
                  </span>
                  <span className="text-xs leading-tight text-white/85">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PromotionsBrowser featured={featured} rest={rest} />
    </div>
  );
}
