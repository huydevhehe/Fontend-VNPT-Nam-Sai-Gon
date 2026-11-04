import { CircleQuestionMark, Headset, MessageCircle, type LucideIcon } from "lucide-react";

type SupportCard = {
  icon: LucideIcon;
  title: string;
  highlight?: string;
  description: string;
  ctaLabel: string;
  href: string;
};

const CARDS: SupportCard[] = [
  {
    icon: Headset,
    title: "HOTLINE HỖ TRỢ",
    highlight: "0838 999 333",
    description: "Hỗ trợ cài đặt và sử dụng SmartCA 24/7 tất cả các ngày trong tuần",
    ctaLabel: "GỌI NGAY",
    href: "tel:0838999333",
  },
  {
    icon: MessageCircle,
    title: "ZALO OA VNPT NAM SÀI GÒN",
    description: "Tư vấn nhanh qua Zalo OA. Hỗ trợ cài đặt, kích hoạt, gia hạn",
    ctaLabel: "CHAT VỚI CHÚNG TÔI",
    href: "/lien-he",
  },
  {
    icon: CircleQuestionMark,
    title: "CÂU HỎI THƯỜNG GẶP",
    description: "Tổng hợp các câu hỏi và hướng dẫn giúp bạn tự xử lý nhanh chóng",
    ctaLabel: "XEM FAQ",
    href: "/lien-he",
  },
];

export default function TechSupport() {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2>HỖ TRỢ KỸ THUẬT</h2>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="flex gap-4 rounded-xl border border-slate-100 bg-vnpt-light/40 p-5 shadow-sm"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-vnpt-light text-vnpt">
                  <Icon size={30} strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-vnpt-dark">{card.title}</h3>
                  {card.highlight ? (
                    <p className="mt-1 text-xl font-bold text-vnpt-dark">{card.highlight}</p>
                  ) : null}
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                  <a
                    href={card.href}
                    className="mt-4 inline-flex items-center justify-center rounded-md bg-vnpt px-4 py-2 text-xs font-semibold text-white transition hover:bg-vnpt-dark"
                  >
                    {card.ctaLabel}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
