import Link from "next/link";
import { Headset, Phone } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-gradient-to-r from-vnpt-darker to-vnpt">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <h2 className="text-white">CẦN TƯ VẤN THIẾT BỊ PHÙ HỢP?</h2>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            Liên hệ ngay với VNPT Nam Sài Gòn để được tư vấn giải pháp và thiết bị
            tối ưu nhất cho nhu cầu của bạn.
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link
              href="/lien-he"
              className="btn-label inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-vnpt-dark transition-colors hover:bg-slate-100"
            >
              LIÊN HỆ TƯ VẤN
            </Link>
            <a
              href="tel:0838999333"
              className="btn-label inline-flex items-center justify-center gap-2 rounded-md border border-white/60 px-7 py-3 text-white transition-colors hover:bg-white/10"
            >
              <Phone className="size-4" aria-hidden />
              GỌI NGAY 0838 999 333
            </a>
          </div>
        </div>

        <Headset
          className="hidden size-56 shrink-0 text-white/15 lg:block"
          strokeWidth={1}
          aria-hidden
        />
      </div>
    </section>
  );
}
