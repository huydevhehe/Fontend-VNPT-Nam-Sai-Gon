"use client";

import { useState } from "react";
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { initialTaskData } from "@/lib/crm/mock-data/crm-data";
import { TaskRecord } from "@/lib/crm/types/crm.types";

export default function TasksPage() {
  const [data, setData] = useState<TaskRecord[]>(initialTaskData);

  const columns: Column<TaskRecord>[] = [
    {
      header: "Tên công việc",
      accessorKey: "title",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.title}</div>
          {item.notes && (
            <div className="text-[11px] text-slate-400">{item.notes}</div>
          )}
        </div>
      ),
    },
    {
      header: "Khách hàng / Đối tượng liên quan",
      accessorKey: "relatedTarget",
      cell: (item) => (
        <span className="font-semibold text-vnpt">{item.relatedTarget}</span>
      ),
    },
    {
      header: "Người xử lý",
      accessorKey: "assignee",
    },
    {
      header: "Hạn hoàn thành",
      accessorKey: "dueDate",
      cell: (item) => (
        <span className="font-mono text-slate-700 font-semibold">{item.dueDate}</span>
      ),
    },
    {
      header: "Mức ưu tiên",
      accessorKey: "priority",
      cell: (item) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
            item.priority === "Cao"
              ? "bg-rose-100 text-rose-800"
              : item.priority === "Vừa"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.priority}
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
            Công việc & Nhắc việc chăm sóc
          </h2>
          <p className="text-xs text-slate-500">
            Giao nhiệm vụ đôn đốc công nợ, gia hạn trả trước và chăm sóc khách hàng
          </p>
        </div>
        <button
          onClick={() => alert("Giao việc mới")}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <Plus className="h-4 w-4" />
          <span className="btn-label">Giao việc mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="CÔNG VIỆC MỚI"
          value="42"
          subtitle="Chờ tiếp nhận xử lý"
          icon={CheckSquare}
        />
        <KpiCard
          title="ĐANG THỰC HIỆN"
          value="68"
          subtitle="Đang bám sát khách hàng"
          icon={Clock}
        />
        <KpiCard
          title="SẮP ĐẾN HẠN (2 NGÀY)"
          value="17"
          subtitle="Cần tập trung đôn đốc"
          icon={AlertTriangle}
        />
        <KpiCard
          title="ĐÃ HOÀN TẤT"
          value="156"
          subtitle="Trong tháng báo cáo"
          icon={CheckCircle2}
        />
      </div>

      {/* Table */}
      <DataTable
        title="Danh sách nhiệm vụ & lịch xử lý"
        subtitle="Hiển thị theo thứ tự ưu tiên và hạn xử lý của từng nhân viên"
        columns={columns}
        data={data}
        searchPlaceholder="Tìm theo tên công việc, khách hàng, người xử lý..."
        exportFileName="vnpt_cong_viec"
      />
    </div>
  );
}

