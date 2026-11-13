"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import { AlertTriangle, Check, UserRoundCheck, X, UserPlus, KeyRound, Copy, CheckCircle } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { TableFilter } from "@/lib/table-filters";
import {
  approveCtvAccount,
  getCtvAccounts,
  rejectCtvAccount,
  createCtvAccount,
  CreateCtvAccountInput,
} from "@/lib/api/ctv-accounts.api";
import { CtvAccountRecord } from "@/lib/crm/types/crm.types";

const STATUS_FILTERS: { label: string; value: CtvAccountRecord["status"] | "" }[] = [
  { label: "Tất cả", value: "" },
  { label: "Chờ duyệt", value: "Chờ duyệt" },
  { label: "Đang hoạt động", value: "Đang hoạt động" },
  { label: "Từ chối", value: "Từ chối" },
];

function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}

export default function CtvAccountsPage() {
  const [data, setData] = useState<CtvAccountRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CtvAccountRecord["status"] | "">("");

  // Modal Tạo CTV
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    mustChangePassword: true,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState<CtvAccountRecord | null>(null);

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (createForm.password.length < 8 || createForm.password.length > 72) {
      setCreateError("Mật khẩu phải từ 8 đến 72 ký tự");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!/^0\d{9}$/.test(createForm.phone.trim())) {
      setCreateError("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");
      return;
    }

    setCreateSubmitting(true);
    try {
      const created = await createCtvAccount({
        username: createForm.username.trim(),
        name: createForm.name.trim(),
        phone: createForm.phone.trim(),
        email: createForm.email.trim() || undefined,
        password: createForm.password,
        mustChangePassword: createForm.mustChangePassword,
      });

      setData((prev) => [created, ...prev]);
      setCreatedSuccess(created);
      setShowCreateModal(false);
      setCreateForm({
        username: "",
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        mustChangePassword: true,
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Không thể tạo tài khoản CTV");
    } finally {
      setCreateSubmitting(false);
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getCtvAccounts());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách CTV. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecision(id: string, action: "approve" | "reject") {
    setActionError(null);
    setBusyId(id);
    try {
      const updated =
        action === "approve" ? await approveCtvAccount(id) : await rejectCtvAccount(id);
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Không thể cập nhật trạng thái. Vui lòng thử lại."
      );
    } finally {
      setBusyId(null);
    }
  }

  const pendingCount = data.filter((item) => item.status === "Chờ duyệt").length;
  const activeCount = data.filter((item) => item.status === "Đang hoạt động").length;
  const visible = filter ? data.filter((item) => item.status === filter) : data;

  const columns: Column<CtvAccountRecord>[] = [
    {
      header: "Cộng tác viên",
      accessorKey: "name",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.name}</div>
          <div className="text-[11px] text-slate-400">{item.email || "Chưa có email"}</div>
        </div>
      ),
    },
    {
      header: "Tên đăng nhập",
      accessorKey: "username",
      cell: (item) => <span className="font-mono text-slate-600">{item.username}</span>,
    },
    { header: "Số điện thoại", accessorKey: "phone" },
    {
      header: "Mã giới thiệu",
      accessorKey: "referralCode",
      cell: (item) => <span className="font-mono text-slate-600">{item.referralCode}</span>,
    },
    {
      header: "Ngày đăng ký",
      accessorKey: "createdAt",
      cell: (item) => <span className="text-slate-600">{formatDate(item.createdAt)}</span>,
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => (
        <StatusBadge status={item.status} variant={item.status === "Từ chối" ? "red" : undefined} />
      ),
    },
    {
      header: "Thao tác",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          {item.status !== "Đang hoạt động" && (
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => handleDecision(item.id, "approve")}
              className="btn-label flex items-center gap-1 rounded-lg bg-vnpt px-2.5 py-1 text-white hover:bg-vnpt-dark disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Duyệt
            </button>
          )}
          {item.status !== "Từ chối" && (
            <button
              type="button"
              disabled={busyId === item.id}
              onClick={() => handleDecision(item.id, "reject")}
              className="btn-label flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <X className="h-3.5 w-3.5" />
              Từ chối
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Quản lý cộng tác viên</h2>
          <p className="text-xs text-slate-500">
            Quản lý đội ngũ cộng tác viên, duyệt hồ sơ đăng ký và tạo tài khoản hoạt động ngay
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreateError(null);
            setShowCreateModal(true);
          }}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <UserPlus className="h-4 w-4" />
          <span className="btn-label">Tạo CTV</span>
        </button>
      </div>

      {createdSuccess && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-950">
                Tạo tài khoản CTV thành công: {createdSuccess.name} ({createdSuccess.username})
              </p>
              <p className="text-emerald-800">
                Mã giới thiệu: <span className="font-mono font-bold">{createdSuccess.referralCode}</span> • Trạng thái:{" "}
                <span className="font-semibold">{createdSuccess.status}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreatedSuccess(null)}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="CHỜ DUYỆT"
          value={String(pendingCount)}
          subtitle="Đăng ký mới cần xử lý"
          icon={UserRoundCheck}
        />
        <KpiCard
          title="ĐANG HOẠT ĐỘNG"
          value={String(activeCount)}
          subtitle="CTV đã được duyệt"
          icon={Check}
        />
        <KpiCard
          title="TỔNG TÀI KHOẢN CTV"
          value={String(data.length)}
          subtitle="Mọi trạng thái"
          icon={UserRoundCheck}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`btn-label rounded-xl border px-3 py-1.5 ${
              filter === option.value
                ? "border-vnpt bg-vnpt text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {actionError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {actionError}
        </p>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">Không thể tải danh sách CTV</p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải danh sách CTV...
        </div>
      ) : (
        <DataTable
          title="Danh sách tài khoản cộng tác viên"
          subtitle="Mới đăng ký hiển thị trước"
          columns={columns}
          data={visible}
          searchPlaceholder="Tìm theo tên, tên đăng nhập, số điện thoại..."
          exportFileName="vnpt_ctv_accounts"
        />
      )}

      {/* Modal Tạo CTV */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tạo tài khoản Cộng tác viên</h3>
                <p className="text-xs text-slate-500">
                  Tài khoản được duyệt hoạt động ngay và tự động cấp mã giới thiệu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="ctv_nguyenvana"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="0912345678"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="ctv@example.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="Tối thiểu 8 ký tự"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Xác nhận mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createCtvMustChangePassword"
                  checked={createForm.mustChangePassword}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, mustChangePassword: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-vnpt focus:ring-vnpt"
                />
                <label
                  htmlFor="createCtvMustChangePassword"
                  className="text-xs font-medium text-slate-700 select-none cursor-pointer"
                >
                  Bắt đổi mật khẩu ở lần đăng nhập tiếp theo
                </label>
              </div>

              {createError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="btn-label rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {createSubmitting ? "Đang xử lý..." : "Tạo CTV ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
