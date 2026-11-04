"use client";

import { useEffect, useState, FormEvent } from "react";
import { Target, UserPlus, PhoneCall, CheckCircle2, TrendingUp, AlertTriangle, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { getLeads, createLead } from "@/lib/api/leads.api";
import { LeadRecord } from "@/lib/crm/types/crm.types";

const GROUP_OPTIONS: LeadRecord["group"][] = [
  "Khách hàng mới",
  "Khách hiện hữu mua thêm",
  "Gia hạn dịch vụ",
];

const CHANNEL_OPTIONS: LeadRecord["channel"][] = [
  "Online",
  "Đối tác",
  "Khách hàng hiện hữu",
  "Chiến dịch",
];

interface LeadFormState {
  customerName: string;
  phone: string;
  group: LeadRecord["group"];
  channel: LeadRecord["channel"];
  staffName: string;
  expectedValue: string;
  demandDescription: string;
}

const EMPTY_FORM: LeadFormState = {
  customerName: "",
  phone: "",
  group: GROUP_OPTIONS[0],
  channel: CHANNEL_OPTIONS[0],
  staffName: "",
  expectedValue: "",
  demandDescription: "",
};

export default function LeadsPage() {
  const [data, setData] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<LeadFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      setLoading(true);
      setError(null);
      try {
        const leads = await getLeads();
        if (isMounted) {
          setData(leads);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Lead. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createLead({
        customerName: form.customerName,
        phone: form.phone,
        group: form.group,
        channel: form.channel,
        staffName: form.staffName,
        status: "Mới tiếp nhận",
        expectedValue: Number(form.expectedValue),
        demandDescription: form.demandDescription,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể tạo Lead. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<LeadRecord>[] = [
    {
      header: "Khách hàng / Đầu mối",
      accessorKey: "customerName",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.customerName}</div>
          <div className="text-[11px] text-slate-500">{item.demandDescription}</div>
        </div>
      ),
    },
    {
      header: "Số điện thoại",
      accessorKey: "phone",
      cell: (item) => (
        <span className="font-mono font-semibold text-vnpt">{item.phone}</span>
      ),
    },
    {
      header: "Nhóm cơ hội",
      accessorKey: "group",
      cell: (item) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
          {item.group}
        </span>
      ),
    },
    {
      header: "Kênh phát triển",
      accessorKey: "channel",
      cell: (item) => (
        <span className="font-medium text-slate-600">{item.channel}</span>
      ),
    },
    {
      header: "AM Phụ trách",
      accessorKey: "staffName",
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      header: "Giá trị dự kiến",
      accessorKey: "expectedValue",
      cell: (item) => (
        <span className="font-semibold text-slate-900">
          {item.expectedValue.toLocaleString("vi-VN")} ₫
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Quản lý Lead & Cơ hội kinh doanh
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi cơ hội từ tiếp nhận đến chốt gói cước và chuyển đổi thành hợp đồng
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
          <span className="btn-label">Tạo Lead mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="LEAD ĐƯỢC GIAO"
          value="320"
          subtitle="Trong kỳ tháng T"
          icon={Target}
        />
        <KpiCard
          title="ĐÃ LIÊN HỆ"
          value="278"
          subtitle="Tỷ lệ tiếp cận: 86.9%"
          icon={PhoneCall}
        />
        <KpiCard
          title="CHỐT THÀNH CÔNG"
          value="126"
          subtitle="Tỷ lệ chốt: 39.4%"
          icon={CheckCircle2}
        />
        <KpiCard
          title="ĐANG TƯ VẤN"
          value="84"
          subtitle="Đang chăm sóc bám sát"
          icon={TrendingUp}
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Lead
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Lead...
        </div>
      ) : (
        <DataTable
          title="Danh sách Lead & Cơ hội"
          subtitle="Quản lý phễu khách hàng theo từng kênh và từng AM phụ trách"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo tên Lead, SĐT, kênh phát triển..."
          exportFileName="vnpt_leads"
        />
      )}

      {/* Create Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Tạo Lead mới</h3>
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
                  Tên khách hàng / Đầu mối
                </label>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Số điện thoại
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    AM Phụ trách
                  </label>
                  <input
                    required
                    value={form.staffName}
                    onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhóm cơ hội
                  </label>
                  <select
                    value={form.group}
                    onChange={(e) =>
                      setForm({ ...form, group: e.target.value as LeadRecord["group"] })
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
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Kênh phát triển
                  </label>
                  <select
                    value={form.channel}
                    onChange={(e) =>
                      setForm({ ...form, channel: e.target.value as LeadRecord["channel"] })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {CHANNEL_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Giá trị dự kiến (₫)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  value={form.expectedValue}
                  onChange={(e) => setForm({ ...form, expectedValue: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Nhu cầu / Ghi chú
                </label>
                <textarea
                  value={form.demandDescription}
                  onChange={(e) => setForm({ ...form, demandDescription: e.target.value })}
                  rows={2}
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
                  className="rounded-xl bg-vnpt px-3.5 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submitting ? "Đang tạo..." : "Tạo Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
