import type { LucideIcon } from "lucide-react";

export type Stat = { value: string; label: string; icon: LucideIcon };

export default function StatBar({ items }: { items: Stat[] }) {
  return (
    <div className="px-6 py-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-gradient-to-r from-vnpt-dark to-vnpt">
        <div className="grid grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="text-2xl font-bold text-white sm:text-3xl">{item.value}</div>
                <div className="text-sm text-white/70">{item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
