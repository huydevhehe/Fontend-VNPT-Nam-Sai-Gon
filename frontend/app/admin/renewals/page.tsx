"use client";

import { useState } from "react";
import { RotateCw, UploadCloud, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialRenewalData } from "@/lib/crm/mock-data/crm-data";
import { RenewalRecord } from "@/lib/crm/types/crm.types";

export default function RenewalsPage() {
  const [data, setData] = useState<RenewalRecord[]>(initialRenewalData);
  const [selectedCohort, setSelectedCohort] = useState<"ALL" | "THÁNG T" | "THÁNG T-1">("ALL");

  const filteredData = data.filter((item) => {
    if (selectedCohort === "ALL") return true;
    return item.cohort === selectedCohort;
  });

  const columns: Column<RenewalRecord>[] = [
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono font-bold text-blue-700">
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
          <StatusBadge status={item.status} />
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
          <button
            onClick={() => alert("Chức năng Import file gia hạn sẽ kết nối Backend")}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0072bc] px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5ca8]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import file gia hạn</span>
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
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tất cả kỳ gia hạn
        </button>
        <button
          onClick={() => setSelectedCohort("THÁNG T")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "THÁNG T"
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Gia hạn Tháng T (10/2026)
        </button>
        <button
          onClick={() => setSelectedCohort("THÁNG T-1")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            selectedCohort === "THÁNG T-1"
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Gia hạn Tháng T-1 (09/2026)
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        title="Danh sách giao dịch gia hạn trả trước"
        subtitle="Quản lý chống trùng mã giao dịch theo từng thuê bao"
        columns={columns}
        data={filteredData}
        searchPlaceholder="Tìm mã giao dịch, mã thuê bao, khách hàng..."
        exportFileName="vnpt_gia_han"
      />
    </div>
  );
}

