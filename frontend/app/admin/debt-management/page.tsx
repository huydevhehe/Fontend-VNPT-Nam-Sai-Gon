"use client";

import { useEffect, useRef, useState } from "react";
import { Receipt, UploadCloud, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { DebtRecord, StaffRecord } from "@/lib/crm/types/crm.types";
import { createDebt, getDebts, importDebtsExcel } from "@/lib/api/debts.api";
import { getStaff } from "@/lib/api/staff.api";
import { useAuth } from "@/lib/auth/auth-context";
import StaffKpiTable from "@/components/admin/kpi/StaffKpiTable";

const SERVICE_GROUPS = ["BRCĐ", "CNTT", "Di động"] as const;

const EMPTY_FORM = {
  staffName: "",
  serviceGroup: SERVICE_GROUPS[0] as string,
  paymentCode: "",
  subscriberCode: "",
  customerName: "",
  installationAddress: "",
  immediateDebt: "",
  cumulativeDebt: "",
  month: new Date().toISOString().slice(0, 7),
};

export default function DebtManagementPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<DebtRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "immediate" | "cumulative" | "kpi">("all");

  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    getStaff()
      .then(setStaffList)
      .catch(() => setStaffList([]));
  }, [isAdmin]);

  async function loadDebts() {
    setLoading(true);
    setError(null);
    try {
      const debts = await getDebts();
      setData(debts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu công nợ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDebts();
  }, []);

  async function handleFileSelected(file: File) {
    const month = new Date().toISOString().slice(0, 7);
    setImporting(true);
    try {
      const result = await importDebtsExcel(file, month);
      alert(
        `Import thành công: ${result.importedCount}/${result.totalProcessed} dòng. Bỏ qua ${result.skippedCount} dòng lỗi.`
      );
      await loadDebts();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Import file nợ thất bại. Vui lòng thử lại."
      );
    } finally {
      setImporting(false);
    }
  }

  const filteredByTab = data.filter((item) => {
    if (activeTab === "immediate") return item.immediateDebt > 0;
    if (activeTab === "cumulative") return item.cumulativeDebt > 0;
    return true;
  });

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      await createDebt({
        staffName: createForm.staffName,
        serviceGroup: createForm.serviceGroup,
        paymentCode: createForm.paymentCode,
        subscriberCode: createForm.subscriberCode,
        customerName: createForm.customerName,
        installationAddress: createForm.installationAddress,
        immediateDebt: Number(createForm.immediateDebt) || 0,
        cumulativeDebt: Number(createForm.cumulativeDebt) || 0,
        month: createForm.month,
      });
      setShowCreateModal(false);
      setCreateForm(EMPTY_FORM);
      await loadDebts();
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Thêm nợ lẻ thất bại. Vui lòng thử lại."
      );
    } finally {
      setCreating(false);
    }
  }

  const columns: Column<DebtRecord>[] = [
    {
      header: "Mã thuê bao",
      accessorKey: "subscriberCode",
      cell: (item) => (
        <span className="font-mono font-bold text-vnpt">
          {item.subscriberCode}
        </span>
      ),
    },
    {
      header: "Khách hàng & Địa chỉ",
      accessorKey: "customerName",
      cell: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.customerName}</div>
          <div className="text-[11px] text-slate-400">
            {item.installationAddress}
          </div>
        </div>
      ),
    },
    {
      header: "Nhóm dịch vụ",
      accessorKey: "serviceGroup",
    },
    {
      header: "Mã thanh toán",
      accessorKey: "paymentCode",
      cell: (item) => (
        <span className="font-mono text-slate-600">{item.paymentCode}</span>
      ),
    },
    {
      header: "Còn nợ thu ngay",
      accessorKey: "immediateDebt",
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {item.immediateDebt.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Còn nợ lũy kế",
      accessorKey: "cumulativeDebt",
      cell: (item) => (
        <span className="font-semibold text-rose-600">
          {item.cumulativeDebt.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
    {
      header: "Nhân viên chăm",
      accessorKey: "staffName",
      cell: (item) => (
        <span className="font-medium text-slate-700">{item.staffName}</span>
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
            Quản lý công nợ thu ngay & nợ lũy kế
          </h2>
          <p className="text-xs text-slate-500">
            Khớp chuẩn 8 cột Sheet &apos;THU NGAY , LŨY KẾ&apos; từ file mẫu import+CSKH.xlsx
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileSelected(file);
                }
                e.target.value = "";
              }}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-vnpt/30 bg-white px-3.5 text-xs font-bold text-vnpt shadow-xs hover:bg-blue-50"
            >
              <Plus className="h-4 w-4" />
              <span className="btn-label">Thêm nợ lẻ</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="btn-label">
                {importing ? "Đang import..." : "Import file nợ"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TỶ LỆ THU NGAY"
          value="98.0%"
          subtitle="Tổng đã thu / Tổng phải thu"
          icon={Receipt}
          badge="Tháng T"
        />
        <KpiCard
          title="TỶ LỆ THU LŨY KẾ"
          value="78.0%"
          subtitle="Tổng đã thu / Phải thu lũy kế"
          icon={CheckCircle2}
        />
        <KpiCard
          title="NỢ THU NGAY CÒN LẠI"
          value="128,6 tr ₫"
          subtitle="Cần theo dõi đôn đốc"
          icon={AlertCircle}
        />
        <KpiCard
          title="TỔNG NỢ LŨY KẾ"
          value="482,3 tr ₫"
          subtitle="Dồn qua các kỳ trước"
          icon={AlertCircle}
        />
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "all"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Tất cả công nợ
        </button>
        <button
          onClick={() => setActiveTab("immediate")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "immediate"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Nợ thu ngay
        </button>
        <button
          onClick={() => setActiveTab("cumulative")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "cumulative"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Nợ lũy kế
        </button>
        <button
          onClick={() => setActiveTab("kpi")}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
            activeTab === "kpi"
              ? "bg-vnpt text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          % thực hiện theo nhân viên
        </button>
      </div>

      {/* Main Table */}
      {activeTab === "kpi" ? (
        <StaffKpiTable kpiKeys={["thu_ngay"]} />
      ) : error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertCircle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu công nợ
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu công nợ...
        </div>
      ) : (
        <DataTable
          title="Danh sách công nợ theo thuê bao"
          subtitle="Dữ liệu chi tiết từng mã thanh toán và tình trạng gạch nợ"
          columns={columns}
          data={filteredByTab}
          filters={[
            ...(isAdmin
              ? [
                  {
                    id: "staffName",
                    label: "nhân viên",
                    getValue: (row: DebtRecord) => row.staffName,
                  },
                ]
              : []),
            {
              id: "serviceGroup",
              label: "nhóm dịch vụ",
              getValue: (row: DebtRecord) => row.serviceGroup,
            },
            {
              id: "status",
              label: "trạng thái",
              getValue: (row: DebtRecord) => row.status,
            },
            {
              id: "month",
              label: "tháng",
              getValue: (row: DebtRecord) => row.month,
            },
          ]}
          searchPlaceholder="Tìm mã thuê bao, tên KH, nhân viên..."
          exportFileName="vnpt_cong_no"
        />
      )}

      {/* Modal Thêm nợ lẻ (Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Thêm nợ lẻ</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhân viên
                  </label>
                  <select
                    required
                    value={createForm.staffName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, staffName: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhóm dịch vụ
                  </label>
                  <select
                    required
                    value={createForm.serviceGroup}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, serviceGroup: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {SERVICE_GROUPS.map((g) => (
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
                    Mã thanh toán
                  </label>
                  <input
                    required
                    value={createForm.paymentCode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, paymentCode: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mã thuê bao
                  </label>
                  <input
                    required
                    value={createForm.subscriberCode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, subscriberCode: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tên khách hàng
                </label>
                <input
                  required
                  value={createForm.customerName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, customerName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Địa chỉ lắp đặt
                </label>
                <input
                  value={createForm.installationAddress}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, installationAddress: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nợ thu ngay (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={createForm.immediateDebt}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, immediateDebt: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nợ lũy kế (₫)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={createForm.cumulativeDebt}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cumulativeDebt: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tháng
                  </label>
                  <input
                    type="month"
                    required
                    value={createForm.month}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, month: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
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
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {creating ? "Đang lưu..." : "Lưu nợ lẻ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

