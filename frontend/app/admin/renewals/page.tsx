"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, UploadCloud, Clock, CheckCircle, AlertTriangle, Pencil, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import {
  RenewalRecord,
  RenewalStatus,
} from "@/lib/crm/types/crm.types";
import {
  getRenewals,
  importRenewalsExcel,
  updateRenewalDates,
  updateRenewalStatus,
} from "@/lib/api/renewals.api";
import StatusSelect from "@/components/admin/shared/StatusSelect";
import { useAuth } from "@/lib/auth/auth-context";
import StaffKpiTable from "@/components/admin/kpi/StaffKpiTable";

const RENEWAL_STATUS_OPTIONS: RenewalStatus[] = [
  "Chưa xử lý",
  "Khách hẹn thanh toán",
  "Hoàn thành",
  "Thất bại",
];

export default function RenewalsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCohort, setSelectedCohort] = useState<"ALL" | "THÁNG T" | "THÁNG T-1" | "KPI">("ALL");

  const [dateEditTarget, setDateEditTarget] = useState<RenewalRecord | null>(null);
  const [dateForm, setDateForm] = useState({ expiryDate: "", renewedAt: "" });
  const [dateError, setDateError] = useState<string | null>(null);
  const [savingDates, setSavingDates] = useState(false);

  async function loadRenewals() {
    setLoading(true);
    setError(null);
    try {
      const renewals = await getRenewals();
      setData(renewals);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu gia hạn. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRenewals();
  }, []);

  async function handleFileSelected(file: File) {
    const cohort = selectedCohort === "ALL" ? "THÁNG T" : selectedCohort;
    setImporting(true);
    try {
      const result = await importRenewalsExcel(file, cohort);
      const errorSummary = result.errors.length
        ? `\nChi tiết lỗi:\n${result.errors.slice(0, 10).join("\n")}${
            result.errors.length > 10 ? `\n...và ${result.errors.length - 10} lỗi khác` : ""
          }`
        : "";
      alert(
        `Import thành công: ${result.importedCount}/${result.totalProcessed} dòng. Trùng mã: ${result.duplicateCount}. Bỏ qua ${result.skippedCount} dòng lỗi.${errorSummary}`
      );
      await loadRenewals();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Import file gia hạn thất bại. Vui lòng thử lại."
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleStatusChange(item: RenewalRecord, nextStatus: RenewalStatus) {
    await updateRenewalStatus(item.id, nextStatus);
    setData((prev) =>
      prev.map((row) =>
        row.id === item.id
          ? { ...row, status: nextStatus, failureReason: undefined }
          : row
      )
    );
  }

  function openDateEdit(item: RenewalRecord) {
    setDateEditTarget(item);
    setDateForm({
      expiryDate: item.expiryDate ?? "",
      renewedAt: item.renewedAt ?? "",
    });
    setDateError(null);
  }

  async function handleSaveDates(e: React.FormEvent) {
    e.preventDefault();
    if (!dateEditTarget) return;
    setSavingDates(true);
    setDateError(null);
    try {
      const updated = await updateRenewalDates(dateEditTarget.id, {
        expiryDate: dateForm.expiryDate || null,
        renewedAt: dateForm.renewedAt || null,
      });
      setData((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row))
      );
      setDateEditTarget(null);
    } catch (err) {
      setDateError(
        err instanceof Error ? err.message : "Cập nhật ngày thất bại. Vui lòng thử lại."
      );
    } finally {
      setSavingDates(false);
    }
  }

  const filteredData = data.filter((item) => {
    if (selectedCohort === "ALL") return true;
    return item.cohort === selectedCohort;
  });

  const columns: Column<RenewalRecord>[] = [
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono font-bold text-vnpt">
          {item.transactionCode}
        </span>
      ),
    },
    {
      header: "Mã thuê bao",
      accessorKey: "subscriberCode",
      cell: (item) => (
        <span className="font-mono text-slate-700">{item.subscriberCode}</span>
      ),
    },
    {
      header: "Khách hàng & Địa chỉ",
      accessorKey: "customerName",
      cell: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.customerName}</div>
          <div className="text-[11px] text-slate-400">
            {item.installationAddress}
          </div>
        </div>
      ),
    },
    {
      header: "Kỳ báo cáo",
      accessorKey: "cohort",
      cell: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
          {item.cohort}
        </span>
      ),
    },
    {
      header: "Số tiền",
      accessorKey: "termAmount",
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {item.termAmount.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Kỳ hạn",
      accessorKey: "durationMonths",
      cell: (item) => <span>{item.durationMonths} tháng</span>,
    },
    {
      header: "Nhân viên chăm",
      accessorKey: "staffName",
    },
    {
      header: "Hết hạn",
      accessorKey: "expiryDate",
      cell: (item) => (
        <span className="text-slate-700">{item.expiryDate || "—"}</span>
      ),
    },
    {
      header: "Gia hạn ngày",
      accessorKey: "renewedAt",
      cell: (item) => (
        <span className={item.renewedAt ? "font-semibold text-emerald-700" : "text-slate-400"}>
          {item.renewedAt || "—"}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => (
        <div className="flex flex-col gap-1">
          <StatusSelect
            value={item.status}
            options={RENEWAL_STATUS_OPTIONS}
            onChange={(next) => handleStatusChange(item, next)}
          />
          {item.failureReason && (
            <span className="text-[10px] text-rose-500 font-medium">
              Lý do: {item.failureReason}
            </span>
          )}
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            header: "",
            cell: (item: RenewalRecord) => (
              <button
                onClick={() => openDateEdit(item)}
                title="Sửa ngày hết hạn / gia hạn"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-vnpt"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            ),
          } as Column<RenewalRecord>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Gia hạn trả trước dịch vụ
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi riêng 2 file Tháng T và Tháng T-1 theo chuẩn Sheet &apos;GIA HẠN&apos;
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelected(file);
                }
                e.target.value = "";
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="btn-label">
                {importing ? "Đang import..." : "Import file gia hạn"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="GIA HẠN THÁNG T"
          value="57.0%"
          subtitle="684 / 1.200 giao dịch hoàn thành"
          icon={RotateCw}
          badge="Tháng T"
        />
        <KpiCard
          title="GIA HẠN THÁNG T-1"
          value="65.0%"
          subtitle="780 / 1.200 giao dịch hoàn thành"
          icon={CheckCircle}
          badge="Tháng T-1"
        />
        <KpiCard
          title="KHÁCH HẸN THANH TOÁN"
          value="142"
          subtitle="Cần liên hệ lại đôn đốc"
          icon={Clock}
        />
        <KpiCard
          title="THẤT BẠI / TẠM NGƯNG"
          value="38"
          subtitle="Cần phương án chăm sóc giữ chân"
          icon={AlertTriangle}
        />
      </div>

      {/* Cohort selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedCohort("ALL")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "ALL"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tất cả kỳ gia hạn
        </button>
        <button
          onClick={() => setSelectedCohort("THÁNG T")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "THÁNG T"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Gia hạn Tháng T (10/2026)
        </button>
        <button
          onClick={() => setSelectedCohort("THÁNG T-1")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "THÁNG T-1"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Gia hạn Tháng T-1 (09/2026)
        </button>
        <button
          onClick={() => setSelectedCohort("KPI")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "KPI"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          % thực hiện theo nhân viên
        </button>
      </div>

      {/* Data Table */}
      {selectedCohort === "KPI" ? (
        <StaffKpiTable kpiKeys={["ghtt_t", "ghtt_t1"]} />
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu gia hạn
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu gia hạn...
        </div>
      ) : (
        <DataTable
          title="Danh sách giao dịch gia hạn trả trước"
          subtitle="Quản lý chống trùng mã giao dịch theo từng thuê bao"
          columns={columns}
          data={filteredData}
          filters={[
            ...(isAdmin
              ? [
                  {
                    id: "staffName",
                    label: "nhân viên",
                    getValue: (row: RenewalRecord) => row.staffName,
                  },
                ]
              : []),
            {
              id: "status",
              label: "trạng thái",
              getValue: (row: RenewalRecord) => row.status,
            },
          ]}
          searchPlaceholder="Tìm mã giao dịch, mã thuê bao, khách hàng..."
          exportFileName="vnpt_gia_han"
        />
      )}

      {/* Modal sửa ngày hết hạn / gia hạn (Admin) */}
      {dateEditTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Sửa ngày hết hạn / gia hạn
              </h3>
              <button
                onClick={() => setDateEditTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              {dateEditTarget.transactionCode} — {dateEditTarget.customerName}
            </p>

            <form onSubmit={handleSaveDates} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={dateForm.expiryDate}
                  onChange={(e) =>
                    setDateForm({ ...dateForm, expiryDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Ngày gia hạn thành công
                </label>
                <input
                  type="date"
                  value={dateForm.renewedAt}
                  onChange={(e) =>
                    setDateForm({ ...dateForm, renewedAt: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {dateError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {dateError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDateEditTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingDates}
                  className="rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {savingDates ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

