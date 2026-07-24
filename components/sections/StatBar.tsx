export type Stat = { value: string; label: string };

export default function StatBar({ items }: { items: Stat[] }) {
  return (
    <div className="bg-vnpt">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-8 text-center text-white md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-sm text-white/80">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
