import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="bg-white pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-vnpt-darker to-vnpt px-8 py-12 sm:px-12">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-white">SẴN SÀNG BỨT PHÁ CÙNG CÔNG NGHỆ</h2>
              <p className="mt-3 text-sm text-white/85">
                Đăng ký tư vấn giải pháp CNTT phù hợp với nhu cầu của bạn!
              </p>
              <Link
                href="/lien-he"
                className="btn-label mt-7 inline-flex items-center justify-center rounded-lg bg-white px-7 py-3 text-vnpt-dark shadow-sm transition hover:bg-slate-100"
              >
                ĐĂNG KÝ TƯ VẤN NGAY
              </Link>
            </div>

            <ShieldCheck
              className="hidden h-40 w-40 shrink-0 text-white/15 lg:block"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
