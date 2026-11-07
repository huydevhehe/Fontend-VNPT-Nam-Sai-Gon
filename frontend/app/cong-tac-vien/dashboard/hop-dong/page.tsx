"use client";

import { useEffect, useState } from "react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CtvStatusBadge, { formatDate, formatVnd } from "@/components/ctv/CtvStatusBadge";
import { getCtvContracts } from "@/lib/api/ctv.api";
import type { CtvContractRecord } from "@/lib/crm/types/crm.types";

export default function HopDongPage() {
  const [contracts, setContracts] = useState<CtvContractRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCtvContracts()
      .then((data) => {
        if (!cancelled) setContracts(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const list = contracts ?? [];
  const total = list.length;
  const completed = list.filter((h) => h.deploymentStatus === "Hoàn tất").length;

  return (
    <div>
      <CtvTopbar title="Hợp đồng" subtitle="Hợp đồng phát sinh từ khách hàng bạn giới thiệu" />

      <div className="space-y-4 p-6">
        {error && (
          <div role="alert" className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Tổng hợp đồng</div>
            <div className="mt-1 text-xl font-extrabold text-slate-800">{total}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Đã hoàn tất triển khai</div>
            <div className="mt-1 text-xl font-extrabold text-emerald-600">{completed}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Đang xử lý</div>
            <div className="mt-1 text-xl font-extrabold text-amber-600">{total - completed}</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Mã giao dịch</th>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Giá trị</th>
                <th className="px-4 py-3 font-medium">Ngày tạo</th>
                <th className="px-4 py-3 font-medium">Triển khai</th>
                <th className="px-4 py-3 font-medium">Thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {contracts === null && !error && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {contracts?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Chưa có hợp đồng nào.
                  </td>
                </tr>
              )}
              {contracts?.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{h.transactionCode}</td>
                  <td className="px-4 py-3 text-slate-600">{h.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{formatVnd(h.totalValue)}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(h.createdAt)}</td>
                  <td className="px-4 py-3">
                    <CtvStatusBadge status={h.deploymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <CtvStatusBadge status={h.paymentStatus} />
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
