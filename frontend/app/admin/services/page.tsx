"use client";

import { useState } from "react";
import { BellRing, CheckSquare, Settings2, Clock, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialServiceData } from "@/lib/crm/mock-data/crm-data";
import { ServiceRecord } from "@/lib/crm/types/crm.types";

export default function ServicesPage() {
  const [data, setData] = useState<ServiceRecord[]>(initialServiceData);

  const columns: Column<ServiceRecord>[] = [
    {
      header: "Khách hàng",
      accessorKey: "customerName",
      cell: (item) => (
        <span className="font-bold text-slate-900">{item.customerName}</span>
      ),
    },
    {
      header: "Tên dịch vụ",
      accessorKey: "serviceName",
      cell: (item) => (
        <span className="font-medium text-slate-800">{item.serviceName}</span>
      ),
    },
    {
      header: "Mã thuê bao / Dịch vụ",
      accessorKey: "serviceCode",
      cell: (item) => (
        <span className="font-mono text-blue-700 font-semibold">
          {item.serviceCode}
        </span>
      ),
    },
    {
      header: "Ngày bắt đầu",
      accessorKey: "startDate",
    },
    {
      header: "Ngày hết hạn",
      accessorKey: "expirationDate",
      cell: (item) => (
        <span
          className={`font-bold ${
            item.isExpired ? "text-rose-600" : "text-amber-700"
          }`}
        >
          {item.expirationDate}
        </span>
      ),
    },
    {
      header: "Cảnh báo hạn",
      accessorKey: "daysRemaining",
      cell: (item) => {
        if (item.isExpired) {
          return <StatusBadge status="Đã hết hạn" variant="red" />;
        }
        return (
          <StatusBadge
            status={`Còn ${item.daysRemaining} ngày`}
            variant={item.daysRemaining <= 7 ? "red" : "amber"}
          />
        );
      },
    },
    {
      header: "Nhân viên chăm",
      accessorKey: "staffName",
    },
    {
      header: "Hành động",
      cell: (item) => (
        <button
          onClick={() =>
            alert(`Đã tạo nhiệm vụ chăm sóc tự động cho ${item.customerName}`)
          }
          className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
        >
          <CheckSquare className="h-3 w-3" />
          <span>Tạo việc</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Dịch vụ & Cảnh báo hết hạn
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi thuê bao sắp hết hạn, tự động kích hoạt email cảnh báo nhân viên & CC Admin
          </p>
        </div>
        <button
          onClick={() => alert("Cấu hình mốc cảnh báo theo từng dịch vụ")}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Settings2 className="h-4 w-4" />
          <span>Cấu hình mốc cảnh báo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="DỊCH VỤ ĐANG DÙNG"
          value="2.816"
          subtitle="Trên tập khách hàng quản lý"
          icon={BellRing}
        />
        <KpiCard
          title="SẮP HẾT HẠN (30 NGÀY)"
          value="38"
          subtitle="Cần liên hệ gia hạn ngay"
          icon={Clock}
        />
        <KpiCard
          title="ĐÃ HẾT HẠN"
          value="12"
          subtitle="Chưa ghi nhận hoàn tất gia hạn"
          icon={AlertTriangle}
        />
        <KpiCard
          title="EMAIL CẢNH BÁO ĐÃ GỬI"
          value="42"
          subtitle="Gửi nhân viên & CC Admin"
          icon={CheckSquare}
        />
      </div>

      {/* Table */}
      <DataTable
        title="Danh sách dịch vụ cần theo dõi"
        subtitle="Hiển thị số ngày còn lại và cho phép tạo việc chăm sóc tức thì"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo tên dịch vụ, khách hàng, mã thuê bao..."
        exportFileName="vnpt_dich_vu_canh_bao"
      />
    </div>
  );
}

