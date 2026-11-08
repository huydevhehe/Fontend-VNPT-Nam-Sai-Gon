"use client";

import { useEffect, useState } from "react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CtvStatusBadge, { formatDate, formatVnd } from "@/components/ctv/CtvStatusBadge";
import { getCtvCommissions, getCtvSummary } from "@/lib/api/ctv.api";
import type { CtvCommissionRecord, CtvSummary } from "@/lib/crm/types/crm.types";

export default function HoaHongPage() {
  const [commissions, setCommissions] = useState<CtvCommissionRecord[] | null>(null);
  const [summary, setSummary] = useState<CtvSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCtvCommissions(), getCtvSummary()])
      .then(([list, s]) => {
        if (cancelled) return;
        setCommissions(list);
        setSummary(s);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <CtvTopbar title="Hoa hồng" subtitle="Hoa hồng theo từng hợp đồng đã hoàn tất triển khai" />

      <div className="space-y-4 p-6">
        {error && (
          <div role="alert" className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-5 text-white shadow-sm">
            <div className="text-xs text-white/75">Hoa hồng chờ chi</div>
            <div className="mt-1 text-2xl font-extrabold">{formatVnd(summary?.pendingCommission ?? 0)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Đã chi</div>
            <div className="mt-1 text-2xl font-extrabold text-emerald-600">
              {formatVnd(summary?.paidCommission ?? 0)}
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="text-xs text-slate-500">Tổng hoa hồng</div>
            <div className="mt-1 text-2xl font-extrabold text-slate-800">
              {formatVnd(summary?.totalCommission ?? 0)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Mã giao dịch</th>
                <th className="px-4 py-3 font-medium">Ngày ghi nhận</th>
                <th className="px-4 py-3 font-medium">Hoa hồng</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {commissions === null && !error && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {commissions?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Chưa có hoa hồng nào.
                  </td>
                </tr>
              )}
              {commissions?.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.transactionCode}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(h.date)}</td>
                  <td className="px-4 py-3 font-semibold text-vnpt">{formatVnd(h.amount)}</td>
                  <td className="px-4 py-3">
                    <CtvStatusBadge status={h.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
