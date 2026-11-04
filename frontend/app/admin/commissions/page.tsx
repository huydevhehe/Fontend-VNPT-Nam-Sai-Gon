"use client";

import { useState } from "react";
import { Percent, ShieldAlert, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialCommissionData } from "@/lib/crm/mock-data/crm-data";
import { CommissionRecord } from "@/lib/crm/types/crm.types";

export default function CommissionsPage() {
  const [data, setData] = useState<CommissionRecord[]>(initialCommissionData);

  const columns: Column<CommissionRecord>[] = [
    {
      header: "Đối tượng thụ hưởng",
      accessorKey: "recipientName",
      cell: (item) => (
        <span className="font-bold text-slate-900">{item.recipientName}</span>
      ),
    },
    {
      header: "Loại hoa hồng",
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
      header: "Hợp đồng / Mã GD",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono text-slate-700 font-semibold">
          {item.transactionCode}
        </span>
      ),
    },
    {
      header: "Số tiền hoa hồng",
      accessorKey: "amount",
      cell: (item) => (
        <span className="font-bold text-slate-900">
          {item.amount.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Ngày ghi nhận",
      accessorKey: "date",
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
      <DataTable
        title="Bảng đối soát hoa hồng"
        subtitle="Chi tiết từng giao dịch nhận từ Sales và lệnh chi cho đối tác"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo đối tượng thụ hưởng, mã giao dịch..."
        exportFileName="vnpt_hoa_hong"
      />
    </div>
  );
}

