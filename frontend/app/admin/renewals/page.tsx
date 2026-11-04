"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCw, UploadCloud, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import {
  RenewalRecord,
  RenewalStatus,
} from "@/lib/crm/types/crm.types";
import {
  getRenewals,
  importRenewalsExcel,
  updateRenewalStatus,
} from "@/lib/api/renewals.api";
import StatusSelect from "@/components/admin/shared/StatusSelect";

const RENEWAL_STATUS_OPTIONS: RenewalStatus[] = [
  "Chưa xử lý",
  "Khách hẹn thanh toán",
  "Hoàn thành",
  "Thất bại",
];

export default function RenewalsPage() {
  const [data, setData] = useState<RenewalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCohort, setSelectedCohort] = useState<"ALL" | "THÁNG T" | "THÁNG T-1">("ALL");

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
      </div>

      {/* Data Table */}
      {error ? (
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
          searchPlaceholder="Tìm mã giao dịch, mã thuê bao, khách hàng..."
          exportFileName="vnpt_gia_han"
        />
      )}
    </div>
  );
}

