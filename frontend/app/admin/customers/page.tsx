"use client";

import { useState } from "react";
import { Users, UserPlus, Building2, User, ShieldAlert } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialCustomerData } from "@/lib/crm/mock-data/crm-data";
import { CustomerRecord } from "@/lib/crm/types/crm.types";

export default function CustomersPage() {
  const [data, setData] = useState<CustomerRecord[]>(initialCustomerData);

  const columns: Column<CustomerRecord>[] = [
    {
      header: "Khách hàng",
      accessorKey: "name",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-bold text-vnpt">
            {item.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="text-[11px] text-slate-400">{item.address}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Mã định danh (MST / CCCD)",
      accessorKey: "identityCode",
      cell: (item) => (
        <span className="font-mono font-semibold text-slate-700">
          {item.identityCode || "—"}
        </span>
      ),
    },
    {
      header: "Loại khách hàng",
      accessorKey: "type",
      cell: (item) => (
        <span className="inline-flex items-center gap-1 text-slate-700">
          {item.type === "Doanh nghiệp" ? (
            <Building2 className="h-3.5 w-3.5 text-blue-600" />
          ) : (
            <User className="h-3.5 w-3.5 text-slate-500" />
          )}
          <span>{item.type}</span>
        </span>
      ),
    },
    {
      header: "Nhóm khách hàng",
      accessorKey: "group",
      cell: (item) => (
        <StatusBadge
          status={item.group}
          variant={item.group === "Tự phát triển" ? "green" : "blue"}
        />
      ),
    },
    {
      header: "Dịch vụ đã đăng ký",
      accessorKey: "services",
      cell: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.services.map((s, i) => (
            <span
              key={i}
              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
            >
              {s}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Hết hạn gần nhất",
      accessorKey: "nearestExpiration",
      cell: (item) => (
        <span className="font-semibold text-amber-700">
          {item.nearestExpiration}
        </span>
      ),
    },
    {
      header: "AM Phụ trách",
      accessorKey: "amStaff",
      cell: (item) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{item.amStaff}</div>
          <div className="text-[10px] text-slate-400">AM Bán chăm</div>
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
            Hồ sơ khách hàng VNPT Nam Sài Gòn
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý khách hàng Tự phát triển (bán mới) và Tập hiện hữu được giao phụ trách
          </p>
        </div>
        <button
          onClick={() => alert("Mở form thêm khách hàng")}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <UserPlus className="h-4 w-4" />
          <span className="btn-label">Thêm khách hàng</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TỔNG KHÁCH HÀNG"
          value="1.284"
          subtitle="Hồ sơ quản lý trên CRM"
          icon={Users}
        />
        <KpiCard
          title="TỰ PHÁT TRIỂN (PTM)"
          value="386"
          subtitle="Bán mới trong các kỳ"
          icon={UserPlus}
        />
        <KpiCard
          title="TẬP HIỆN HỮU ĐƯỢC GIAO"
          value="898"
          subtitle="Giao cho AM & AM Bán chăm"
          icon={Building2}
        />
        <KpiCard
          title="SẮP HẾT HẠN (30 NGÀY)"
          value="38"
          subtitle="Cần liên hệ gia hạn ngay"
          icon={ShieldAlert}
        />
      </div>

      {/* Table */}
      <DataTable
        title="Danh sách hồ sơ khách hàng"
        subtitle="Hỗ trợ lọc theo loại doanh nghiệp, hộ kinh doanh hoặc cá nhân"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo tên, MST, CCCD, địa chỉ..."
        exportFileName="vnpt_khach_hang"
      />
    </div>
  );
}

