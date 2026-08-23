import Image from "next/image";
import Link from "next/link";
import { Building2, GraduationCap, HeartPulse, Landmark, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Sector = {
  name: string;
  description: string;
  image: string;
  href: string;
  icon: LucideIcon;
};

const sectors: Sector[] = [
  {
    name: "Doanh nghiệp",
    description:
      "Giải pháp giúp doanh nghiệp tối ưu quy trình, nâng cao hiệu suất và tăng trưởng bền vững.",
    image: "/images/doi-tuong/doanh-nghiep.jpg",
    href: "/giai-phap/doanh-nghiep",
    icon: Building2,
  },
  {
    name: "Cơ quan Nhà nước",
    description:
      "Giải pháp xây dựng Chính quyền số, hiện đại, minh bạch, phục vụ người dân và doanh nghiệp tốt hơn.",
    image: "/images/doi-tuong/co-quan-nha-nuoc.jpg",
    href: "/giai-phap/co-quan-nha-nuoc",
    icon: Landmark,
  },
  {
    name: "Trường học",
    description:
      "Giải pháp giáo dục số toàn diện, nâng cao chất lượng dạy và học, quản lý hiệu quả.",
    image: "/images/doi-tuong/truong-hoc.jpg",
    href: "/giai-phap/truong-hoc",
    icon: GraduationCap,
  },
  {
    name: "Bệnh viện",
    description:
      "Giải pháp y tế thông minh, quản lý bệnh viện hiệu quả, chăm sóc sức khỏe toàn diện.",
    image: "/images/doi-tuong/benh-vien.jpg",
    href: "/giai-phap/benh-vien",
    icon: HeartPulse,
  },
  {
    name: "Hộ kinh doanh",
    description:
      "Giải pháp đơn giản, tiết kiệm chi phí hỗ trợ quản lý và phát triển kinh doanh hiệu quả.",
    image: "/images/doi-tuong/ho-kinh-doanh.jpg",
    href: "/giai-phap/ho-kinh-doanh",
    icon: Store,
  },
];

export default function SolutionsBySector() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-vnpt-darker">GIẢI PHÁP THEO LĨNH VỰC</h2>
          <p className="mt-2 text-sm text-slate-600">
            Giải pháp chuyên biệt cho từng lĩnh vực hoạt động
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {sectors.map((sector) => {
            const Icon = sector.icon;
            return (
              <article
                key={sector.href}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:border-vnpt/40 hover:shadow-md"
              >
                <div className="relative h-40">
                  <Image
                    src={sector.image}
                    alt={sector.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover"
                  />
                  <span className="absolute -bottom-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
                    <Icon className="h-6 w-6 text-vnpt" aria-hidden="true" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-6 pt-10 text-center">
                  <h3 className="text-vnpt-darker">{sector.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{sector.description}</p>
                  <Link
                    href={sector.href}
                    className="btn-label mt-4 inline-flex items-center justify-center gap-1 text-vnpt hover:text-vnpt-dark"
                  >
                    Xem giải pháp <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
