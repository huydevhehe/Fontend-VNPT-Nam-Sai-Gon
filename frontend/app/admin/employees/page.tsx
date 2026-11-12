"use client";

import { useEffect, useState, FormEvent } from "react";
import { UserCheck, UserPlus, Mail, Award, TrendingUp, Users, AlertTriangle, X, KeyRound, Phone } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { TableFilter } from "@/lib/table-filters";
import { getStaff, createStaff } from "@/lib/api/staff.api";
import { getTerritories } from "@/lib/api/territories.api";
import { StaffRecord, StaffType, TerritoryRecord } from "@/lib/crm/types/crm.types";

const ROLE_OPTIONS: StaffRecord["role"][] = ["AM", "AM Bán chăm", "Admin"];
const STAFF_TYPE_OPTIONS: StaffType[] = ["Chính thức", "Cộng tác viên"];

function deriveShortNameClient(fullName: string): string {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  const last = words[words.length - 1];
  return last
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
}

interface StaffFormState {
  code: string;
  name: string;
  staffType: StaffType;
  hrmCode: string;
  role: StaffRecord["role"];
  territory: string;
  email: string;
  phone: string;
  birthDate: string;
  personalEmail: string;
  shortName: string;
  note: string;
  password: string;
  confirmPassword: string;
  mustChangePassword: boolean;
}

const EMPTY_FORM: StaffFormState = {
  code: "",
  name: "",
  staffType: STAFF_TYPE_OPTIONS[0],
  hrmCode: "",
  role: ROLE_OPTIONS[0],
  territory: "",
  email: "",
  phone: "",
  birthDate: "",
  personalEmail: "",
  shortName: "",
  note: "",
  password: "",
  confirmPassword: "",
  mustChangePassword: true,
};

export default function EmployeesPage() {
  const [data, setData] = useState<StaffRecord[]>([]);
  const [territories, setTerritories] = useState<TerritoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [staffRes, territoriesRes] = await Promise.allSettled([
          getStaff(),
          getTerritories(),
        ]);
        if (isMounted) {
          if (staffRes.status === "fulfilled") setData(staffRes.value);
          if (territoriesRes.status === "fulfilled") setTerritories(territoriesRes.value);
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

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (form.password.length < 8 || form.password.length > 72) {
      setFormError("Mật khẩu phải từ 8 đến 72 ký tự");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError("Mật khẩu nhập lại không khớp");
      return;
    }

    setSubmitting(true);

    try {
      const created = await createStaff({
        code: form.code.trim(),
        name: form.name.trim(),
        staffType: form.staffType,
        hrmCode: form.hrmCode.trim() || undefined,
        role: form.role,
        territory: form.territory.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        birthDate: form.birthDate.trim() || undefined,
        personalEmail: form.personalEmail.trim() || undefined,
        shortName: form.shortName.trim() || undefined,
        note: form.note.trim() || undefined,
        password: form.password,
        mustChangePassword: form.mustChangePassword,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
      setCreatedUsername(created.code);
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
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {item.email && (
                <span className="flex items-center gap-0.5">
                  <Mail className="h-3 w-3" />
                  <span>{item.email}</span>
                </span>
              )}
              {item.phone && (
                <span className="flex items-center gap-0.5 font-mono text-slate-500">
                  <Phone className="h-3 w-3" />
                  <span>{item.phone}</span>
                </span>
              )}
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
      header: "Loại",
      accessorKey: "staffType",
      cell: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {item.staffType || "Chính thức"}
        </span>
      ),
    },
    {
      header: "Mã HRM",
      accessorKey: "hrmCode",
      cell: (item) => (
        <span className="font-mono text-xs text-slate-600">
          {item.hrmCode || "—"}
        </span>
      ),
    },
    {
      header: "Vai trò",
      accessorKey: "role",
      cell: (item) => <StatusBadge status={item.role} />,
    },
    {
      header: "Địa bàn phụ trách",
      accessorKey: "territory",
      cell: (item) => <span className="font-semibold text-vnpt">{item.territory || "—"}</span>,
    },
    {
      header: "Khách được giao",
      accessorKey: "assignedCustomers",
      cell: (item) => <span className="font-bold">{item.assignedCustomers ?? 0}</span>,
    },
    {
      header: "Lead tháng",
      accessorKey: "monthlyLeads",
      cell: (item) => <span>{item.monthlyLeads ?? 0}</span>,
    },
    {
      header: "Hợp đồng",
      accessorKey: "monthlyContracts",
      cell: (item) => <span className="font-bold text-emerald-600">{item.monthlyContracts ?? 0}</span>,
    },
    {
      header: "Doanh thu thực hiện",
      accessorKey: "revenueExecuted",
      cell: (item) => (
        <span className="font-bold text-slate-900">
          {(item.revenueExecuted ?? 0).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
  ];

  const staffFilters: TableFilter<StaffRecord>[] = [
    {
      id: "role",
      label: "Vai trò",
      getValue: (r) => r.role,
    },
    {
      id: "staffType",
      label: "Loại",
      getValue: (r) => r.staffType || "Chính thức",
    },
    {
      id: "status",
      label: "Trạng thái",
      getValue: (r) => r.status,
    },
    {
      id: "territory",
      label: "Phường",
      getValue: (r) => r.territory || "—",
    },
  ];

  const derivedShortName = deriveShortNameClient(form.name);

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
          value={String(data.length)}
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
          filters={staffFilters}
          searchPlaceholder="Tìm theo tên nhân viên, mã NV, SĐT, địa bàn..."
          exportFileName="vnpt_nhan_vien"
        />
      )}

      {/* Create Staff Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl my-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Thêm nhân viên</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* KHỐI 1: Thông tin nhân viên */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  1. Thông tin nhân viên
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Mã nhân viên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="VD: NV009"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Họ tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="VD: Nguyễn Văn An"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Loại nhân viên
                    </label>
                    <select
                      value={form.staffType}
                      onChange={(e) =>
                        setForm({ ...form, staffType: e.target.value as StaffType })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    >
                      {STAFF_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Mã HRM
                    </label>
                    <input
                      placeholder="VD: HRM12345"
                      value={form.hrmCode}
                      onChange={(e) => setForm({ ...form, hrmCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Vai trò <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value as StaffRecord["role"] })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Phường phụ trách
                    </label>
                    {territories.length > 0 ? (
                      <select
                        value={form.territory}
                        onChange={(e) => setForm({ ...form, territory: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                      >
                        <option value="">— Chưa gắn địa bàn —</option>
                        {territories.map((t) => (
                          <option key={t.id} value={t.wardName}>
                            {t.wardName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        placeholder="VD: Phường Tân Phong"
                        value={form.territory}
                        onChange={(e) => setForm({ ...form, territory: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Email VNPT
                    </label>
                    <input
                      type="email"
                      placeholder="VD: an.nv@vnpt.vn"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Số điện thoại
                    </label>
                    <input
                      placeholder="VD: 0912345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Gmail cá nhân
                    </label>
                    <input
                      type="email"
                      placeholder="VD: an.nguyen@gmail.com"
                      value={form.personalEmail}
                      onChange={(e) => setForm({ ...form, personalEmail: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tên viết tắt (để trống tự sinh từ họ tên)
                  </label>
                  <input
                    placeholder={derivedShortName ? `Gợi ý: ${derivedShortName}` : "VD: AN"}
                    value={form.shortName}
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Ghi chú
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về nhân sự..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              {/* KHỐI 2: Tài khoản đăng nhập */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-vnpt">
                  2. Tài khoản đăng nhập
                </h4>

                <div className="rounded-lg bg-white border border-blue-100 p-2.5 text-xs text-slate-700 flex items-center justify-between">
                  <span className="font-medium text-slate-500">Tên đăng nhập (cố định theo Mã NV):</span>
                  <span className="font-mono font-bold text-vnpt">
                    {form.code.trim() || "(nhập mã nhân viên ở trên)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Mật khẩu <span className="text-rose-500">*</span> (8–72 ký tự)
                    </label>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      placeholder="Mật khẩu ban đầu"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Nhập lại mật khẩu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      placeholder="Nhập lại chính xác"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="mustChangePassword"
                    checked={form.mustChangePassword}
                    onChange={(e) =>
                      setForm({ ...form, mustChangePassword: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-vnpt focus:ring-vnpt"
                  />
                  <label
                    htmlFor="mustChangePassword"
                    className="text-xs font-medium text-slate-700 select-none cursor-pointer"
                  >
                    Bắt đổi mật khẩu ở lần đăng nhập đầu
                  </label>
                </div>
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
                  className="btn-label rounded-xl bg-vnpt px-4 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submitting ? "Đang tạo..." : "Tạo nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hộp thông báo đã tạo tài khoản thành công */}
      {createdUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Đã tạo tài khoản nhân viên</h3>
            </div>
            <p className="text-xs text-slate-600">
              Đã tạo tài khoản đăng nhập thành công cho nhân viên mới. Mật khẩu được bảo mật theo giá trị Admin đã thiết lập.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm flex items-center justify-between">
              <span className="text-slate-500">Tên đăng nhập:</span>
              <span className="font-mono font-bold text-vnpt text-base">
                {createdUsername}
              </span>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedUsername(null)}
                className="btn-label rounded-xl bg-vnpt px-4 py-2 text-white hover:bg-vnpt-dark"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


