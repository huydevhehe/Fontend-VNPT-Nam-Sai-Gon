import Image from "next/image";
import Link from "next/link";
import { Download, Phone } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function HeroSection() {
  return (
    <section className="relative min-h-[380px] overflow-hidden bg-vnpt-darker sm:min-h-[440px] lg:min-h-[500px]">
      <Image
        src="/images/thiet-bi/banner-san-pham-vien-thong.jpg"
        alt="Sản phẩm viễn thông VNPT"
        fill
        sizes="100vw"
        quality={95}
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-vnpt-darker/90 via-vnpt-darker/70 to-vnpt-darker/30" />

      <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col justify-center px-6 py-12 sm:min-h-[440px] lg:min-h-[500px]">
        <Breadcrumb
          variant="light"
          items={[
            { label: "Trang chủ", href: "/" },
            { label: "Sản phẩm", href: "/san-pham" },
            { label: "Sản phẩm viễn thông" },
          ]}
        />

        <h1 className="mt-6 text-white">SẢN PHẨM VIỄN THÔNG</h1>
        <p className="mt-3 font-semibold text-white">
          Thiết bị do VNPT nghiên cứu và sản xuất
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          Từ modem quang, WiFi Mesh, camera an ninh đến giải pháp nhà thông minh – Chất lượng cao,
          bảo mật, tối ưu cho hạ tầng mạng của người Việt.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-vnpt-dark transition hover:bg-slate-100"
          >
            TẢI CATALOG SẢN PHẨM
            <Download size={16} />
          </Link>
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <Phone size={16} />
            LIÊN HỆ TƯ VẤN
          </Link>
        </div>
      </div>
    </section>
  );
}
