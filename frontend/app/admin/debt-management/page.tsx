"use client";

import { useState } from "react";
import { Receipt, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialDebtData } from "@/lib/crm/mock-data/crm-data";
import { DebtRecord } from "@/lib/crm/types/crm.types";

export default function DebtManagementPage() {
  const [data, setData] = useState<DebtRecord[]>(initialDebtData);
  const [activeTab, setActiveTab] = useState<"all" | "immediate" | "cumulative">("all");

  const filteredByTab = data.filter((item) => {
    if (activeTab === "immediate") return item.immediateDebt > 0;
    if (activeTab === "cumulative") return item.cumulativeDebt > 0;
    return true;
  });

  const columns: Column<DebtRecord>[] = [
    {
      header: "Mã thuê bao",
      accessorKey: "subscriberCode",
      cell: (item) => (
        <span className="font-mono font-bold text-blue-700">
          {item.subscriberCode}
        </span>
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
      header: "Nhóm dịch vụ",
      accessorKey: "serviceGroup",
    },
    {
      header: "Mã thanh toán",
      accessorKey: "paymentCode",
      cell: (item) => (
        <span className="font-mono text-slate-600">{item.paymentCode}</span>
      ),
    },
    {
      header: "Còn nợ thu ngay",
      accessorKey: "immediateDebt",
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {item.immediateDebt.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Còn nợ lũy kế",
      accessorKey: "cumulativeDebt",
      cell: (item) => (
        <span className="font-semibold text-rose-600">
          {item.cumulativeDebt.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Nhân viên chăm",
      accessorKey: "staffName",
      cell: (item) => (
        <span className="font-medium text-slate-700">{item.staffName}</span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Quản lý công nợ thu ngay & nợ lũy kế
          </h2>
          <p className="text-xs text-slate-500">
            Khớp chuẩn 8 cột Sheet &apos;THU NGAY , LŨY KẾ&apos; từ file mẫu import+CSKH.xlsx
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("Chức năng Import file Excel nợ sẽ kết nối Backend")}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-[#0072bc] px-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#0b5ca8]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import file nợ</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TỶ LỆ THU NGAY"
          value="98.0%"
          subtitle="Tổng đã thu / Tổng phải thu"
          icon={Receipt}
          badge="Tháng T"
        />
        <KpiCard
          title="TỶ LỆ THU LŨY KẾ"
          value="78.0%"
          subtitle="Tổng đã thu / Phải thu lũy kế"
          icon={CheckCircle2}
        />
        <KpiCard
          title="NỢ THU NGAY CÒN LẠI"
          value="128,6 tr ₫"
          subtitle="Cần theo dõi đôn đốc"
          icon={AlertCircle}
        />
        <KpiCard
          title="TỔNG NỢ LŨY KẾ"
          value="482,3 tr ₫"
          subtitle="Dồn qua các kỳ trước"
          icon={AlertCircle}
        />
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "all"
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tất cả công nợ
        </button>
        <button
          onClick={() => setActiveTab("immediate")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "immediate"
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Nợ thu ngay
        </button>
        <button
          onClick={() => setActiveTab("cumulative")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "cumulative"
              ? "bg-[#0072bc] text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Nợ lũy kế
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        title="Danh sách công nợ theo thuê bao"
        subtitle="Dữ liệu chi tiết từng mã thanh toán và tình trạng gạch nợ"
        columns={columns}
        data={filteredByTab}
        searchPlaceholder="Tìm mã thuê bao, tên KH, nhân viên..."
        exportFileName="vnpt_cong_no"
      />
    </div>
  );
}

