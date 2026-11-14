"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ServiceRecord } from "@/lib/crm/types/crm.types";
import {
  getCustomerServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/api/services.api";

const SERVICE_GROUPS = ["BRCĐ", "CNTT", "Di động"] as const;
const PAYMENT_METHODS = ["Trả trước", "Trả hàng tháng"] as const;

interface ServiceFormState {
  serviceGroup: (typeof SERVICE_GROUPS)[number];
  serviceName: string;
  packageName: string;
  serviceCode: string;
  paymentType: (typeof PAYMENT_METHODS)[number];
  startDate: string;
  expirationDate: string;
}

const EMPTY_SERVICE_FORM: ServiceFormState = {
  serviceGroup: SERVICE_GROUPS[0],
  serviceName: "",
  packageName: "",
  serviceCode: "",
  paymentType: PAYMENT_METHODS[0],
  startDate: "",
  expirationDate: "",
};

function isExpiringSoon(expirationDate: string): boolean {
  const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / 86400000);
  return days >= 0 && days <= 30;
}

interface CustomerServicesProps {
  customerId: string;
  canManage?: boolean;
}

export default function CustomerServices({ customerId, canManage }: CustomerServicesProps) {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerServices(customerId);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getCustomerServices(customerId);
        if (isMounted) setServices(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách dịch vụ");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [customerId]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_SERVICE_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(service: ServiceRecord) {
    setEditingId(service.id);
    setForm({
      serviceGroup: (service.serviceGroup as ServiceFormState["serviceGroup"]) || SERVICE_GROUPS[0],
      serviceName: service.serviceName,
      packageName: service.packageName || "",
      serviceCode: service.serviceCode,
      paymentType: (service.paymentType as ServiceFormState["paymentType"]) || PAYMENT_METHODS[0],
      startDate: service.startDate,
      expirationDate: service.expirationDate,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingId) {
        await updateService(editingId, { ...form });
      } else {
        await createService({ customerId, ...form });
      }
      setShowForm(false);
      await reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể lưu dịch vụ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(service: ServiceRecord) {
    setError(null);
    try {
      await deleteService(service.id);
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa dịch vụ");
    }
  }

  if (loading) {
    return <p className="text-xs text-slate-400">Đang tải danh sách dịch vụ...</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      {canManage && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1 rounded-lg bg-vnpt px-3 py-1.5 text-xs font-bold text-white hover:bg-vnpt-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm dịch vụ
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Nhóm</th>
              <th className="px-3 py-2">Tên dịch vụ</th>
              <th className="px-3 py-2">Gói</th>
              <th className="px-3 py-2">Mã thuê bao</th>
              <th className="px-3 py-2">Hình thức</th>
              <th className="px-3 py-2">Bắt đầu</th>
              <th className="px-3 py-2">Kết thúc</th>
              {canManage && <th className="px-3 py-2">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 8 : 7} className="px-3 py-6 text-center text-slate-400">
                  Chưa có dịch vụ nào
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr
                  key={service.id}
                  className={isExpiringSoon(service.expirationDate) ? "bg-amber-50" : ""}
                >
                  <td className="px-3 py-2">{service.serviceGroup || "—"}</td>
                  <td className="px-3 py-2 font-semibold text-slate-800">{service.serviceName}</td>
                  <td className="px-3 py-2">{service.packageName || "—"}</td>
                  <td className="px-3 py-2 font-mono">{service.serviceCode}</td>
                  <td className="px-3 py-2">{service.paymentType || "—"}</td>
                  <td className="px-3 py-2">{service.startDate}</td>
                  <td className="px-3 py-2">{service.expirationDate}</td>
                  {canManage && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(service)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-vnpt"
                          title="Sửa"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(service)}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                          title="Xóa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Sửa dịch vụ" : "Thêm dịch vụ"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-group" className="mb-1 block text-xs font-semibold text-slate-600">
                    Nhóm dịch vụ
                  </label>
                  <select
                    id="svc-group"
                    value={form.serviceGroup}
                    onChange={(e) =>
                      setForm({ ...form, serviceGroup: e.target.value as ServiceFormState["serviceGroup"] })
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
                <div>
                  <label htmlFor="svc-payment" className="mb-1 block text-xs font-semibold text-slate-600">
                    Hình thức
                  </label>
                  <select
                    id="svc-payment"
                    value={form.paymentType}
                    onChange={(e) =>
                      setForm({ ...form, paymentType: e.target.value as ServiceFormState["paymentType"] })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="svc-name" className="mb-1 block text-xs font-semibold text-slate-600">
                  Tên dịch vụ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="svc-name"
                  required
                  value={form.serviceName}
                  onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-package" className="mb-1 block text-xs font-semibold text-slate-600">
                    Gói
                  </label>
                  <input
                    id="svc-package"
                    value={form.packageName}
                    onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="svc-code" className="mb-1 block text-xs font-semibold text-slate-600">
                    Mã thuê bao
                  </label>
                  <input
                    id="svc-code"
                    value={form.serviceCode}
                    onChange={(e) => setForm({ ...form, serviceCode: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="svc-start" className="mb-1 block text-xs font-semibold text-slate-600">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="svc-start"
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="svc-end" className="mb-1 block text-xs font-semibold text-slate-600">
                    Ngày kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="svc-end"
                    required
                    type="date"
                    value={form.expirationDate}
                    onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
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
                  className="rounded-xl bg-vnpt px-3.5 py-2 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
                >
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
