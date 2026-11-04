"use client";

import { useEffect, useState, FormEvent } from "react";
import { Users, UserPlus, Building2, User, ShieldAlert, AlertTriangle, X, ArrowRightLeft } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { CustomerRecord, CustomerType, CustomerGroup } from "@/lib/crm/types/crm.types";
import { getCustomers, createCustomer, transferCustomer } from "@/lib/api/customers.api";

const TYPE_OPTIONS: CustomerType[] = ["Doanh nghiệp", "Hộ kinh doanh", "Cá nhân"];
const GROUP_OPTIONS: CustomerGroup[] = ["Tự phát triển", "Tập hiện hữu"];

interface CustomerFormState {
  name: string;
  identityCode: string;
  type: CustomerType;
  customerGroup: CustomerGroup;
  phone: string;
  address: string;
  amStaff: string;
}

const EMPTY_FORM: CustomerFormState = {
  name: "",
  identityCode: "",
  type: TYPE_OPTIONS[0],
  customerGroup: GROUP_OPTIONS[0],
  phone: "",
  address: "",
  amStaff: "",
};

export default function CustomersPage() {
  const [data, setData] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CustomerFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [transferTarget, setTransferTarget] = useState<CustomerRecord | null>(null);
  const [transferStaff, setTransferStaff] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      setLoading(true);
      setError(null);
      try {
        const customers = await getCustomers();
        if (isMounted) {
          setData(customers);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu khách hàng. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createCustomer({
        name: form.name,
        identityCode: form.identityCode || undefined,
        type: form.type,
        customerGroup: form.customerGroup,
        phone: form.phone || undefined,
        address: form.address || undefined,
        amStaff: form.amStaff || undefined,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể thêm khách hàng. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openTransfer(customer: CustomerRecord) {
    setTransferTarget(customer);
    setTransferStaff(customer.amStaff);
    setTransferError(null);
  }

  async function handleTransfer(e: FormEvent) {
    e.preventDefault();
    if (!transferTarget) return;

    setTransferError(null);
    setTransferring(true);

    try {
      await transferCustomer(transferTarget.id, transferStaff);
      setData((prev) =>
        prev.map((c) =>
          c.id === transferTarget.id
            ? { ...c, amStaff: transferStaff, amCaringStaff: transferStaff }
            : c
        )
      );
      setTransferTarget(null);
    } catch (err) {
      setTransferError(
        err instanceof Error ? err.message : "Không thể điều chuyển khách hàng. Vui lòng thử lại."
      );
    } finally {
      setTransferring(false);
    }
  }

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
    {
      header: "Thao tác",
      accessorKey: "id",
      cell: (item) => (
        <button
          onClick={() => openTransfer(item)}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ArrowRightLeft className="h-3 w-3" />
          Điều chuyển
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
            Hồ sơ khách hàng VNPT Nam Sài Gòn
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý khách hàng Tự phát triển (bán mới) và Tập hiện hữu được giao phụ trách
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
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu khách hàng
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu khách hàng...
        </div>
      ) : (
        <DataTable
          title="Danh sách hồ sơ khách hàng"
          subtitle="Hỗ trợ lọc theo loại doanh nghiệp, hộ kinh doanh hoặc cá nhân"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo tên, MST, CCCD, địa chỉ..."
          exportFileName="vnpt_khach_hang"
        />
      )}

      {/* Create Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Thêm khách hàng</h3>
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
                  Tên khách hàng
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mã định danh (MST / CCCD)
                </label>
                <input
                  value={form.identityCode}
                  onChange={(e) => setForm({ ...form, identityCode: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Loại khách hàng
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as CustomerType })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhóm khách hàng
                  </label>
                  <select
                    value={form.customerGroup}
                    onChange={(e) =>
                      setForm({ ...form, customerGroup: e.target.value as CustomerGroup })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {GROUP_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số điện thoại
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    AM phụ trách
                  </label>
                  <input
                    value={form.amStaff}
                    onChange={(e) => setForm({ ...form, amStaff: e.target.value })}
                    placeholder="Nguyễn Thị Tình"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Địa chỉ
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                  {submitting ? "Đang tạo..." : "Thêm khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer AM Modal */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Điều chuyển AM phụ trách</h3>
              <button
                onClick={() => setTransferTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              Khách hàng: <span className="font-semibold text-slate-800">{transferTarget.name}</span>
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  AM phụ trách mới
                </label>
                <input
                  required
                  value={transferStaff}
                  onChange={(e) => setTransferStaff(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {transferError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {transferError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferTarget(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {transferring ? "Đang điều chuyển..." : "Điều chuyển"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

