import type { Metadata } from "next";
import DownloadCatalog from "@/components/plugin-cong-cu/DownloadCatalog";
import HeroSection from "@/components/plugin-cong-cu/HeroSection";
import OnlineTools from "@/components/plugin-cong-cu/OnlineTools";
import QuickAccess from "@/components/plugin-cong-cu/QuickAccess";
import SafetyNotice from "@/components/plugin-cong-cu/SafetyNotice";
import TechSupport from "@/components/plugin-cong-cu/TechSupport";

export const metadata: Metadata = {
  title: "Plugin & Công cụ — VNPT Nam Sài Gòn",
  description:
    "Tải bộ cài plugin ký số, driver USB Token và tài liệu hướng dẫn của VNPT. File tải trực tiếp từ máy chủ chính thức của VNPT.",
};

export default function PluginCongCuPage() {
  return (
    <div>
      <HeroSection />
      <QuickAccess />
      <DownloadCatalog />
      <OnlineTools />
      <SafetyNotice />
      <TechSupport />
    </div>
  );
}
