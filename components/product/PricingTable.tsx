import type { Pricing } from "@/lib/types";

export default function PricingTable({ pricing }: { pricing: Pricing[] }) {
  if (pricing.length === 0) return null;

  return (
    <div className="space-y-6">
      {pricing.map((table, i) => (
        <div key={table.name ?? i} className="overflow-x-auto rounded-xl border border-slate-100">
          {table.name && (
            <div className="bg-vnpt px-4 py-2 text-sm font-semibold text-white">{table.name}</div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-vnpt-light text-slate-600">
              <tr>
                {table.columns.map((col) => (
                  <th key={col} className="px-4 py-2 font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-t border-slate-100">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {table.note && <p className="px-4 py-2 text-xs text-slate-400">{table.note}</p>}
        </div>
      ))}
    </div>
  );
}
