import Link from "next/link";
import { Headset, ArrowRight } from "lucide-react";
import { categories } from "@/content/category-map";
import { getAllArticles } from "@/lib/data";
import ArticleCard from "@/components/article/ArticleCard";
import LeadForm from "@/components/sections/LeadForm";
import StatBar from "@/components/sections/StatBar";

const DOI_TUONG = [
  { slug: "ca-nhan", label: "Cá nhân" },
  { slug: "ho-kinh-doanh", label: "Hộ kinh doanh" },
  { slug: "doanh-nghiep", label: "Doanh nghiệp" },
  { slug: "co-quan-nha-nuoc", label: "Cơ quan nhà nước" },
  { slug: "truong-hoc", label: "Trường học" },
  { slug: "benh-vien", label: "Bệnh viện" },
];

const KHUYEN_MAI = [
  { title: "Internet siêu tốc độ", discount: "Ưu đãi cực sốc 20%", note: "Gói FiberVNN" },
  { title: "Combo Internet + MyTV", discount: "Chỉ từ 205.000đ/tháng", note: "Ưu đãi thiết bị, phí lắp đặt" },
  { title: "Hóa đơn điện tử", discount: "Tiết kiệm đến 50%", note: "Chi phí khi đăng ký mới" },
  { title: "Chữ ký số SmartCA", discount: "Ưu đãi đến 30%", note: "Khi đăng ký gói 2 năm" },
];

export default function HomePage() {
  const news = getAllArticles().slice(0, 3);

  return (
    <div>
      <section className="bg-gradient-to-br from-vnpt-darker via-vnpt-dark to-vnpt px-6 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
              CHUYỂN ĐỔI SỐ TOÀN DIỆN
              <br />
              CÙNG VNPT NAM SÀI GÒN
            </h1>
            <p className="mt-4 max-w-xl text-white/85">
              Giải pháp số tin cậy cho Cá nhân, Hộ kinh doanh, Doanh nghiệp và Cơ quan
              Nhà nước.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/lien-he"
                className="flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-vnpt"
              >
                <Headset size={18} /> TƯ VẤN NGAY
              </Link>
              <Link
                href="/san-pham"
                className="flex items-center gap-2 rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white"
              >
                XEM SẢN PHẨM <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/san-pham/${cat.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center shadow-sm hover:shadow-md"
            >
              <cat.icon size={28} className="text-vnpt" />
              <span className="text-sm font-semibold text-slate-800">{cat.name}</span>
              <span className="text-xs text-slate-500">{cat.shortDesc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="mb-6 text-xl font-bold text-slate-800">GIẢI PHÁP THEO ĐỐI TƯỢNG</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DOI_TUONG.map((d) => (
            <Link
              key={d.slug}
              href={`/giai-phap/${d.slug}`}
              className="rounded-xl border border-slate-100 p-4 text-center text-sm font-semibold text-slate-700 shadow-sm hover:shadow-md"
            >
              {d.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">KHUYẾN MÃI NỔI BẬT</h2>
            <Link href="/khuyen-mai" className="text-sm font-semibold text-vnpt">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {KHUYEN_MAI.map((k) => (
              <div key={k.title} className="rounded-xl bg-vnpt p-4 text-white">
                <h3 className="text-sm font-semibold">{k.title}</h3>
                <p className="mt-2 text-lg font-bold text-vnpt-accent">{k.discount}</p>
                <p className="text-xs text-white/70">{k.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">TIN TỨC MỚI</h2>
            <Link href="/tin-tuc" className="text-sm font-semibold text-vnpt">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-4">
            {news.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      <StatBar
        items={[
          { value: "20+", label: "Năm kinh nghiệm" },
          { value: "100.000+", label: "Khách hàng tin tưởng" },
          { value: "500+", label: "Đối tác toàn quốc" },
          { value: "24/7", label: "Hỗ trợ tận tâm" },
        ]}
      />
    </div>
  );
}
