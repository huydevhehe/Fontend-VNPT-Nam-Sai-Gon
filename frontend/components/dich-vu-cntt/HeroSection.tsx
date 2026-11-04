import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[380px] items-center overflow-hidden text-white sm:min-h-[440px] lg:min-h-[500px]">
      <Image
        src="/images/dich-vu-cntt/banner-dich-vu-cntt.jpg"
        alt="Dịch vụ CNTT VNPT Nam Sài Gòn"
        fill
        sizes="100vw"
        quality={95}
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-vnpt-darker/85 via-vnpt-darker/60 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="max-w-xl">
          <Breadcrumb
            variant="light"
            items={[{ label: "Trang chủ", href: "/" }, { label: "Dịch vụ CNTT" }]}
          />
          <h1 className="mt-4">DỊCH VỤ CNTT</h1>
          <p className="mt-4 text-lg text-white sm:text-xl">
            Giải pháp số toàn diện
            <br />
            Cho doanh nghiệp và cơ quan nhà nước
          </p>
          <p className="mt-4 text-sm text-white/80">
            VNPT Nam Sài Gòn cung cấp hệ sinh thái dịch vụ CNTT – Viễn thông hiện đại, an
            toàn và hiệu quả, đồng hành cùng bạn trên hành trình Chuyển đổi số.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/lien-he"
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-vnpt-dark transition hover:bg-slate-100"
            >
              ĐĂNG KÝ TƯ VẤN
            </Link>
            <Link
              href="#dich-vu-noi-bat"
              className="flex items-center gap-2 rounded-lg border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              XEM GIẢI PHÁP
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
