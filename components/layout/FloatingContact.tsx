import Link from "next/link";
import { FileEdit, MessageCircle, Phone } from "lucide-react";

const ITEMS = [
  { icon: Phone, label: "Gọi ngay", href: "tel:0838999333", className: "bg-vnpt" },
  { icon: MessageCircle, label: "Chat Zalo", href: "https://zalo.me", className: "bg-sky-500" },
  { icon: FileEdit, label: "Đăng ký tư vấn", href: "/lien-he", className: "bg-vnpt-accent" },
];

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      {ITEMS.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          title={item.label}
          className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${item.className}`}
        >
          <item.icon size={20} />
        </Link>
      ))}
    </div>
  );
}
