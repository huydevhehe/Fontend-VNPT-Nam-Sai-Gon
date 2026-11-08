"use client";

import { useEffect, useState } from "react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CtvStatusBadge, { formatDate, formatVnd } from "@/components/ctv/CtvStatusBadge";
import { getCtvLeads, type CtvLead } from "@/lib/api/ctv.api";

export default function DonHangPage() {
  const [leads, setLeads] = useState<CtvLead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCtvLeads()
      .then((data) => {
        if (!cancelled) setLeads(data);
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
      <CtvTopbar title="Đơn hàng" subtitle="Khách hàng bạn đã giới thiệu và tiến độ xử lý" />

      <div className="p-6">
        {error && (
          <div role="alert" className="mb-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Số điện thoại</th>
                <th className="px-4 py-3 font-medium">Loại</th>
                <th className="px-4 py-3 font-medium">Giá trị dự kiến</th>
                <th className="px-4 py-3 font-medium">Ngày giới thiệu</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Hợp đồng</th>
              </tr>
            </thead>
            <tbody>
              {leads === null && !error && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {leads?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Bạn chưa giới thiệu khách hàng nào.
                  </td>
                </tr>
              )}
              {leads?.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-semibold text-slate-700">{d.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{d.maskedPhone}</td>
                  <td className="px-4 py-3 text-slate-600">{d.group}</td>
                  <td className="px-4 py-3 text-slate-600">{formatVnd(d.expectedValue)}</td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(d.createdAt)}</td>
                  <td className="px-4 py-3">
                    <CtvStatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3">
                    <CtvStatusBadge status={d.contractStatus} />
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
