"use client";

import { useState } from "react";
import { UserCheck, UserPlus, Mail, Award, TrendingUp, Users } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialStaffData } from "@/lib/crm/mock-data/crm-data";
import { StaffRecord } from "@/lib/crm/types/crm.types";

export default function EmployeesPage() {
  const [data, setData] = useState<StaffRecord[]>(initialStaffData);

  const columns: Column<StaffRecord>[] = [
    {
      header: "Nhân viên",
      accessorKey: "name",
      cell: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-bold text-vnpt">
            {item.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Mail className="h-3 w-3" />
              <span>{item.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Mã NV",
      accessorKey: "code",
      cell: (item) => <span className="font-mono text-slate-600">{item.code}</span>,
    },
    {
      header: "Vai trò",
      accessorKey: "role",
      cell: (item) => <StatusBadge status={item.role} />,
    },
    {
      header: "Địa bàn phụ trách",
      accessorKey: "territory",
      cell: (item) => <span className="font-semibold text-vnpt">{item.territory}</span>,
    },
    {
      header: "Khách được giao",
      accessorKey: "assignedCustomers",
      cell: (item) => <span className="font-bold">{item.assignedCustomers}</span>,
    },
    {
      header: "Lead tháng",
      accessorKey: "monthlyLeads",
    },
    {
      header: "Hợp đồng",
      accessorKey: "monthlyContracts",
      cell: (item) => <span className="font-bold text-emerald-600">{item.monthlyContracts}</span>,
    },
    {
      header: "Doanh thu thực hiện",
      accessorKey: "revenueExecuted",
      cell: (item) => (
        <span className="font-bold text-slate-900">
          {item.revenueExecuted.toLocaleString("vi-VN")} ₫
        </span>
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
            Quản lý nhân viên & Phân công
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý đội ngũ AM, AM Bán chăm và lịch sử bàn giao tập khách hàng
          </p>
        </div>
        <button
          onClick={() => alert("Thêm nhân viên mới")}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <UserPlus className="h-4 w-4" />
          <span className="btn-label">Thêm nhân viên</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TỔNG NHÂN SỰ"
          value="7"
          subtitle="AM & AM Bán chăm địa bàn"
          icon={UserCheck}
        />
        <KpiCard
          title="KHÁCH ĐÃ PHÂN CÔNG"
          value="1.057"
          subtitle="Tập khách hàng hiện hữu & PTM"
          icon={Users}
        />
        <KpiCard
          title="TỔNG HỢP ĐỒNG ĐÃ KÝ"
          value="113"
          subtitle="Trong tháng báo cáo"
          icon={Award}
        />
        <KpiCard
          title="TỔNG DOANH THU THỰC HIỆN"
          value="1,07 tỷ ₫"
          subtitle="Toàn đơn vị Nam Sài Gòn"
          icon={TrendingUp}
        />
      </div>

      {/* Table */}
      <DataTable
        title="Danh sách nhân viên & Chỉ tiêu"
        subtitle="Chi tiết tỷ lệ hoàn thành thu nợ, gia hạn và doanh thu từng nhân viên"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo tên nhân viên, mã NV, địa bàn..."
        exportFileName="vnpt_nhan_vien"
      />
    </div>
  );
}

