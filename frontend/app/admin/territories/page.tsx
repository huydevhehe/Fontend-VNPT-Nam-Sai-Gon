"use client";

import { useEffect, useState } from "react";
import { MapPin, Building, Users, TrendingUp, Edit3, AlertTriangle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TerritoryRecord } from "@/lib/crm/types/crm.types";
import { getTerritories } from "@/lib/api/territories.api";

export default function TerritoriesPage() {
  const [data, setData] = useState<TerritoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTerritories() {
      setLoading(true);
      setError(null);
      try {
        const territories = await getTerritories();
        if (isMounted) {
          setData(territories);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu địa bàn. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTerritories();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: Column<TerritoryRecord>[] = [
    {
      header: "Phường / Địa bàn",
      accessorKey: "wardName",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-bold text-slate-900">{item.wardName}</span>
        </div>
      ),
    },
    {
      header: "Số khu phố",
      accessorKey: "quarterCount",
      cell: (item) => <span className="font-semibold">{item.quarterCount}</span>,
    },
    {
      header: "Số hộ dân (Cập nhật CRM)",
      accessorKey: "householdCount",
      cell: (item) => (
        <span className="font-bold text-slate-800">
          {item.householdCount.toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      header: "Cơ hội kinh doanh / CĐS",
      accessorKey: "opportunityCount",
      cell: (item) => (
        <span className="font-semibold text-blue-700">{item.opportunityCount}</span>
      ),
    },
    {
      header: "Đã triển khai*",
      accessorKey: "deployedCount",
      cell: (item) => (
        <span className="font-bold text-emerald-600">
          {item.deployedCount} ({Math.round((item.deployedCount / item.opportunityCount) * 100)}%)
        </span>
      ),
    },
    {
      header: "Nhân viên phụ trách",
      accessorKey: "staffName",
    },
    {
      header: "Đầu mối lãnh đạo",
      accessorKey: "leadershipContact",
      cell: (item) => (
        <span className="text-slate-600">{item.leadershipContact}</span>
      ),
    },
    {
      header: "Thao tác",
      cell: () => (
        <button
          onClick={() => alert("Chỉnh sửa số hộ dân / khu phố trực tiếp trên CRM")}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Edit3 className="h-3 w-3" />
          <span>Sửa số hộ</span>
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
            Địa bàn Phường / Khu phố & Cơ hội Chuyển đổi số
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý 7 phường Nam Sài Gòn, số hộ dân cập nhật trực tiếp; *Đã triển khai = Đã ký HĐ và có doanh thu
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="ĐỊA BÀN PHƯỜNG"
          value="7"
          subtitle="Tân Hưng, Tân Thuận, Xóm Chiếu..."
          icon={MapPin}
        />
        <KpiCard
          title="TỔNG KHU PHỐ"
          value="112"
          subtitle="Trực thuộc các phường"
          icon={Building}
        />
        <KpiCard
          title="TỔNG HỘ DÂN"
          value="81.250"
          subtitle="Cập nhật trực tiếp trên CRM"
          icon={Users}
        />
        <KpiCard
          title="CƠ HỘI / ĐÃ TRIỂN KHAI"
          value="211 / 134"
          subtitle="Tỷ lệ phủ: 63.5%"
          icon={TrendingUp}
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu địa bàn
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu địa bàn...
        </div>
      ) : (
        <DataTable
          title="Danh sách địa bàn & đầu mối"
          subtitle="Cho phép cập nhật số hộ dân, thông tin lãnh đạo phường và trường học địa bàn"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo tên phường, nhân viên, lãnh đạo..."
          exportFileName="vnpt_dia_ban"
        />
      )}
    </div>
  );
}

