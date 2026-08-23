import type { Metadata } from "next";
import CtaSection from "@/components/dich-vu-cntt/CtaSection";
import FeaturedServices from "@/components/dich-vu-cntt/FeaturedServices";
import HeroSection from "@/components/dich-vu-cntt/HeroSection";
import PartnerLogos from "@/components/dich-vu-cntt/PartnerLogos";
import RelatedNews from "@/components/dich-vu-cntt/RelatedNews";
import SolutionsBySector from "@/components/dich-vu-cntt/SolutionsBySector";

export const metadata: Metadata = {
  title: "Dịch vụ CNTT — VNPT Nam Sài Gòn",
  description:
    "Hệ sinh thái dịch vụ CNTT của VNPT Nam Sài Gòn: chữ ký số, hoá đơn điện tử, hợp đồng điện tử, vnEdu, Cloud & Data Center và các giải pháp chuyển đổi số.",
};

export default function DichVuCnttPage() {
  return (
    <div>
      <HeroSection />
      <FeaturedServices />
      <SolutionsBySector />
      <PartnerLogos />
      <RelatedNews />
      <CtaSection />
    </div>
  );
}
