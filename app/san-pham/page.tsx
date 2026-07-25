import type { Metadata } from "next";
import Link from "next/link";
import { Award, Check, Headset, ShieldCheck, Star, Users } from "lucide-react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { categories } from "@/content/category-map";
import { getCategoryProducts } from "@/content/category-products";

export const metadata: Metadata = { title: "Danh mục sản phẩm — VNPT Nam Sài Gòn" };

const ACCENT: Record<string, string> = {
  "bang-rong-co-dinh": "bg-sky-50 text-sky-600",
  "di-dong-vinaphone": "bg-sky-50 text-sky-600",
  "hoa-don-thue": "bg-emerald-50 text-emerald-600",
  "chu-ky-so": "bg-purple-50 text-purple-600",
  "cloud-idc": "bg-sky-50 text-sky-600",
  "chuyen-doi-so": "bg-orange-50 text-orange-600",
};

const STATS = [
  { icon: Users, value: "25+ năm", label: "Kinh nghiệm" },
  { icon: Award, value: "500.000+", label: "Khách hàng" },
  { icon: Star, value: "99,99%", label: "Độ tin cậy dịch vụ" },
  { icon: Headset, value: "24/7", label: "Hỗ trợ tận tâm" },
  { icon: ShieldCheck, value: "ISO 27001", label: "Bảo mật quốc tế" },
];

export default function SanPhamPage() {
  return (
    <div>
      <section className="bg-vnpt-light px-6 py-10">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-left">
            <Breadcrumb items={[{ label: "Trang chủ", href: "/" }, { label: "Sản phẩm" }]} />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-800">DANH MỤC SẢN PHẨM</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Các sản phẩm - dịch vụ của VNPT giúp cá nhân, doanh nghiệp và tổ chức phát
            triển mạnh mẽ trong kỷ nguyên số.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const products = getCategoryProducts(cat.slug);
            return (
              <div key={cat.slug} className="rounded-xl border border-slate-100 p-6 shadow-sm">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${ACCENT[cat.slug] ?? "bg-vnpt-light text-vnpt"}`}
                >
                  <cat.icon size={26} />
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-800">{cat.name}</h2>
                <p className="text-sm text-slate-500">{cat.shortDesc}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {products.slice(0, 4).map((p) => (
                    <li key={p.id} className="flex items-center gap-2">
                      <Check size={14} className="text-vnpt" /> {p.title}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/san-pham/${cat.slug}`}
                  className="mt-4 inline-block rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-vnpt hover:text-vnpt"
                >
                  Xem chi tiết →
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 rounded-xl border border-slate-100 py-6 sm:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-2 text-center">
              <s.icon size={22} className="shrink-0 text-vnpt" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-800">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-vnpt py-4 text-center text-sm font-semibold text-white">
        VNPT NAM SÀI GÒN - ĐỒNG HÀNH CÙNG BẠN TRÊN HÀNH TRÌNH CHUYỂN ĐỔI SỐ
      </div>
    </div>
  );
}
