"use client";

import { useEffect, useState, FormEvent } from "react";
import { CheckSquare, Plus, Clock, AlertTriangle, CheckCircle2, X } from "lucide-react";
import KpiCard from "@/components/admin/shared/KpiCard";
import DataTable, { Column } from "@/components/admin/shared/DataTable";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { getTasks, createTask } from "@/lib/api/tasks.api";
import { TaskRecord, TaskPriority } from "@/lib/crm/types/crm.types";

const PRIORITY_OPTIONS: TaskPriority[] = ["Thấp", "Vừa", "Cao"];

interface TaskFormState {
  title: string;
  relatedTarget: string;
  assignee: string;
  dueDate: string;
  priority: TaskPriority;
  notes: string;
}

const EMPTY_FORM: TaskFormState = {
  title: "",
  relatedTarget: "",
  assignee: "",
  dueDate: "",
  priority: PRIORITY_OPTIONS[1],
  notes: "",
};

export default function TasksPage() {
  const [data, setData] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      setLoading(true);
      setError(null);
      try {
        const tasks = await getTasks();
        if (isMounted) {
          setData(tasks);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Công việc. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const created = await createTask({
        title: form.title,
        relatedTarget: form.relatedTarget,
        assignee: form.assignee,
        dueDate: form.dueDate,
        priority: form.priority,
        status: "Mới",
        notes: form.notes,
      });

      setData((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Không thể giao việc. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<TaskRecord>[] = [
    {
      header: "Tên công việc",
      accessorKey: "title",
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.title}</div>
          {item.notes && (
            <div className="text-[11px] text-slate-400">{item.notes}</div>
          )}
        </div>
      ),
    },
    {
      header: "Khách hàng / Đối tượng liên quan",
      accessorKey: "relatedTarget",
      cell: (item) => (
        <span className="font-semibold text-vnpt">{item.relatedTarget}</span>
      ),
    },
    {
      header: "Người xử lý",
      accessorKey: "assignee",
    },
    {
      header: "Hạn hoàn thành",
      accessorKey: "dueDate",
      cell: (item) => (
        <span className="font-mono text-slate-700 font-semibold">{item.dueDate}</span>
      ),
    },
    {
      header: "Mức ưu tiên",
      accessorKey: "priority",
      cell: (item) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
            item.priority === "Cao"
              ? "bg-rose-100 text-rose-800"
              : item.priority === "Vừa"
              ? "bg-amber-100 text-amber-800"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {item.priority}
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
            Công việc & Nhắc việc chăm sóc
          </h2>
          <p className="text-xs text-slate-500">
            Giao nhiệm vụ đôn đốc công nợ, gia hạn trả trước và chăm sóc khách hàng
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
          <Plus className="h-4 w-4" />
          <span className="btn-label">Giao việc mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="CÔNG VIỆC MỚI"
          value="42"
          subtitle="Chờ tiếp nhận xử lý"
          icon={CheckSquare}
        />
        <KpiCard
          title="ĐANG THỰC HIỆN"
          value="68"
          subtitle="Đang bám sát khách hàng"
          icon={Clock}
        />
        <KpiCard
          title="SẮP ĐẾN HẠN (2 NGÀY)"
          value="17"
          subtitle="Cần tập trung đôn đốc"
          icon={AlertTriangle}
        />
        <KpiCard
          title="ĐÃ HOÀN TẤT"
          value="156"
          subtitle="Trong tháng báo cáo"
          icon={CheckCircle2}
        />
      </div>

      {/* Table */}
      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">
            Không thể tải dữ liệu Công việc
          </p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải dữ liệu Công việc...
        </div>
      ) : (
        <DataTable
          title="Danh sách nhiệm vụ & lịch xử lý"
          subtitle="Hiển thị theo thứ tự ưu tiên và hạn xử lý của từng nhân viên"
          columns={columns}
          data={data}
          searchPlaceholder="Tìm theo tên công việc, khách hàng, người xử lý..."
          exportFileName="vnpt_cong_viec"
        />
      )}

      {/* Create Task Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Giao việc mới</h3>
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
                  Tên công việc
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Khách hàng / Đối tượng liên quan
                </label>
                <input
                  required
                  value={form.relatedTarget}
                  onChange={(e) => setForm({ ...form, relatedTarget: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Người xử lý
                  </label>
                  <input
                    required
                    value={form.assignee}
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Hạn hoàn thành
                  </label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mức ưu tiên
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as TaskPriority })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Ghi chú
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submitting ? "Đang giao..." : "Giao việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
