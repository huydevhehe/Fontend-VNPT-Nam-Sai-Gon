"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, ChevronRight, FileText, Handshake, Headset, Users } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CtvStatusBadge, { formatDate, formatVnd } from "@/components/ctv/CtvStatusBadge";
import { getCtvContracts, getCtvLeads, getCtvSummary, type CtvLead } from "@/lib/api/ctv.api";
import type { CtvContractRecord, CtvSummary } from "@/lib/crm/types/crm.types";

const RECENT_LIMIT = 5;

export default function CtvDashboardPage() {
  const [summary, setSummary] = useState<CtvSummary | null>(null);
  const [leads, setLeads] = useState<CtvLead[]>([]);
  const [contracts, setContracts] = useState<CtvContractRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCtvSummary(), getCtvLeads(), getCtvContracts()])
      .then(([s, l, c]) => {
        if (cancelled) return;
        setSummary(s);
        setLeads(l);
        setContracts(c);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const show = (value: number | undefined, format: (n: number) => string = String) =>
    summary ? format(value ?? 0) : "…";
  const successRate =
    summary && summary.totalLeads > 0
      ? Math.round((summary.successfulLeads / summary.totalLeads) * 100)
      : 0;

  const stats = [
    {
      id: "stat-total-leads",
      icon: Users,
      label: "Lead đã giới thiệu",
      value: show(summary?.totalLeads),
      note: summary ? `${summary.failedLeads} thất bại` : "",
    },
    {
      id: "stat-successful-leads",
      icon: Handshake,
      label: "Chốt thành công",
      value: show(summary?.successfulLeads),
      note: summary ? `Tỷ lệ ${successRate}%` : "",
    },
    {
      id: "stat-total-contracts",
      icon: FileText,
      label: "Hợp đồng",
      value: show(summary?.totalContracts),
      note: summary ? `${summary.completedContracts} đã hoàn tất triển khai` : "",
    },
    {
      id: "stat-total-commission",
      icon: Banknote,
      label: "Tổng hoa hồng",
      value: show(summary?.totalCommission, formatVnd),
      note: summary ? `Đã chi ${formatVnd(summary.paidCommission)}` : "",
    },
  ];

  return (
    <div>
      <CtvTopbar title="Dashboard" subtitle="Tổng quan hoạt động giới thiệu của bạn" />

      <div className="space-y-6 p-6">
        {error && (
          <div role="alert" className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.id}
              data-testid={s.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                <s.icon size={18} />
              </span>
              <div className="mt-3 text-lg font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="mt-1 text-[11px] text-slate-400">{s.note}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Hoa hồng</h2>
            <div className="text-xs text-slate-500">Chờ chi</div>
            <div data-testid="stat-pending-commission" className="text-2xl font-extrabold text-vnpt">
              {show(summary?.pendingCommission, formatVnd)}
            </div>
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Đã chi</span>
                <span data-testid="stat-paid-commission" className="font-semibold text-slate-800">
                  {show(summary?.paidCommission, formatVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tổng</span>
                <span className="font-semibold text-slate-800">
                  {show(summary?.totalCommission, formatVnd)}
                </span>
              </div>
            </div>
            <Link
              href="/cong-tac-vien/dashboard/hoa-hong"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem chi tiết <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Lead mới nhất</h2>
            {leads.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có lead nào được giới thiệu.</p>
            ) : (
              <div className="space-y-2.5">
                {leads.slice(0, RECENT_LIMIT).map((l) => (
                  <div key={l.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-700">{l.customerName}</div>
                      <div className="text-slate-400">
                        {l.maskedPhone} · {formatDate(l.createdAt)}
                      </div>
                    </div>
                    <CtvStatusBadge status={l.status} />
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/cong-tac-vien/dashboard/don-hang"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem tất cả <ChevronRight size={13} />
            </Link>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Hợp đồng mới nhất</h2>
            {contracts.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có hợp đồng nào.</p>
            ) : (
              <div className="space-y-2.5">
                {contracts.slice(0, RECENT_LIMIT).map((h) => (
                  <div key={h.id} className="flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-700">{h.transactionCode}</div>
                      <div className="truncate text-slate-400">
                        {h.customerName} · {formatVnd(h.totalValue)}
                      </div>
                    </div>
                    <CtvStatusBadge status={h.deploymentStatus} />
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/cong-tac-vien/dashboard/hop-dong"
              className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              Xem tất cả <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-br from-vnpt-darker to-vnpt p-5 text-white shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <Headset size={24} className="text-vnpt-accent" />
            <div>
              <div className="text-sm font-bold">Giới thiệu khách hàng</div>
              <p className="mt-1 text-xs text-white/75">Nhận hoa hồng cho mỗi hợp đồng triển khai hoàn tất.</p>
            </div>
          </div>
          <Link
            href="/cong-tac-vien/dashboard/link-gioi-thieu"
            className="rounded-md bg-white px-3 py-2 text-center text-xs font-semibold text-vnpt-dark hover:bg-slate-100"
          >
            LẤY LINK GIỚI THIỆU
          </Link>
        </div>
      </div>
    </div>
  );
}
