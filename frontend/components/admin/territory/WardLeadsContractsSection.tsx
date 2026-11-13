"use client";

import StatusBadge from "@/components/admin/shared/StatusBadge";
import type { TerritoryDetail } from "@/lib/crm/types/crm.types";

interface WardLeadsContractsSectionProps {
  leads: TerritoryDetail["leads"];
  contracts: TerritoryDetail["contracts"];
  totals: TerritoryDetail["totals"];
}

const money = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

export default function WardLeadsContractsSection({
  leads,
  contracts,
  totals,
}: WardLeadsContractsSectionProps) {
  return (
    <>
      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-900">Lead dự án đang theo</h3>
          <p className="text-caption mt-0.5 text-slate-500">Tổng cộng {totals.leadCount} lead</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã</th>
                <th className="px-3 py-3 font-semibold">Khách hàng</th>
                <th className="px-3 py-3 font-semibold">Nguồn</th>
                <th className="px-3 py-3 font-semibold">Phụ trách</th>
                <th className="px-3 py-3 font-semibold">Trạng thái</th>
                <th className="px-5 py-3 text-right font-semibold">Giá trị dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-400 italic">
                    Chưa có lead nào thuộc phường này
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{l.id}</td>
                  <td className="px-3 py-3">{l.customerName}</td>
                  <td className="px-3 py-3">{l.channel}</td>
                  <td className="px-3 py-3">{l.staffName}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-5 py-3 text-right">{money(l.expectedValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-sm font-bold text-slate-900">Đơn hàng đã triển khai</h3>
          <p className="text-caption mt-0.5 text-slate-500">
            {totals.contractCount} đơn hàng · Tổng giá trị:{" "}
            <span className="font-bold text-slate-900">{money(totals.contractValue)}</span>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Mã giao dịch</th>
                <th className="px-3 py-3 font-semibold">Khách hàng</th>
                <th className="px-3 py-3 font-semibold">Triển khai</th>
                <th className="px-3 py-3 font-semibold">Thanh toán</th>
                <th className="px-5 py-3 text-right font-semibold">Giá trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400 italic">
                    Chưa có đơn hàng nào thuộc phường này
                  </td>
                </tr>
              )}
              {contracts.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-3 font-semibold text-slate-900">{c.transactionCode}</td>
                  <td className="px-3 py-3">{c.customerName}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={c.deploymentStatus} />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={c.paymentStatus} />
                  </td>
                  <td className="px-5 py-3 text-right">{money(c.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
