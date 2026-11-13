"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import {
  FileText,
  Plus,
  CheckCircle,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  X,
  Edit2,
  DollarSign,
  Download,
} from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusSelect from "@/components/admin/shared/StatusSelect";
import {
  getContracts,
  createContract,
  updateContractInfo,
  updateContractStatus,
} from "@/lib/api/contracts.api";
import { getLeads, getCtvOptions, CtvOption } from "@/lib/api/leads.api";
import { getTerritories } from "@/lib/api/territories.api";
import { getCustomers } from "@/lib/api/customers.api";
import { getStaff } from "@/lib/api/staff.api";
import {
  ContractRecord,
  LeadRecord,
  TerritoryRecord,
  CustomerRecord,
  StaffRecord,
} from "@/lib/crm/types/crm.types";
import { LEAD_CHANNELS } from "@/lib/crm/constants/org.constants";

const CHANNEL_OPTIONS: readonly string[] = LEAD_CHANNELS;
const SERVICE_GROUPS = ["BRCĐ", "CNTT", "Di động"] as const;
const PAYMENT_METHODS = ["Trả trước", "Trả hàng tháng"] as const;

const DEPLOYMENT_STATUSES: ContractRecord["deploymentStatus"][] = [
  "Chưa triển khai",
  "Đang triển khai",
  "Hoàn tất",
  "Tạm dừng",
  "Hủy",
];

const PAYMENT_STATUSES: ContractRecord["paymentStatus"][] = [
  "Chưa thanh toán",
  "Đã thanh toán",
];

const DOCUMENT_STATUSES: ContractRecord["documentStatus"][] = [
  "Soạn thảo",
  "Khách trình ký",
  "Hoàn thiện bàn giao",
];

interface OrderFormState {
  transactionCode: string;
  customerName: string;
  subscriberCodes: string;
  totalValue: string;
  channel: string;
  leadId: string;
  territoryId: string;
  amStaff: string;
  serviceGroup: string;
  serviceName: string;
  packageName: string;
  paymentMethod: string;
  customerId: string;
  taxCode: string;
  contractNumber: string;
  signedDate: string;
}

const EMPTY_FORM: OrderFormState = {
  transactionCode: "",
  customerName: "",
  subscriberCodes: "",
  totalValue: "",
  channel: CHANNEL_OPTIONS[0],
  leadId: "",
  territoryId: "",
  amStaff: "",
  serviceGroup: SERVICE_GROUPS[0],
  serviceName: "",
  packageName: "",
  paymentMethod: PAYMENT_METHODS[0],
  customerId: "",
  taxCode: "",
  contractNumber: "",
  signedDate: "",
};

export default function ContractsPage() {
  const [data, setData] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<OrderFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [territories, setTerritories] = useState<TerritoryRecord[]>([]);
  const [ctvOptions, setCtvOptions] = useState<CtvOption[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);

  // Filters
  const [codeFilter, setCodeFilter] = useState<string | null>(null);
  const [filterServiceGroup, setFilterServiceGroup] = useState<string>("ALL");
  const [filterAmStaff, setFilterAmStaff] = useState<string>("ALL");
  const [filterDeployment, setFilterDeployment] = useState<string>("ALL");
  const [filterPayment, setFilterPayment] = useState<string>("ALL");
  const [filterChannel, setFilterChannel] = useState<string>("ALL");

  const ctvNameById = new Map(ctvOptions.map((c) => [c.id, c.name]));

  // Lead đã chốt thành công mà chưa gắn đơn hàng nào
  const linkableLeads = leads.filter(
    (l) => l.status === "Chốt thành công" && !data.some((c) => c.leadId === l.id)
  );

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      getLeads(),
      getTerritories(),
      getCtvOptions(),
      getCustomers(),
      getStaff({ status: "ACTIVE" }),
    ]).then(([leadRes, wardRes, ctvRes, custRes, staffRes]) => {
      if (!isMounted) return;
      if (leadRes.status === "fulfilled") setLeads(leadRes.value);
      if (wardRes.status === "fulfilled") setTerritories(wardRes.value);
      if (ctvRes.status === "fulfilled") setCtvOptions(ctvRes.value);
      if (custRes.status === "fulfilled") setCustomers(custRes.value);
      if (staffRes.status === "fulfilled") setStaffList(staffRes.value);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("ma");
    if (code) setCodeFilter(code);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadContracts() {
      setLoading(true);
      setError(null);
      try {
        const contracts = await getContracts();
        if (isMounted) {
          setData(contracts);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Đơn hàng. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadContracts();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleSelectLead(leadId: string) {
    const lead = linkableLeads.find((l) => l.id === leadId);
    if (!lead) {
      setForm({ ...form, leadId: "" });
      return;
    }
    setForm({
      ...form,
      leadId,
      customerName: lead.customerName,
      totalValue: String(lead.expectedValue),
      channel: lead.channel,
      territoryId: lead.territoryId || "",
      amStaff: lead.staffName || "",
    });
  }

  function handleSelectCustomer(customerId: string) {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) {
      setForm({ ...form, customerId: "", taxCode: "" });
      return;
    }
    setForm({
      ...form,
      customerId,
      customerName: cust.name,
      taxCode: cust.identityCode || "",
    });
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function handleOpenEdit(order: ContractRecord) {
    setEditingId(order.id);
    setForm({
      transactionCode: order.transactionCode,
      customerName: order.customerName,
      subscriberCodes: order.subscriberCodes.join(", "),
      totalValue: String(order.totalValue),
      channel: order.channel,
      leadId: order.leadId || "",
      territoryId: order.territoryId || "",
      amStaff: order.amStaff || "",
      serviceGroup: order.serviceGroup || SERVICE_GROUPS[0],
      serviceName: order.serviceName || "",
      packageName: order.packageName || "",
      paymentMethod: order.paymentMethod || PAYMENT_METHODS[0],
      customerId: order.customerId || "",
      taxCode: order.taxCode || "",
      contractNumber: order.contractNumber || "",
      signedDate: order.signedDate || "",
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const subscriberCodes = form.subscriberCodes
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean);

      if (editingId) {
        const updated = await updateContractInfo(editingId, {
          customerName: form.customerName,
          subscriberCodes,
          totalValue: Number(form.totalValue),
          channel: form.channel,
          leadId: form.leadId || null,
          territoryId: form.territoryId || null,
          amStaff: form.amStaff || null,
          serviceGroup: form.serviceGroup || null,
          serviceName: form.serviceName || null,
          packageName: form.packageName || null,
          paymentMethod: form.paymentMethod || null,
          customerId: form.customerId || null,
          taxCode: form.taxCode || null,
          contractNumber: form.contractNumber || null,
          signedDate: form.signedDate || null,
        });

        setData((prev) => prev.map((row) => (row.id === editingId ? updated : row)));
        setShowForm(false);
      } else {
        const created = await createContract({
          transactionCode: form.transactionCode,
          customerName: form.customerName,
          subscriberCodes,
          totalValue: Number(form.totalValue),
          channel: form.channel,
          leadId: form.leadId || null,
          territoryId: form.territoryId || null,
          amStaff: form.amStaff || null,
          serviceGroup: form.serviceGroup || null,
          serviceName: form.serviceName || null,
          packageName: form.packageName || null,
          paymentMethod: form.paymentMethod || null,
          customerId: form.customerId || null,
          taxCode: form.taxCode || null,
          contractNumber: form.contractNumber || null,
          signedDate: form.signedDate || null,
        });

        setData((prev) => [created, ...prev]);
        setShowForm(false);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Thao tác không thành công. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Filtered data
  const visibleData = useMemo(() => {
    return data.filter((item) => {
      if (codeFilter && item.transactionCode !== codeFilter) return false;
      if (filterServiceGroup !== "ALL" && item.serviceGroup !== filterServiceGroup) return false;
      if (filterAmStaff !== "ALL" && item.amStaff !== filterAmStaff) return false;
      if (filterDeployment !== "ALL" && item.deploymentStatus !== filterDeployment) return false;
      if (filterPayment !== "ALL" && item.paymentStatus !== filterPayment) return false;
      if (filterChannel !== "ALL" && item.channel !== filterChannel) return false;
      return true;
    });
  }, [
    data,
    codeFilter,
    filterServiceGroup,
    filterAmStaff,
    filterDeployment,
    filterPayment,
    filterChannel,
  ]);

  const uniqueAmStaffList = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.amStaff) set.add(d.amStaff);
    });
    return Array.from(set);
  }, [data]);

  const columns: Column<ContractRecord>[] = [
    {
      header: "Mã giao dịch",
      accessorKey: "transactionCode",
      cell: (item) => (
        <span className="font-mono font-bold text-vnpt">{item.transactionCode}</span>
      ),
    },
    {
      header: "Khách hàng",
      accessorKey: "customerName",
      cell: (item) => (
        <div>
          <span className="font-bold text-slate-900 block">{item.customerName}</span>
          {item.taxCode && (
            <span className="text-[11px] text-slate-500 font-mono">MST: {item.taxCode}</span>
          )}
        </div>
      ),
    },
    {
      header: "AM tiếp thị",
      accessorKey: "amStaff",
      cell: (item) =>
        item.amStaff ? (
          <span className="font-medium text-slate-800">{item.amStaff}</span>
        ) : (
          <span className="text-slate-400 italic">Chưa gán</span>
        ),
    },
    {
      header: "Nhóm DV",
      accessorKey: "serviceGroup",
      cell: (item) =>
        item.serviceGroup ? (
          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-200">
            {item.serviceGroup}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: "Gói cước",
      accessorKey: "packageName",
      cell: (item) => (
        <div>
          <span className="font-medium text-slate-800 block">{item.packageName || "—"}</span>
          {item.serviceName && (
            <span className="text-[11px] text-slate-500">{item.serviceName}</span>
          )}
        </div>
      ),
    },
    {
      header: "Đã thu / Giá trị",
      accessorKey: "totalValue",
      cell: (item) => {
        const collected = item.collectedAmount || 0;
        return (
          <div className="text-right">
            <span className="font-bold text-slate-900 block">
              {item.totalValue.toLocaleString("vi-VN")} ₫
            </span>
            <span
              className={`text-[11px] font-semibold ${
                collected >= item.totalValue
                  ? "text-emerald-600"
                  : collected > 0
                  ? "text-amber-600"
                  : "text-slate-400"
              }`}
            >
              Đã thu: {collected.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        );
      },
    },
    {
      header: "Kênh",
      accessorKey: "channel",
    },
    {
      header: "CTV giới thiệu",
      accessorKey: "referredByCtvId",
      cell: (item) =>
        item.referredByCtvId ? (
          <span className="font-medium text-slate-700">
            {ctvNameById.get(item.referredByCtvId) ?? item.referredByCtvId}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      header: "Triển khai",
      accessorKey: "deploymentStatus",
      cell: (item) => (
        <StatusSelect
          value={item.deploymentStatus}
          options={DEPLOYMENT_STATUSES}
          onChange={async (next) => {
            const updated = await updateContractStatus(item.id, {
              deploymentStatus: next,
            });
            setData((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
          }}
        />
      ),
    },
    {
      header: "Thanh toán",
      accessorKey: "paymentStatus",
      cell: (item) => (
        <StatusSelect
          value={item.paymentStatus}
          options={PAYMENT_STATUSES}
          onChange={async (next) => {
            const updated = await updateContractStatus(item.id, {
              paymentStatus: next,
            });
            setData((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
          }}
        />
      ),
    },
    {
      header: "Thao tác",
      accessorKey: "id",
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(item)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            title="Chỉnh sửa đơn hàng"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Quản lý đơn hàng
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý theo mã giao dịch nguồn, AM tiếp thị, nhóm dịch vụ và tình trạng thanh toán
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-xs font-bold text-white shadow-xs hover:bg-vnpt-dark"
        >
          <Plus className="h-4 w-4" />
          <span className="btn-label">Tạo đơn hàng</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="ĐƠN HÀNG THÁNG NÀY"
          value={data.length}
          subtitle="Tổng số đơn ghi nhận"
          icon={FileText}
        />
        <KpiCard
          title="TRIỂN KHAI HOÀN TẤT"
          value={data.filter((c) => c.deploymentStatus === "Hoàn tất").length}
          subtitle="Đã hoàn tất lắp đặt"
          icon={CheckCircle}
        />
        <KpiCard
          title="CHƯA THANH TOÁN"
          value={data.filter((c) => c.paymentStatus === "Chưa thanh toán").length}
          subtitle="Cần theo dõi thu tiền"
          icon={Banknote}
        />
        <KpiCard
          title="ĐÃ THANH TOÁN"
          value={data.filter((c) => c.paymentStatus === "Đã thanh toán").length}
          subtitle="Đã thu đủ tiền đơn hàng"
          icon={ShieldCheck}
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 text-xs shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Nhóm DV:</span>
          <select
            value={filterServiceGroup}
            onChange={(e) => setFilterServiceGroup(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả</option>
            {SERVICE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">AM tiếp thị:</span>
          <select
            value={filterAmStaff}
            onChange={(e) => setFilterAmStaff(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả AM</option>
            {uniqueAmStaffList.map((am) => (
              <option key={am} value={am}>
                {am}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Triển khai:</span>
          <select
            value={filterDeployment}
            onChange={(e) => setFilterDeployment(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả</option>
            {DEPLOYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Thanh toán:</span>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Kênh:</span>
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-vnpt focus:outline-none"
          >
            <option value="ALL">Tất cả</option>
            {CHANNEL_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {(filterServiceGroup !== "ALL" ||
          filterAmStaff !== "ALL" ||
          filterDeployment !== "ALL" ||
          filterPayment !== "ALL" ||
          filterChannel !== "ALL" ||
          codeFilter) && (
          <button
            type="button"
            onClick={() => {
              setFilterServiceGroup("ALL");
              setFilterAmStaff("ALL");
              setFilterDeployment("ALL");
              setFilterPayment("ALL");
              setFilterChannel("ALL");
              setCodeFilter(null);
            }}
            className="ml-auto font-bold text-vnpt hover:underline"
          >
            Đặt lại bộ lọc
          </button>
        )}
      </div>

      {codeFilter && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
          <span>
            Đang lọc theo mã giao dịch <b className="font-mono">{codeFilter}</b>
          </span>
          <button
            type="button"
            onClick={() => setCodeFilter(null)}
            className="font-bold text-vnpt hover:underline"
          >
            Bỏ lọc
          </button>
        </div>
      )}

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Đơn hàng
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Đơn hàng...
        </div>
      ) : (
        <DataTable
          title="Danh sách đơn hàng"
          subtitle="Theo dõi tiến độ triển khai kỹ thuật, AM tiếp thị, nhóm dịch vụ và thanh toán"
          columns={columns}
          data={visibleData}
          searchPlaceholder="Tìm theo mã giao dịch, khách hàng, AM, mã thuê bao..."
          exportFileName="vnpt_don_hang"
        />
      )}

      {/* Create / Edit Order Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Chọn từ Lead chốt thành công (tùy chọn)
                  </label>
                  <select
                    value={form.leadId}
                    onChange={(e) => handleSelectLead(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">— Nhập tay không qua Lead —</option>
                    {linkableLeads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.customerName} · AM: {l.staffName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mã giao dịch <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    disabled={Boolean(editingId)}
                    value={form.transactionCode}
                    onChange={(e) => setForm({ ...form, transactionCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Chọn Khách hàng (tùy chọn)
                  </label>
                  <select
                    value={form.customerId}
                    onChange={(e) => handleSelectCustomer(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">— Nhập tên tự do bên dưới —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.identityCode ? `(${c.identityCode})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tên khách hàng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mã số thuế / CCCD
                  </label>
                  <input
                    value={form.taxCode}
                    onChange={(e) => setForm({ ...form, taxCode: e.target.value })}
                    placeholder="VD: 0319653211"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhóm dịch vụ
                  </label>
                  <select
                    value={form.serviceGroup}
                    onChange={(e) => setForm({ ...form, serviceGroup: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {SERVICE_GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tên dịch vụ
                  </label>
                  <input
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    placeholder="VD: FiberVNN, VNPT CA..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Gói cước
                  </label>
                  <input
                    value={form.packageName}
                    onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                    placeholder="VD: Home Net 2, Gói 12 tháng..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    AM tiếp thị phụ trách
                  </label>
                  <select
                    value={form.amStaff}
                    onChange={(e) => setForm({ ...form, amStaff: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">— Chưa gán AM —</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số hợp đồng
                  </label>
                  <input
                    value={form.contractNumber}
                    onChange={(e) => setForm({ ...form, contractNumber: e.target.value })}
                    placeholder="Tự sinh nếu để trống"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Ngày ký / ngày tạo đơn
                  </label>
                  <input
                    type="date"
                    value={form.signedDate}
                    onChange={(e) => setForm({ ...form, signedDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mã thuê bao (phân tách bởi dấu phẩy) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  value={form.subscriberCodes}
                  onChange={(e) => setForm({ ...form, subscriberCodes: e.target.value })}
                  placeholder="0901234567, 0909876543"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Giá trị đơn hàng (₫) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.totalValue}
                    onChange={(e) => setForm({ ...form, totalValue: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Kênh phát triển
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {CHANNEL_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Phường
                  </label>
                  <select
                    value={form.territoryId}
                    onChange={(e) => setForm({ ...form, territoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    <option value="">— Chưa gán —</option>
                    {territories.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.wardName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
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
                  {submitting ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Tạo đơn hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
