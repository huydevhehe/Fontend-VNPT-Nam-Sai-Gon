import type { LucideIcon } from "lucide-react";
import { Headset, Network, ShieldCheck, Star } from "lucide-react";

type Strength = {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
};

const strengths: Strength[] = [
  {
    icon: Star,
    title: "Make in Vietnam",
    description: "Sản phẩm do VNPT nghiên cứu, thiết kế và sản xuất tại Việt Nam.",
    iconClass: "bg-red-50 text-red-600",
  },
  {
    icon: Network,
    title: "Tương thích hạ tầng VNPT",
    description: "Tối ưu cho hạ tầng mạng VNPT, hoạt động ổn định, hiệu suất cao.",
    iconClass: "bg-vnpt-light text-vnpt",
  },
  {
    icon: ShieldCheck,
    title: "Bảo hành chính hãng",
    description: "Bảo hành chính hãng VNPT, đảm bảo quyền lợi khách hàng.",
    iconClass: "bg-vnpt-light text-vnpt-dark",
  },
  {
    icon: Headset,
    title: "Hỗ trợ kỹ thuật 24/7",
    description: "Đội ngũ kỹ thuật chuyên nghiệp, hỗ trợ nhanh chóng 24/7.",
    iconClass: "bg-vnpt-light text-vnpt",
  },
];

export default function ProductStrengths() {
  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-center text-slate-900">ĐIỂM MẠNH SẢN PHẨM VNPT</h2>

        <div className="mt-8 grid grid-cols-1 rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {strengths.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 border-t border-slate-200 p-6 first:border-t-0 sm:border-l sm:odd:border-l-0 sm:[&:nth-child(-n+2)]:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0 lg:odd:border-l"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-full ${item.iconClass}`}
                >
                  <Icon className="size-6" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <h3 className="text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
