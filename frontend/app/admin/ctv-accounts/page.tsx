"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, UserRoundCheck, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import {
  approveCtvAccount,
  getCtvAccounts,
  rejectCtvAccount,
} from "@/lib/api/ctv-accounts.api";
import { CtvAccountRecord } from "@/lib/crm/types/crm.types";

const STATUS_FILTERS: { label: string; value: CtvAccountRecord["status"] | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: "Chờ duyệt" },
  { label: "Đang hoạt động", value: "Đang hoạt động" },
  { label: "Từ chối", value: "Từ chối" },
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

export default function CtvAccountsPage() {
  const [data, setData] = useState<CtvAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CtvAccountRecord["status"] | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getCtvAccounts());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách CTV. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecision(id: string, action: "approve" | "reject") {
    setActionError(null);
    setBusyId(id);
    try {
      const updated =
        action === "approve" ? await approveCtvAccount(id) : await rejectCtvAccount(id);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái. Vui lòng thử lại."
      );
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = data.filter((item) => item.status === "Chờ duyệt").length;
  const activeCount = data.filter((item) => item.status === "Đang hoạt động").length;
  const visible = filter ? data.filter((item) => item.status === filter) : data;

  const columns: Column<CtvAccountRecord>[] = [
    {
      header: "Cộng tác viên",
      accessorKey: "name",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.name}</div>
          <div className="text-[11px] text-slate-400">{item.email || "Chưa có email"}</div>
        </div>
      ),
    },
    {
      header: "Tên đăng nhập",
      accessorKey: "username",
      cell: (item) => <span className="font-mono text-slate-600">{item.username}</span>,
    },
    { header: "Số điện thoại", accessorKey: "phone" },
    {
      header: "Mã giới thiệu",
      accessorKey: "referralCode",
      cell: (item) => <span className="font-mono text-slate-600">{item.referralCode}</span>,
    },
    {
      header: "Ngày đăng ký",
      accessorKey: "createdAt",
      cell: (item) => <span className="text-slate-600">{formatDate(item.createdAt)}</span>,
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => (
        <StatusBadge status={item.status} variant={item.status === "Từ chối" ? "red" : undefined} />
      ),
    },
    {
      header: "Thao tác",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          {item.status !== "Đang hoạt động" && (
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => handleDecision(item.id, "approve")}
              className="btn-label flex items-center gap-1 rounded-lg bg-vnpt px-2.5 py-1 text-white hover:bg-vnpt-dark disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Duyệt
            </button>
          )}
          {item.status !== "Từ chối" && (
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => handleDecision(item.id, "reject")}
              className="btn-label flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Từ chối
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Duyệt cộng tác viên</h2>
        <p className="text-xs text-slate-500">
          Cộng tác viên tự đăng ký ở trạng thái chờ duyệt và chỉ đăng nhập được sau khi Admin duyệt
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="CHỜ DUYỆT"
          value={String(pendingCount)}
          subtitle="Đăng ký mới cần xử lý"
          icon={UserRoundCheck}
        />
        <KpiCard
          title="ĐANG HOẠT ĐỘNG"
          value={String(activeCount)}
          subtitle="CTV đã được duyệt"
          icon={Check}
        />
        <KpiCard
          title="TỔNG TÀI KHOẢN CTV"
          value={String(data.length)}
          subtitle="Mọi trạng thái"
          icon={UserRoundCheck}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`btn-label rounded-xl border px-3 py-1.5 ${
              filter === option.value
                ? "border-vnpt bg-vnpt text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {actionError}
        </p>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">Không thể tải danh sách CTV</p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải danh sách CTV...
        </div>
      ) : (
        <DataTable
          title="Danh sách tài khoản cộng tác viên"
          subtitle="Mới đăng ký hiển thị trước"
          columns={columns}
          data={visible}
          searchPlaceholder="Tìm theo tên, tên đăng nhập, số điện thoại..."
          exportFileName="vnpt_ctv_accounts"
        />
      )}
    </div>
  );
}
