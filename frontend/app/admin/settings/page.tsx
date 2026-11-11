"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Eye, AlertTriangle } from "lucide-react";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import { TableFilter } from "@/lib/table-filters";
import { getAuditLogs } from "@/lib/api/reports.api";
import { AuditLogRecord } from "@/lib/crm/types/crm.types";

export default function SettingsPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAuditLogs() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAuditLogs();
        if (isMounted) {
          setLogs(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Nhật ký hệ thống. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAuditLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: Column<AuditLogRecord>[] = [
    {
      header: "Thời gian",
      accessorKey: "timestamp",
      cell: (item) => (
        <span className="font-mono text-slate-600 font-medium">
          {item.timestamp}
        </span>
      ),
    },
    {
      header: "Người dùng thao tác",
      accessorKey: "user",
      cell: (item) => (
        <span className="font-bold text-slate-900">{item.user}</span>
      ),
    },
    {
      header: "Hành động",
      accessorKey: "action",
      cell: (item) => (
        <span className="font-semibold text-blue-700">{item.action}</span>
      ),
    },
    {
      header: "Chi tiết thay đổi",
      accessorKey: "details",
      cell: (item) => <span className="text-slate-600">{item.details}</span>,
    },
  ];

  const logFilters: TableFilter<AuditLogRecord>[] = [
    {
      id: "user",
      label: "Người dùng thao tác",
      getValue: (r) => r.user,
    },
    {
      id: "action",
      label: "Hành động",
      getValue: (r) => r.action,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Tài khoản, Phân quyền & Nhật ký hệ thống (Audit Log)
        </h2>
        <p className="text-xs text-slate-500">
          Cấu hình 4 nhóm vai trò chuẩn theo PRD V2 và lưu vết toàn bộ thay đổi dữ liệu quan trọng
        </p>
      </div>

      {/* 4 Role Permissions Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Quản trị viên (Admin)</h3>
            </div>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              Toàn quyền
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Xem toàn bộ dữ liệu đơn vị Nam Sài Gòn, quản lý nhân viên, menu hoa hồng, cấu hình chỉ tiêu và điều chuyển khách hàng.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">AM / AM Bán chăm</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Dữ liệu được giao
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Chỉ được xem và xử lý các tập khách hàng, danh sách nợ, gia hạn và nhiệm vụ được phân công. Không xem menu Hoa hồng.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">Người xem (Viewer)</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              Chỉ xem Dashboard
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Chỉ có quyền xem Dashboard tổng quan các chỉ số KPI, không xem danh sách chi tiết hoặc chỉnh sửa bất kỳ dữ liệu nào.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Nhật ký hệ thống
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Nhật ký hệ thống...
        </div>
      ) : (
        <DataTable
          title="Nhật ký thao tác hệ thống (Audit Log)"
          subtitle="Lưu vết người thực hiện, thời điểm và giá trị trước/sau cho mọi biến động quan trọng"
          columns={columns}
          data={logs}
          filters={logFilters}
          searchPlaceholder="Tìm theo người dùng, hành động..."
          exportFileName="vnpt_audit_log"
        />
      )}
    </div>
  );
}

