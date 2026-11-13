"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Percent, ShieldAlert, ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, Edit3, Wallet, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusSelect from "@/components/admin/shared/StatusSelect";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getCommissions,
  updateCommissionStatus,
  updateCommissionAmount,
  updateCommissionPayout,
} from "@/lib/api/commissions.api";
import { CommissionRecord } from "@/lib/crm/types/crm.types";
import { TableFilter } from "@/lib/table-filters";

const COMMISSION_STATUSES: CommissionRecord["status"][] = [
  "Đã nhận",
  "Chờ nhận",
  "Đã chi",
  "Chờ chi",
];

function formatMoney(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value.toLocaleString("vi-VN")} ₫`;
}

export default function CommissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<CommissionRecord | null>(null);
  const [amountInput, setAmountInput] = useState<string>("");
  const [noteInput, setNoteInput] = useState<string>("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [payoutItem, setPayoutItem] = useState<CommissionRecord | null>(null);
  const [payoutOverrideInput, setPayoutOverrideInput] = useState<string>("");
  const [payoutAmountInput, setPayoutAmountInput] = useState<string>("");
  const [payoutDateInput, setPayoutDateInput] = useState<string>("");
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSaving, setPayoutSaving] = useState(false);

  function openEditModal(item: CommissionRecord) {
    setEditingItem(item);
    setAmountInput(String(item.amount));
    setNoteInput(item.note ?? "");
    setModalError(null);
  }

  async function handleSaveAmount(e: FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    const val = Number(amountInput);
    if (isNaN(val) || val < 0) {
      setModalError("Số tiền phải là số lớn hơn hoặc bằng 0");
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const updated = await updateCommissionAmount(editingItem.id, val, noteInput.trim() || null);
      setData((prev) => prev.map((row) => (row.id === editingItem.id ? updated : row)));
      setEditingItem(null);
    } catch (err: any) {
      setModalError(err.message || "Không thể cập nhật số tiền hoa hồng");
    } finally {
      setSaving(false);
    }
  }

  function openPayoutModal(item: CommissionRecord) {
    setPayoutItem(item);
    setPayoutOverrideInput(
      item.customerPaidOverride !== null && item.customerPaidOverride !== undefined
        ? String(item.customerPaidOverride)
        : ""
    );
    setPayoutAmountInput(String(item.paidOutAmount ?? 0));
    setPayoutDateInput(item.paidOutDate ?? "");
    setPayoutError(null);
  }

  async function handleSavePayout(e: FormEvent) {
    e.preventDefault();
    if (!payoutItem) return;

    const overrideTrimmed = payoutOverrideInput.trim();
    let overrideVal: number | null = null;
    if (overrideTrimmed !== "") {
      overrideVal = Number(overrideTrimmed);
      if (isNaN(overrideVal) || overrideVal < 0) {
        setPayoutError("Số tiền \"Khách đã chi\" phải là số lớn hơn hoặc bằng 0");
        return;
      }
    }

    const amountVal = Number(payoutAmountInput);
    if (isNaN(amountVal) || amountVal < 0) {
      setPayoutError("Số tiền đã chi hoa hồng phải là số lớn hơn hoặc bằng 0");
      return;
    }

    setPayoutSaving(true);
    setPayoutError(null);
    try {
      const updated = await updateCommissionPayout(payoutItem.id, {
        customerPaidOverride: overrideVal,
        paidOutAmount: amountVal,
        paidOutDate: payoutDateInput.trim() || null,
      });
      setData((prev) => prev.map((row) => (row.id === payoutItem.id ? updated : row)));
      setPayoutItem(null);
    } catch (err) {
      setPayoutError(err instanceof Error ? err.message : "Không thể cập nhật chi hoa hồng");
    } finally {
      setPayoutSaving(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCommissions() {
      setLoading(true);
      setError(null);
      try {
        const commissions = await getCommissions();
        if (isMounted) {
          setData(commissions);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Hoa hồng. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCommissions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Thứ tự cột theo Global Constraints đợt 4: Mã giao dịch → Người giới thiệu →
  // Khách hàng → Loại → Khách đã chi → Hoa hồng phải chi → Đã chi hoa hồng →
  // Còn lại → Trạng thái → Ngày.
  const columns: Column<CommissionRecord>[] = [
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) =>
        item.contractId ? (
          <Link
            href={`/admin/contracts?ma=${encodeURIComponent(item.transactionCode)}`}
            className="font-mono font-semibold text-vnpt hover:underline"
          >
            {item.transactionCode}
          </Link>
        ) : (
          <span className="font-mono text-slate-700 font-semibold">
            {item.transactionCode}
          </span>
        ),
    },
    {
      header: "Người giới thiệu",
      accessorKey: "referrerName",
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900">{item.referrerName ?? "—"}</span>
          {item.referrerCode && (
            <p className="text-[11px] font-mono text-slate-400">{item.referrerCode}</p>
          )}
        </div>
      ),
    },
    {
      header: "Khách hàng",
      accessorKey: "customerName",
      cell: (item) => <span className="text-slate-700">{item.customerName ?? "—"}</span>,
    },
    {
      header: "Loại",
      accessorKey: "type",
      cell: (item) => (
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
            item.type === "Hoa hồng nội bộ"
              ? "bg-blue-50 text-blue-700"
              : "bg-purple-50 text-purple-700"
          }`}
        >
          {item.type}
        </span>
      ),
    },
    {
      header: "Khách đã chi",
      accessorKey: "customerPaid",
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{formatMoney(item.customerPaid)}</span>
          {item.customerPaidOverride !== null && item.customerPaidOverride !== undefined && (
            <p className="text-[11px] text-amber-600">Đã sửa tay</p>
          )}
        </div>
      ),
    },
    {
      header: "Hoa hồng phải chi",
      accessorKey: "amount",
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900">{formatMoney(item.amount)}</span>
          {item.note && (
            <p className="text-[11px] text-slate-500 italic mt-0.5">{item.note}</p>
          )}
        </div>
      ),
    },
    {
      header: "Đã chi hoa hồng",
      accessorKey: "paidOutAmount",
      cell: (item) => (
        <div>
          <span className="font-semibold text-slate-800">{formatMoney(item.paidOutAmount)}</span>
          {item.paidOutDate && (
            <p className="text-[11px] text-slate-400">{item.paidOutDate}</p>
          )}
        </div>
      ),
    },
    {
      header: "Còn lại",
      accessorKey: "remaining",
      cell: (item) => (
        <span className={`font-bold ${item.remaining < 0 ? "text-rose-600" : "text-emerald-700"}`}>
          {formatMoney(item.remaining)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => (
        <StatusSelect
          value={item.status}
          options={COMMISSION_STATUSES}
          onChange={async (next) => {
            const updated = await updateCommissionStatus(item.id, next);
            setData((prev) =>
              prev.map((row) => (row.id === item.id ? updated : row))
            );
          }}
        />
      ),
    },
    {
      header: "Ngày",
      accessorKey: "date",
    },
    ...(isAdmin
      ? [
          {
            header: "Thao tác",
            cell: (item: CommissionRecord) => (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  Sửa số tiền
                </button>
                <button
                  type="button"
                  onClick={() => openPayoutModal(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt transition-colors"
                >
                  <Wallet className="h-3 w-3" />
                  Chi hoa hồng
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const filters: TableFilter<CommissionRecord>[] = [
    { id: "referrerName", label: "Người giới thiệu", getValue: (row) => row.referrerName },
    { id: "type", label: "Loại", getValue: (row) => row.type },
    { id: "status", label: "Trạng thái", getValue: (row) => row.status },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Quản lý hoa hồng nội bộ & chi kênh
            </h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Theo dõi hoa hồng đã nhận từ Sales nội bộ và số tiền chi trả cho từng đối tác/kênh
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="HOA HỒNG NỘI BỘ ĐÃ NHẬN"
          value="86,5 tr ₫"
          subtitle="Từ nguồn Sales giao"
          icon={ArrowDownLeft}
        />
        <KpiCard
          title="HOA HỒNG CHI KÊNH"
          value="42,8 tr ₫"
          subtitle="Chi cho đại lý & đối tác"
          icon={ArrowUpRight}
        />
        <KpiCard
          title="CHỜ ĐỐI SOÁT"
          value="8,2 tr ₫"
          subtitle="Đang kiểm tra chứng từ"
          icon={Clock}
        />
        <KpiCard
          title="PHÂN QUYỀN TRUY CẬP"
          value="Bảo mật"
          subtitle="Chỉ tài khoản Admin được xem"
          icon={ShieldAlert}
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Hoa hồng
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Hoa hồng...
        </div>
      ) : (
        <DataTable
          title="Bảng đối soát hoa hồng"
          subtitle="Chi tiết từng giao dịch nhận từ Sales và lệnh chi cho đối tác"
          columns={columns}
          data={data}
          filters={filters}
          searchPlaceholder="Tìm theo người giới thiệu, khách hàng, mã giao dịch..."
          exportFileName="vnpt_hoa_hong"
        />
      )}

      {/* Modal Sửa Số Tiền Hoa Hồng (Chỉ dành cho Admin) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Sửa số tiền hoa hồng
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAmount} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Đối tượng: <strong className="text-slate-800">{editingItem.recipientName}</strong>
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  Mã GD: <strong className="font-mono text-slate-800">{editingItem.transactionCode}</strong>
                </p>
              </div>

              <div>
                <label className="text-form-label mb-1.5 block text-slate-700">
                  Số tiền hoa hồng (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div>
                <label className="text-form-label mb-1.5 block text-slate-700">
                  Ghi chú công thức / lý do điều chỉnh
                </label>
                <textarea
                  rows={2}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="VD: Áp dụng mức 20% theo thoả thuận gói CNTT..."
                />
              </div>

              {modalError && (
                <p className="text-xs font-semibold text-rose-600">{modalError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-vnpt px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-vnpt-darker"
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chi Hoa Hồng (Chỉ dành cho Admin): ghi nhận đã chi + ghi đè khách đã chi */}
      {payoutItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Chi hoa hồng</h3>
              <button
                type="button"
                onClick={() => setPayoutItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayout} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Người giới thiệu: <strong className="text-slate-800">{payoutItem.referrerName ?? "—"}</strong>
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  Mã GD: <strong className="font-mono text-slate-800">{payoutItem.transactionCode}</strong>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <label className="text-form-label mb-1.5 block text-slate-700">Khách đã chi</label>
                <p className="text-xs text-slate-500 mb-2">
                  Tự tính từ đơn hàng: <strong>{formatMoney(payoutItem.customerPaidAuto)}</strong>
                </p>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={payoutOverrideInput}
                  onChange={(e) => setPayoutOverrideInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-vnpt focus:outline-hidden"
                  placeholder="Sửa tay (để trống = dùng số tự tính)"
                />
              </div>

              <div>
                <label className="text-form-label mb-1.5 block text-slate-700">
                  Đã chi hoa hồng (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={payoutAmountInput}
                  onChange={(e) => setPayoutAmountInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="Nhập số tiền đã chi..."
                />
              </div>

              <div>
                <label className="text-form-label mb-1.5 block text-slate-700">Ngày chi</label>
                <input
                  type="date"
                  value={payoutDateInput}
                  onChange={(e) => setPayoutDateInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 focus:border-vnpt focus:bg-white focus:outline-hidden"
                />
              </div>

              {payoutError && (
                <p className="text-xs font-semibold text-rose-600">{payoutError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutItem(null)}
                  disabled={payoutSaving}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={payoutSaving}
                  className="rounded-xl bg-vnpt px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-vnpt-darker"
                >
                  {payoutSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

