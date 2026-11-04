"use client";

import { useEffect, useState, FormEvent } from "react";
import { UserCheck, UserPlus, Mail, Award, TrendingUp, Users, AlertTriangle, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { getStaff, createStaff } from "@/lib/api/staff.api";
import { StaffRecord } from "@/lib/crm/types/crm.types";

const ROLE_OPTIONS: StaffRecord["role"][] = ["AM", "AM Bán chăm", "Admin"];

interface StaffFormState {
  code: string;
  name: string;
  role: StaffRecord["role"];
  territory: string;
  email: string;
}

const EMPTY_FORM: StaffFormState = {
  code: "",
  name: "",
  role: ROLE_OPTIONS[0],
  territory: "",
  email: "",
};

export default function EmployeesPage() {
  const [data, setData] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStaff() {
      setLoading(true);
      setError(null);
      try {
        const staff = await getStaff();
        if (isMounted) {
          setData(staff);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Nhân viên. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStaff();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createStaff({
        code: form.code,
        name: form.name,
        role: form.role,
        territory: form.territory,
        email: form.email,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo Nhân viên. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

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
          onClick={() => {
            setFormError(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
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
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Nhân viên
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Nhân viên...
        </div>
      ) : (
        <DataTable
          title="Danh sách nhân viên & Chỉ tiêu"
          subtitle="Chi tiết tỷ lệ hoàn thành thu nợ, gia hạn và doanh thu từng nhân viên"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo tên nhân viên, mã NV, địa bàn..."
          exportFileName="vnpt_nhan_vien"
        />
      )}

      {/* Create Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Thêm nhân viên</h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mã nhân viên
                </label>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Họ tên
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Vai trò
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value as StaffRecord["role"] })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Địa bàn phụ trách
                  </label>
                  <input
                    required
                    value={form.territory}
                    onChange={(e) => setForm({ ...form, territory: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submitting ? "Đang tạo..." : "Tạo nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

