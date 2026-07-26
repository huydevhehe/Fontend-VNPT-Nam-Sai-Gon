import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({
  items,
  variant = "dark",
}: {
  items: BreadcrumbItem[];
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  return (
    <nav className={`flex items-center gap-2 text-sm ${isLight ? "text-white/70" : "text-slate-500"}`}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 && <ChevronRight size={14} />}
          {item.href ? (
            <Link href={item.href} className={isLight ? "hover:text-white" : "hover:text-vnpt"}>
              {item.label}
            </Link>
          ) : (
            <span className={isLight ? "text-white" : "text-slate-700"}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
