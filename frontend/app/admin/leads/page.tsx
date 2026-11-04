"use client";

import { useState } from "react";
import { Target, UserPlus, PhoneCall, CheckCircle2, TrendingUp } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialLeadData } from "@/lib/crm/mock-data/crm-data";
import { LeadRecord } from "@/lib/crm/types/crm.types";

export default function LeadsPage() {
  const [data, setData] = useState<LeadRecord[]>(initialLeadData);

  const columns: Column<LeadRecord>[] = [
    {
      header: "Khách hàng / Đầu mối",
      accessorKey: "customerName",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.customerName}</div>
          <div className="text-[11px] text-slate-500">{item.demandDescription}</div>
        </div>
      ),
    },
    {
      header: "Số điện thoại",
      accessorKey: "phone",
      cell: (item) => (
        <span className="font-mono font-semibold text-vnpt">{item.phone}</span>
      ),
    },
    {
      header: "Nhóm cơ hội",
      accessorKey: "group",
      cell: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {item.group}
        </span>
      ),
    },
    {
      header: "Kênh phát triển",
      accessorKey: "channel",
      cell: (item) => (
        <span className="font-medium text-slate-600">{item.channel}</span>
      ),
    },
    {
      header: "AM Phụ trách",
      accessorKey: "staffName",
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Giá trị dự kiến",
      accessorKey: "expectedValue",
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {item.expectedValue.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Quản lý Lead & Cơ hội kinh doanh
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi cơ hội từ tiếp nhận đến chốt gói cước và chuyển đổi thành hợp đồng
          </p>
        </div>
        <button
          onClick={() => alert("Mở form tạo Lead")}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <UserPlus className="h-4 w-4" />
          <span className="btn-label">Tạo Lead mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="LEAD ĐƯỢC GIAO"
          value="320"
          subtitle="Trong kỳ tháng T"
          icon={Target}
        />
        <KpiCard
          title="ĐÃ LIÊN HỆ"
          value="278"
          subtitle="Tỷ lệ tiếp cận: 86.9%"
          icon={PhoneCall}
        />
        <KpiCard
          title="CHỐT THÀNH CÔNG"
          value="126"
          subtitle="Tỷ lệ chốt: 39.4%"
          icon={CheckCircle2}
        />
        <KpiCard
          title="ĐANG TƯ VẤN"
          value="84"
          subtitle="Đang chăm sóc bám sát"
          icon={TrendingUp}
        />
      </div>

      {/* Table */}
      <DataTable
        title="Danh sách Lead & Cơ hội"
        subtitle="Quản lý phễu khách hàng theo từng kênh và từng AM phụ trách"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo tên Lead, SĐT, kênh phát triển..."
        exportFileName="vnpt_leads"
      />
    </div>
  );
}

