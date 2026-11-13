"use client";

import { useEffect, useState, FormEvent } from "react";
import { UserCheck, UserPlus, Mail, Award, TrendingUp, Users, AlertTriangle, X, KeyRound, Phone, Pencil, PauseCircle, Ban, RotateCcw, Info } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { TableFilter } from "@/lib/table-filters";
import { getStaff, createStaff, updateStaff, resetStaffPassword, changeStaffStatus, getStaffReferences } from "@/lib/api/staff.api";
import { getTerritories } from "@/lib/api/territories.api";
import { StaffRecord, StaffType, TerritoryRecord } from "@/lib/crm/types/crm.types";

const ROLE_OPTIONS: StaffRecord["role"][] = ["AM", "AM Bán chăm", "Admin"];
const STAFF_TYPE_OPTIONS: StaffType[] = ["Chính thức", "Cộng tác viên"];

function currentMonthVnClient(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

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
  const [revenueMonth, setRevenueMonth] = useState(currentMonthVnClient);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StaffFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);

  // Modal Sửa nhân viên
  const [editingStaff, setEditingStaff] = useState<StaffRecord | null>(null);
  const [editForm, setEditForm] = useState<{
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
  }>({
    name: "",
    staffType: "Chính thức",
    hrmCode: "",
    role: "AM",
    territory: "",
    email: "",
    phone: "",
    birthDate: "",
    personalEmail: "",
    shortName: "",
    note: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Modal Đặt lại mật khẩu
  const [resetStaff, setResetStaff] = useState<StaffRecord | null>(null);
  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: "",
    mustChangePassword: true,
  });
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Modal Đổi trạng thái (Đình chỉ / Ngừng hoạt động / Mở lại)
  const [statusStaff, setStatusStaff] = useState<StaffRecord | null>(null);
  const [targetStatus, setTargetStatus] = useState<"Đang hoạt động" | "Đình chỉ" | "Ngừng hoạt động">("Đình chỉ");
  const [statusReason, setStatusReason] = useState("");
  const [statusRefs, setStatusRefs] = useState<Record<string, number> | null>(null);
  const [statusLoadingRefs, setStatusLoadingRefs] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  async function handleOpenStatusModal(
    staff: StaffRecord,
    target: "Đang hoạt động" | "Đình chỉ" | "Ngừng hoạt động"
  ) {
    setStatusStaff(staff);
    setTargetStatus(target);
    setStatusReason("");
    setStatusError(null);
    setStatusRefs(null);

    if (target !== "Đang hoạt động") {
      setStatusLoadingRefs(true);
      try {
        const refs = await getStaffReferences(staff.id);
        setStatusRefs(refs);
      } catch {
        setStatusRefs(null);
      } finally {
        setStatusLoadingRefs(false);
      }
    }
  }

  async function handleStatusSubmit(e: FormEvent) {
    e.preventDefault();
    if (!statusStaff) return;
    setStatusError(null);

    if (targetStatus !== "Đang hoạt động" && !statusReason.trim()) {
      setStatusError("Vui lòng nhập lý do thay đổi trạng thái (tối thiểu 1 ký tự)");
      return;
    }

    setStatusSubmitting(true);
    try {
      const updated = await changeStaffStatus(statusStaff.id, {
        status: targetStatus,
        reason: statusReason.trim() || undefined,
      });
      setData((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      setStatusStaff(null);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : "Không thể thay đổi trạng thái nhân viên");
    } finally {
      setStatusSubmitting(false);
    }
  }

  function handleOpenEdit(staff: StaffRecord) {
    setEditingStaff(staff);
    setEditForm({
      name: staff.name,
      staffType: (staff.staffType as StaffType) || "Chính thức",
      hrmCode: staff.hrmCode || "",
      role: staff.role,
      territory: staff.territory || "",
      email: staff.email || "",
      phone: staff.phone || "",
      birthDate: staff.birthDate || "",
      personalEmail: staff.personalEmail || "",
      shortName: staff.shortName || "",
      note: staff.note || "",
    });
    setEditError(null);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingStaff) return;
    setEditError(null);
    setSavingEdit(true);

    try {
      const updated = await updateStaff(editingStaff.id, {
        name: editForm.name.trim(),
        staffType: editForm.staffType,
        hrmCode: editForm.hrmCode.trim() || undefined,
        role: editForm.role,
        territory: editForm.territory.trim() || undefined,
        email: editForm.email.trim() || undefined,
        phone: editForm.phone.trim() || undefined,
        birthDate: editForm.birthDate.trim() || undefined,
        personalEmail: editForm.personalEmail.trim() || undefined,
        shortName: editForm.shortName.trim() || undefined,
        note: editForm.note.trim() || undefined,
      });

      setData((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
      setEditingStaff(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Không thể cập nhật nhân viên");
    } finally {
      setSavingEdit(false);
    }
  }

  function handleOpenReset(staff: StaffRecord) {
    setResetStaff(staff);
    setResetForm({
      password: "",
      confirmPassword: "",
      mustChangePassword: true,
    });
    setResetError(null);
    setResetSuccess(false);
  }

  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    if (!resetStaff) return;
    setResetError(null);

    if (resetForm.password.length < 8 || resetForm.password.length > 72) {
      setResetError("Mật khẩu phải từ 8 đến 72 ký tự");
      return;
    }
    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError("Mật khẩu xác nhận không khớp");
      return;
    }

    setResetSubmitting(true);
    try {
      await resetStaffPassword(resetStaff.id, {
        password: resetForm.password,
        mustChangePassword: resetForm.mustChangePassword,
      });
      setResetSuccess(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu");
    } finally {
      setResetSubmitting(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [staffRes, territoriesRes] = await Promise.allSettled([
          getStaff({ month: revenueMonth }),
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
  }, [revenueMonth]);

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
      header: "Đã chốt — Tháng",
      cell: (item) => (
        <span className="font-bold text-slate-900">
          {(item.revenue?.closedMonth ?? 0).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Đã chốt — Tổng",
      cell: (item) => (
        <span className="font-semibold text-slate-700">
          {(item.revenue?.closedTotal ?? 0).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Đã thu — Tháng",
      cell: (item) => (
        <span className="font-bold text-emerald-600">
          {(item.revenue?.collectedMonth ?? 0).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Đã thu — Tổng",
      cell: (item) => (
        <span className="font-semibold text-emerald-700">
          {(item.revenue?.collectedTotal ?? 0).toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => {
        const tooltip = [
          item.statusReason ? `Lý do: ${item.statusReason}` : "",
          item.statusChangedBy ? `Người đổi: ${item.statusChangedBy}` : "",
          item.statusChangedAt ? `Thời gian: ${new Date(item.statusChangedAt).toLocaleString("vi-VN")}` : "",
        ].filter(Boolean).join(" • ");
        return <StatusBadge status={item.status} title={tooltip || undefined} />;
      },
    },
    {
      header: "Thao tác",
      cell: (item) => {
        const isActive = item.status === "Đang hoạt động";
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={() => handleOpenEdit(item)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            >
              <Pencil className="h-3 w-3 text-slate-500" />
              <span>Sửa</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenReset(item)}
              className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/60 px-2 py-1 text-xs font-semibold text-vnpt hover:bg-blue-100/70"
            >
              <KeyRound className="h-3 w-3" />
              <span>Đổi mật khẩu</span>
            </button>
            {isActive ? (
              <>
                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(item, "Đình chỉ")}
                  className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/60 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100/70"
                >
                  <PauseCircle className="h-3 w-3" />
                  <span>Đình chỉ</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(item, "Ngừng hoạt động")}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                >
                  <Ban className="h-3 w-3" />
                  <span>Ngừng</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenStatusModal(item, "Đang hoạt động")}
                className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Mở lại</span>
              </button>
            )}
          </div>
        );
      },
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
        <div className="flex items-center gap-2">
          <label htmlFor="revenue-month" className="text-xs font-semibold text-slate-600">
            Tháng doanh thu:
          </label>
          <input
            id="revenue-month"
            type="month"
            value={revenueMonth}
            onChange={(e) => setRevenueMonth(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:border-vnpt focus:outline-none"
          />
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
        <>
          <DataTable
            title="Danh sách nhân viên & Chỉ tiêu"
            subtitle="Chi tiết tỷ lệ hoàn thành thu nợ, gia hạn và doanh thu từng nhân viên"
            columns={columns}
            data={data}
            filters={staffFilters}
            searchPlaceholder="Tìm theo tên nhân viên, mã NV, SĐT, địa bàn..."
            exportFileName="vnpt_nhan_vien"
          />
          <p className="text-[11px] text-slate-400">
            Đã chốt = giá trị đơn hàng; Đã thu = tiền đã ghi nhận thu. Cột &quot;Tháng&quot;
            tính theo tháng đã chọn; cột &quot;Tổng&quot; là lũy kế từ trước tới hết tháng đó.
          </p>
        </>
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

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl my-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sửa thông tin nhân viên</h3>
                <p className="text-xs text-slate-500">
                  Mã nhân viên: <span className="font-mono font-bold text-vnpt">{editingStaff.code}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editingStaff.name !== editForm.name.trim() && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Cảnh báo đổi tên dây chuyền:</p>
                    <p>Đổi tên sẽ cập nhật tên này ở Lead, Đơn hàng, Khách hàng, Công nợ, Gia hạn…</p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      placeholder="VD: Nguyễn Văn An"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Loại nhân viên
                    </label>
                    <select
                      value={editForm.staffType}
                      onChange={(e) =>
                        setEditForm({ ...editForm, staffType: e.target.value as StaffType })
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Mã HRM
                    </label>
                    <input
                      placeholder="VD: HRM-0123"
                      value={editForm.hrmCode}
                      onChange={(e) => setEditForm({ ...editForm, hrmCode: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Vai trò <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) =>
                        setEditForm({ ...editForm, role: e.target.value as StaffRecord["role"] })
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
                        value={editForm.territory}
                        onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
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
                        value={editForm.territory}
                        onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
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
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
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
                      value={editForm.personalEmail}
                      onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tên viết tắt
                  </label>
                  <input
                    placeholder="VD: AN"
                    value={editForm.shortName}
                    onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
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
                    value={editForm.note}
                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              {/* Khối tài khoản trong form sửa: có nút Đặt lại mật khẩu */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-vnpt">
                    Tài khoản đăng nhập
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tên đăng nhập: <span className="font-mono font-bold text-slate-800">{editingStaff.code}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenReset(editingStaff);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-1.5 text-xs font-bold text-vnpt hover:bg-blue-50 shadow-xs"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Đặt lại mật khẩu</span>
                </button>
              </div>

              {editError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-label rounded-xl bg-vnpt px-4 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-vnpt" />
                <h3 className="text-base font-bold text-slate-900">Đặt lại mật khẩu</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetStaff(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
              <div>
                <span className="text-slate-500">Nhân viên: </span>
                <span className="font-semibold text-slate-900">{resetStaff.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Tên đăng nhập: </span>
                <span className="font-mono font-bold text-vnpt">{resetStaff.code}</span>
              </div>
            </div>

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-xs text-emerald-800">
                  <p className="font-bold text-sm">Đặt lại mật khẩu thành công!</p>
                  <p className="mt-1">Nhân viên có thể sử dụng mật khẩu mới để đăng nhập.</p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setResetStaff(null)}
                    className="btn-label rounded-xl bg-vnpt px-4 py-2 text-white hover:bg-vnpt-dark"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mật khẩu mới <span className="text-rose-500">*</span> (8–72 ký tự)
                  </label>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    placeholder="Nhập mật khẩu mới"
                    value={resetForm.password}
                    onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhập lại mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    placeholder="Xác nhận mật khẩu mới"
                    value={resetForm.confirmPassword}
                    onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="resetMustChangePassword"
                    checked={resetForm.mustChangePassword}
                    onChange={(e) =>
                      setResetForm({ ...resetForm, mustChangePassword: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-slate-300 text-vnpt focus:ring-vnpt"
                  />
                  <label
                    htmlFor="resetMustChangePassword"
                    className="text-xs font-medium text-slate-700 select-none cursor-pointer"
                  >
                    Bắt đổi mật khẩu ở lần đăng nhập tiếp theo
                  </label>
                </div>

                {resetError && (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                    {resetError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStaff(null)}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="btn-label rounded-xl bg-vnpt px-4 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                  >
                    {resetSubmitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Đổi trạng thái (Đình chỉ / Ngừng hoạt động / Mở lại) */}
      {statusStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {targetStatus === "Đang hoạt động"
                    ? "Mở lại nhân viên"
                    : targetStatus === "Đình chỉ"
                    ? "Đình chỉ nhân viên"
                    : "Ngừng hoạt động nhân viên"}
                </h3>
                <p className="text-xs text-slate-500">
                  {statusStaff.name} ({statusStaff.code}) — {statusStaff.role}
                </p>
              </div>
              <button
                onClick={() => setStatusStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              {targetStatus !== "Đang hoạt động" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="font-semibold text-amber-950">
                        Lưu ý khi {targetStatus.toLowerCase()}:
                      </p>
                      <p>
                        Tài khoản đăng nhập của nhân viên sẽ bị khóa ngay lập tức và các phiên đăng nhập hiện tại sẽ bị thu hồi.
                      </p>
                      {statusLoadingRefs ? (
                        <p className="text-slate-500 italic">Đang kiểm tra dữ liệu phụ trách...</p>
                      ) : statusRefs && Object.keys(statusRefs).length > 0 ? (
                        <div className="mt-2 rounded-lg bg-white/80 p-2.5 border border-amber-200/60">
                          <p className="font-medium text-amber-900 mb-1">
                            Nhân viên hiện đang phụ trách:
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                            {Object.entries(statusRefs).map(([k, v]) => (
                              <li key={k}>
                                <span className="font-medium">{k}</span>: {v} bản ghi
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1.5 text-[11px] text-slate-600 italic">
                            Dữ liệu cũ được giữ nguyên; nên chuyển khách hàng sang người khác bằng chức năng điều chuyển.
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-600">
                          Nhân viên hiện không phụ trách trực tiếp bản ghi nào.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {targetStatus === "Đang hoạt động" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <p>
                      Mở lại tài khoản sẽ khôi phục quyền đăng nhập và nhân viên sẽ xuất hiện trở lại trong danh sách phân công.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  {targetStatus === "Đang hoạt động" ? (
                    "Lý do mở lại (tùy chọn)"
                  ) : (
                    <>
                      Lý do {targetStatus.toLowerCase()} <span className="text-rose-500">*</span>
                    </>
                  )}
                </label>
                <textarea
                  required={targetStatus !== "Đang hoạt động"}
                  rows={3}
                  maxLength={500}
                  placeholder={
                    targetStatus === "Đang hoạt động"
                      ? "Nhập ghi chú lý do mở lại nếu có..."
                      : "Nhập lý do chi tiết (bắt buộc, tối đa 500 ký tự)..."
                  }
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                />
              </div>

              {statusError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {statusError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusStaff(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={statusSubmitting}
                  className={`btn-label rounded-xl px-4 py-2 text-white font-bold disabled:opacity-60 ${
                    targetStatus === "Đang hoạt động"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : targetStatus === "Đình chỉ"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {statusSubmitting
                    ? "Đang xử lý..."
                    : targetStatus === "Đang hoạt động"
                    ? "Xác nhận mở lại"
                    : `Xác nhận ${targetStatus.toLowerCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


