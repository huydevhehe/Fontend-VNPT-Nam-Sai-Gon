"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Building2,
  User,
  ShieldAlert,
  AlertTriangle,
  X,
  ArrowRightLeft,
  UploadCloud,
  CheckCircle2,
  Users2,
  Pencil,
} from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { CustomerRecord, TerritoryRecord } from "@/lib/crm/types/crm.types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  transferCustomer,
  transferCaringStaff,
  importCustomerBatchExcel,
  assignStaffBulk,
} from "@/lib/api/customers.api";
import { getTerritories } from "@/lib/api/territories.api";
import { getStaff } from "@/lib/api/staff.api";
import {
  getCustomerTeams,
  assignCustomerTeam,
  CustomerTeamRecord,
} from "@/lib/api/customer-teams.api";
import { CUSTOMER_GROUP_LABEL } from "@/lib/crm/constants/org.constants";
import { useAuth } from "@/lib/auth/auth-context";
import TeamManager from "@/components/admin/customer/TeamManager";
import CustomerForm, {
  CustomerFormValues,
  customerToFormValues,
} from "@/components/admin/customer/CustomerForm";
import CustomerImportWizard from "@/components/admin/customer/CustomerImportWizard";


export default function CustomersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const [data, setData] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerRecord | null>(null);

  const [transferTarget, setTransferTarget] = useState<CustomerRecord | null>(null);
  const [transferStaff, setTransferStaff] = useState("");
  const [staffNames, setStaffNames] = useState<string[]>([]);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);

  const [caringTransferTarget, setCaringTransferTarget] = useState<CustomerRecord | null>(null);
  const [caringTransferStaff, setCaringTransferStaff] = useState("");
  const [caringTransferBatch, setCaringTransferBatch] = useState("");
  const [caringTransferError, setCaringTransferError] = useState<string | null>(null);
  const [caringTransferring, setCaringTransferring] = useState(false);

  // Batch import state (Task D)
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [territories, setTerritories] = useState<TerritoryRecord[]>([]);
  const [batchTerritoryId, setBatchTerritoryId] = useState("");
  const [batchAmCaringStaff, setBatchAmCaringStaff] = useState("");
  const [batchHandoverBatch, setBatchHandoverBatch] = useState("");
  const [batchMode, setBatchMode] = useState<"append" | "replace">("append");
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Team khách hàng (Đợt 7, Task 2)
  const [teams, setTeams] = useState<CustomerTeamRecord[]>([]);
  const [showTeamManager, setShowTeamManager] = useState(false);

  // Import khách hàng (xử lý trùng) — Đợt 8, Task 4. Luồng độc lập với modal
  // "Nhập đợt KHDN chăm" cũ (showBatchModal), không thay thế.
  const [showImportWizard, setShowImportWizard] = useState(false);

  // Gán nhân viên cho nhiều khách — Đợt 8, Task 5. Chỉ bật selection cho Admin.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkTarget, setBulkTarget] = useState<"caring" | "am" | "team" | null>(null);
  const [bulkValue, setBulkValue] = useState("");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  function loadTeams() {
    getCustomerTeams()
      .then(setTeams)
      .catch(() => {
        // Không chặn trang khách hàng nếu danh sách team tải lỗi.
      });
  }

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

  useEffect(() => {
    let isMounted = true;
    getStaff()
      .then((staff) => {
        if (isMounted) setStaffNames(Array.from(new Set(staff.map((s) => s.name))));
      })
      .catch(() => {
        // Gợi ý tên nhân viên là tuỳ chọn; backend vẫn kiểm tra khi điều chuyển.
      });

    getTerritories()
      .then((terrs) => {
        if (isMounted) {
          setTerritories(terrs);
          if (terrs.length > 0) setBatchTerritoryId(terrs[0].id);
        }
      })
      .catch(() => {});

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleBulkAssign() {
    if (!bulkTarget || selectedIds.size === 0) return;
    const value = bulkValue.trim();
    if (!value) {
      setBulkError("Vui lòng chọn giá trị cần gán");
      return;
    }

    setBulkError(null);
    setBulkSubmitting(true);
    try {
      const customerIds = Array.from(selectedIds);
      if (bulkTarget === "caring") {
        await assignStaffBulk({ customerIds, amCaringStaff: value });
      } else if (bulkTarget === "am") {
        await assignStaffBulk({ customerIds, amStaff: value });
      } else {
        await assignCustomerTeam(customerIds, value);
      }

      const updated = await getCustomers();
      setData(updated);
      setSelectedIds(new Set());
      setBulkTarget(null);
      setBulkValue("");
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Gán nhân viên thất bại");
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function handleBatchSubmit(e: FormEvent) {
    e.preventDefault();
    if (!batchFile) {
      setBatchError("Vui lòng chọn file Excel");
      return;
    }
    if (!batchTerritoryId) {
      setBatchError("Vui lòng chọn Địa bàn / Phường");
      return;
    }
    if (!batchAmCaringStaff.trim()) {
      setBatchError("Vui lòng chọn hoặc nhập AM chăm sóc");
      return;
    }
    if (!batchHandoverBatch.trim()) {
      setBatchError("Vui lòng nhập mã đợt giao");
      return;
    }

    setBatchError(null);
    setBatchSuccess(null);
    setBatchLoading(true);

    try {
      const res = await importCustomerBatchExcel(batchFile, {
        territoryId: batchTerritoryId,
        amCaringStaff: batchAmCaringStaff.trim(),
        handoverBatch: batchHandoverBatch.trim(),
        mode: batchMode,
      });

      setBatchSuccess(
        `Xử lý thành công ${res.totalProcessed} khách hàng: tạo mới ${res.createdCount}, cập nhật ${res.updatedCount}, gỡ gán cũ ${res.clearedCount}.`
      );

      const updated = await getCustomers();
      setData(updated);
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : "Nhập đợt thất bại");
    } finally {
      setBatchLoading(false);
    }
  }

  async function handleCreateSubmit(values: CustomerFormValues) {
    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createCustomer({
        name: values.name,
        identityCode: values.identityCode || undefined,
        type: values.type,
        customerGroup: values.customerGroup,
        customerCode: values.customerCode || undefined,
        status: values.status || undefined,
        teamId: values.teamId || undefined,
        salesChannel: values.salesChannel || undefined,
        territoryId: values.territoryId || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        note: values.note || undefined,
        contactName: values.contactName || undefined,
        contactEmail: values.contactEmail || undefined,
        billingName: values.billingName || undefined,
        billingPhone: values.billingPhone || undefined,
        billingEmail: values.billingEmail || undefined,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể thêm khách hàng. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(values: CustomerFormValues) {
    if (!editTarget) return;
    setFormError(null);
    setSubmitting(true);

    try {
      const updated = await updateCustomer(editTarget.id, {
        name: values.name,
        identityCode: values.identityCode || undefined,
        type: values.type,
        customerGroup: values.customerGroup,
        customerCode: values.customerCode || undefined,
        status: values.status || undefined,
        teamId: values.teamId || undefined,
        salesChannel: values.salesChannel || undefined,
        territoryId: values.territoryId || undefined,
        phone: values.phone || undefined,
        address: values.address || undefined,
        note: values.note || undefined,
        contactName: values.contactName || undefined,
        contactEmail: values.contactEmail || undefined,
        billingName: values.billingName || undefined,
        billingPhone: values.billingPhone || undefined,
        billingEmail: values.billingEmail || undefined,
      });

      setData((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditTarget(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể sửa khách hàng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  // Đổi AM bán hàng (am_staff, người phát triển) — không đổi người chăm sóc.
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
      const staffName = transferStaff.trim();
      await transferCustomer(transferTarget.id, staffName);
      setData((prev) =>
        prev.map((c) => (c.id === transferTarget.id ? { ...c, amStaff: staffName } : c))
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

  function openCaringTransfer(customer: CustomerRecord) {
    setCaringTransferTarget(customer);
    setCaringTransferStaff(customer.amCaringStaff);
    setCaringTransferBatch("");
    setCaringTransferError(null);
  }

  async function handleCaringTransfer(e: FormEvent) {
    e.preventDefault();
    if (!caringTransferTarget) return;

    setCaringTransferError(null);
    setCaringTransferring(true);

    try {
      const batch = caringTransferBatch.trim();
      await transferCaringStaff(caringTransferTarget.id, caringTransferStaff, batch || undefined);
      const today = new Date().toISOString().slice(0, 10);
      setData((prev) =>
        prev.map((c) =>
          c.id === caringTransferTarget.id
            ? {
                ...c,
                amCaringStaff: caringTransferStaff,
                handoverBatch: batch || c.handoverBatch,
                handoverDate: batch ? today : c.handoverDate,
              }
            : c
        )
      );
      setCaringTransferTarget(null);
    } catch (err) {
      setCaringTransferError(
        err instanceof Error ? err.message : "Không thể điều chuyển AM chăm sóc. Vui lòng thử lại."
      );
    } finally {
      setCaringTransferring(false);
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
            <Link
              href={`/admin/customers/${item.id}`}
              className="font-bold text-slate-900 hover:text-vnpt hover:underline"
            >
              {item.name}
            </Link>
            <div className="text-[11px] text-slate-400">{item.address}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Địa bàn",
      accessorKey: "territoryName",
      cell: (item) =>
        item.territoryName ? (
          <StatusBadge status={item.territoryName} variant="slate" />
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: "Kênh bán",
      accessorKey: "salesChannel",
      cell: (item) => (
        <span className="text-xs text-slate-700">{item.salesChannel || "—"}</span>
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
          status={CUSTOMER_GROUP_LABEL[item.group] ?? item.group}
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
          <div className="text-[10px] text-slate-400">AM bán hàng</div>
        </div>
      ),
    },
    {
      header: "AM chăm sóc (CSKH)",
      accessorKey: "amCaringStaff",
      cell: (item) => (
        <div className="text-xs">
          <div className="font-medium text-slate-800">{item.amCaringStaff || "—"}</div>
          <div className="text-[10px] text-slate-400">AM chăm sóc</div>
        </div>
      ),
    },
    {
      header: "Team",
      accessorKey: "teamName",
      cell: (item) => (
        <span className="text-xs font-semibold text-slate-700">{item.teamName || "—"}</span>
      ),
    },
    {
      header: "Đợt giao",
      accessorKey: "handoverBatch",
      cell: (item) =>
        item.handoverBatch ? (
          <div className="text-xs">
            <div className="font-semibold text-slate-800">{item.handoverBatch}</div>
            {item.handoverDate && (
              <div className="text-[10px] text-slate-400">{item.handoverDate}</div>
            )}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    ...(isAdmin
      ? [
          {
            header: "Thao tác",
            accessorKey: "id" as const,
            cell: (item: CustomerRecord) => (
              <div className="flex flex-col items-start gap-1">
                <button
                  onClick={() => {
                    setFormError(null);
                    setEditTarget(item);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Sửa thông tin
                </button>
                <button
                  onClick={() => openTransfer(item)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt transition-colors"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  Điều chuyển AM
                </button>
                <button
                  onClick={() => openCaringTransfer(item)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-vnpt hover:border-vnpt transition-colors"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  Điều chuyển CSKH
                </button>
              </div>
            ),
          },
        ]
      : []),
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
            Quản lý {CUSTOMER_GROUP_LABEL["Tự phát triển"]} và {CUSTOMER_GROUP_LABEL["Tập hiện hữu"]} được giao phụ trách
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowTeamManager(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Users2 className="h-4 w-4" />
              <span className="btn-label">Quản lý Team</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setBatchError(null);
                setBatchSuccess(null);
                setShowBatchModal(true);
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-vnpt bg-white px-3.5 text-xs font-bold text-vnpt shadow-xs hover:bg-vnpt/5 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="btn-label">Nhập đợt KHDN chăm</span>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setShowImportWizard(true)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span className="btn-label">Import khách hàng</span>
            </button>
          )}
          <button
            onClick={() => {
              setFormError(null);
              setShowForm(true);
            }}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
          >
            <UserPlus className="h-4 w-4" />
            <span className="btn-label">Thêm khách hàng</span>
          </button>
        </div>
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
          title="KH PTM"
          value="386"
          subtitle="Bán mới trong các kỳ"
          icon={UserPlus}
        />
        <KpiCard
          title="KHDN CHĂM ĐƯỢC GIAO"
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

      {/* Thanh gán nhân viên hàng loạt — Đợt 8, Task 5 */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-vnpt/30 bg-vnpt/5 px-4 py-2.5 text-xs">
          <span className="font-bold text-slate-800">Đã chọn {selectedIds.size} khách</span>
          <button
            onClick={() => {
              setBulkTarget("caring");
              setBulkValue("");
              setBulkError(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Gán AM chăm sóc
          </button>
          <button
            onClick={() => {
              setBulkTarget("am");
              setBulkValue("");
              setBulkError(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Gán AM phụ trách
          </button>
          <button
            onClick={() => {
              setBulkTarget("team");
              setBulkValue("");
              setBulkError(null);
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Gán Team
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-slate-500 underline-offset-2 hover:underline"
          >
            Bỏ chọn
          </button>
        </div>
      )}

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
          subtitle="Hỗ trợ lọc theo loại khách, team, địa bàn, kênh bán, AM phụ trách/chăm sóc"
          columns={columns}
          data={data}
          filters={[
            {
              id: "group",
              label: "Loại khách",
              getValue: (row) => CUSTOMER_GROUP_LABEL[row.group] ?? row.group,
            },
            {
              id: "teamName",
              label: "Team",
              getValue: (row) => row.teamName || null,
            },
            {
              id: "territoryName",
              label: "Địa bàn",
              getValue: (row) => row.territoryName || null,
            },
            {
              id: "salesChannel",
              label: "Kênh bán",
              getValue: (row) => row.salesChannel || null,
            },
            {
              id: "amStaff",
              label: "AM phụ trách",
              getValue: (row) => row.amStaff || null,
            },
            {
              id: "amCaringStaff",
              label: "AM chăm sóc",
              getValue: (row) => row.amCaringStaff || null,
            },
          ]}
          searchPlaceholder="Tìm theo tên, MST, CCCD, địa chỉ..."
          exportFileName="vnpt_khach_hang"
          selection={
            isAdmin
              ? {
                  getRowId: (row) => row.id,
                  selectedIds,
                  onChange: setSelectedIds,
                }
              : undefined
          }
        />
      )}

      {/* Modal chọn giá trị gán hàng loạt */}
      {bulkTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {bulkTarget === "caring" && "Gán AM chăm sóc"}
                {bulkTarget === "am" && "Gán AM phụ trách"}
                {bulkTarget === "team" && "Gán Team"}
              </h3>
              <button
                onClick={() => setBulkTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              Áp dụng cho <span className="font-semibold text-slate-800">{selectedIds.size}</span> khách hàng đã chọn.
            </p>

            {bulkTarget === "team" ? (
              <select
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              >
                <option value="">— Chọn team —</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                list="customer-staff-names"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="Chọn hoặc nhập tên nhân viên"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            )}

            {bulkError && (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                {bulkError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setBulkTarget(null)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBulkAssign}
                disabled={bulkSubmitting}
                className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
              >
                {bulkSubmitting ? "Đang gán..." : "Gán"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import khách hàng (xử lý trùng) — Đợt 8 */}
      {showImportWizard && (
        <CustomerImportWizard
          territories={territories}
          staffNames={staffNames}
          onClose={() => setShowImportWizard(false)}
          onImported={() => {
            getCustomers().then(setData).catch(() => {});
          }}
        />
      )}

      {/* Quản lý Team khách hàng */}
      {showTeamManager && (
        <TeamManager
          onClose={() => setShowTeamManager(false)}
          onChanged={() => {
            loadTeams();
            getCustomers().then(setData).catch(() => {});
          }}
        />
      )}

      {/* Create Customer Modal */}
      {showForm && (
        <CustomerForm
          mode="create"
          territories={territories}
          teams={teams}
          submitting={submitting}
          error={formError}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Customer Modal */}
      {editTarget && (
        <CustomerForm
          mode="edit"
          initialValues={customerToFormValues(editTarget)}
          territories={territories}
          teams={teams}
          submitting={submitting}
          error={formError}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditTarget(null)}
          customerId={editTarget.id}
          canDeleteDocuments={isAdmin}
        />
      )}

      {/* Transfer AM bán hàng Modal */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Điều chuyển AM phụ trách (bán hàng)</h3>
              <button
                onClick={() => setTransferTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              Khách hàng: <span className="font-semibold text-slate-800">{transferTarget.name}</span>
              <br />
              Chỉ đổi AM bán hàng, không ảnh hưởng AM chăm sóc (CSKH).
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label
                  htmlFor="transfer-staff"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  AM phụ trách mới
                </label>
                <input
                  id="transfer-staff"
                  required
                  list="customer-staff-names"
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

      {/* Transfer AM chăm sóc (CSKH) Modal */}
      {caringTransferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Điều chuyển AM chăm sóc (CSKH)</h3>
              <button
                onClick={() => setCaringTransferTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-500">
              Khách hàng:{" "}
              <span className="font-semibold text-slate-800">{caringTransferTarget.name}</span>
              <br />
              Chỉ đổi AM chăm sóc (CSKH), không ảnh hưởng AM bán hàng.
            </p>

            <form onSubmit={handleCaringTransfer} className="space-y-3">
              <div>
                <label
                  htmlFor="caring-transfer-staff"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  AM chăm sóc mới
                </label>
                <input
                  id="caring-transfer-staff"
                  required
                  list="customer-staff-names"
                  value={caringTransferStaff}
                  onChange={(e) => setCaringTransferStaff(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="caring-transfer-batch"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Mã đợt giao
                </label>
                <input
                  id="caring-transfer-batch"
                  value={caringTransferBatch}
                  onChange={(e) => setCaringTransferBatch(e.target.value)}
                  placeholder="Tuỳ chọn, ví dụ DOT-2026-01"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              {caringTransferError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {caringTransferError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCaringTransferTarget(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={caringTransferring}
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {caringTransferring ? "Đang điều chuyển..." : "Điều chuyển"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Import KHDN-chăm Modal (Task D) */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-vnpt/10 text-vnpt">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Nhập tập KHDN-chăm theo đợt
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nhập danh sách từ Excel và phân công AM chăm sóc theo địa bàn
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="batch-territory-select"
                    className="mb-1 block text-xs font-semibold text-slate-600"
                  >
                    Địa bàn / Phường <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="batch-territory-select"
                    required
                    value={batchTerritoryId}
                    onChange={(e) => setBatchTerritoryId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.wardName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="batch-caring-staff"
                    className="mb-1 block text-xs font-semibold text-slate-600"
                  >
                    AM chăm sóc (CSKH) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="batch-caring-staff"
                    required
                    list="customer-staff-names"
                    value={batchAmCaringStaff}
                    onChange={(e) => setBatchAmCaringStaff(e.target.value)}
                    placeholder="Chọn hoặc nhập tên AM"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="batch-handover-batch"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  Mã đợt bàn giao <span className="text-rose-500">*</span>
                </label>
                <input
                  id="batch-handover-batch"
                  required
                  value={batchHandoverBatch}
                  onChange={(e) => setBatchHandoverBatch(e.target.value)}
                  placeholder="Ví dụ: DOT-2026-11 hoặc DOT-Q4-2026"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Chế độ xác lập tập <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      id="batch-mode-append"
                      name="batch-mode"
                      value="append"
                      checked={batchMode === "append"}
                      onChange={() => setBatchMode("append")}
                      className="mt-0.5 text-vnpt focus:ring-vnpt"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">
                        Thêm vào tập hiện tại (append)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Thêm mới hoặc cập nhật người chăm sóc cho khách trong file. Giữ nguyên toàn bộ khách hàng cũ khác.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-slate-200/60">
                    <input
                      type="radio"
                      id="batch-mode-replace"
                      name="batch-mode"
                      value="replace"
                      checked={batchMode === "replace"}
                      onChange={() => setBatchMode("replace")}
                      className="mt-0.5 text-vnpt focus:ring-vnpt"
                    />
                    <div>
                      <span className="font-semibold text-slate-800">
                        Thay thế toàn bộ tập hiện tại (replace)
                      </span>
                      <p className="text-[11px] text-amber-700">
                        Khách hàng thuộc phường này không có trong file sẽ bị gỡ người chăm sóc (xác lập lại tập mới).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="batch-file-input"
                  className="mb-1 block text-xs font-semibold text-slate-600"
                >
                  File Excel danh sách khách hàng (.xlsx, .xls) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="batch-file-input"
                  type="file"
                  required
                  accept=".xlsx,.xls"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const f = e.target.files?.[0] || null;
                    setBatchFile(f);
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-vnpt/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-vnpt hover:file:bg-vnpt/20"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Hỗ trợ các cột: Tên khách hàng, Mã số thuế/CCCD, Số điện thoại, Địa chỉ, Dịch vụ.
                </p>
              </div>

              {batchError && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <span>{batchError}</span>
                </div>
              )}

              {batchSuccess && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>{batchSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={batchLoading}
                  className="btn-label rounded-xl bg-vnpt px-4 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60 flex items-center gap-1.5"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{batchLoading ? "Đang nhập đợt..." : "Bắt đầu nhập đợt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <datalist id="customer-staff-names">
        {staffNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}

