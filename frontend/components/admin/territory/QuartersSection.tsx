"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { QuarterRecord, TerritoryDetail } from "@/lib/crm/types/crm.types";
import { createQuarter, deleteQuarter, updateQuarter } from "@/lib/api/territories.api";

interface QuartersSectionProps {
  territoryId: string;
  declaredCount: number;
  quarters: QuarterRecord[];
  totals: TerritoryDetail["totals"];
  canEdit: boolean;
  onChanged: () => void | Promise<void>;
}

interface FormState {
  name: string;
  headName: string;
  secretaryName: string;
  mttqName: string;
  householdCount: string;
  population: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  headName: "",
  secretaryName: "",
  mttqName: "",
  householdCount: "0",
  population: "0",
};

const fmt = (n: number) => n.toLocaleString("vi-VN");

export default function QuartersSection({
  territoryId,
  declaredCount,
  quarters,
  totals,
  canEdit,
  onChanged,
}: QuartersSectionProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuarterRecord | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setOpen(true);
  }

  function openEdit(q: QuarterRecord) {
    setEditing(q);
    setForm({
      name: q.name,
      headName: q.headName,
      secretaryName: q.secretaryName,
      mttqName: q.mttqName,
      householdCount: String(q.householdCount),
      population: String(q.population),
    });
    setError(null);
    setOpen(true);
  }

  function setField<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const householdCount = Number(form.householdCount);
    const population = Number(form.population);
    if (
      !Number.isInteger(householdCount) ||
      householdCount < 0 ||
      !Number.isInteger(population) ||
      population < 0
    ) {
      setError("Số hộ dân và số dân phải là số nguyên không âm");
      return;
    }

    const payload = {
      name: form.name,
      headName: form.headName,
      secretaryName: form.secretaryName,
      mttqName: form.mttqName,
      householdCount,
      population,
    };

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateQuarter(editing.id, payload);
      } else {
        await createQuarter(territoryId, payload);
      }
      setOpen(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu khu phố thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteQuarter(id);
      setConfirmId(null);
      await onChanged();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Xoá thất bại");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-hidden";

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Khu phố</h3>
          <p className="text-caption mt-0.5 text-slate-500">
            Khai báo: {declaredCount} · Đã nhập chi tiết: {totals.quarterCount}
          </p>
          {actionError && (
            <p role="alert" className="text-caption mt-2 font-semibold text-rose-600">
              {actionError}
            </p>
          )}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openAdd}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-vnpt px-3.5 text-white shadow-xs hover:bg-vnpt-dark"
          >
            <Plus className="h-4 w-4" />
            <span className="btn-label">Thêm khu phố</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-left text-xs">
          <thead className="bg-slate-50/70 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Khu phố</th>
              <th className="px-3 py-3 font-semibold">Trưởng KP</th>
              <th className="px-3 py-3 font-semibold">Bí thư</th>
              <th className="px-3 py-3 font-semibold">MTTQ</th>
              <th className="px-3 py-3 text-right font-semibold">Số hộ dân</th>
              <th className="px-3 py-3 text-right font-semibold">Số dân</th>
              {canEdit && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quarters.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-5 py-6 text-center text-slate-400 italic">
                  Chưa cập nhật khu phố nào
                </td>
              </tr>
            )}
            {quarters.map((q) => (
              <tr key={q.id} data-testid="quarter-row">
                <td className="px-5 py-3 font-semibold text-slate-900">{q.name}</td>
                <td className="px-3 py-3">{q.headName || "—"}</td>
                <td className="px-3 py-3">{q.secretaryName || "—"}</td>
                <td className="px-3 py-3">{q.mttqName || "—"}</td>
                <td className="px-3 py-3 text-right">{fmt(q.householdCount)}</td>
                <td className="px-3 py-3 text-right">{fmt(q.population)}</td>
                {canEdit && (
                  <td className="px-5 py-3 text-right">
                    {confirmId === q.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                        >
                          Xác nhận xoá
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Sửa ${q.name}`}
                          onClick={() => openEdit(q)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-vnpt"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Xoá ${q.name}`}
                          onClick={() => {
                            setActionError(null);
                            setConfirmId(q.id);
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50/70 font-bold text-slate-900">
            <tr>
              <td className="px-5 py-3" colSpan={4}>
                Tổng cộng
              </td>
              <td className="px-3 py-3 text-right" data-testid="quarter-total-households">
                {fmt(totals.householdCount)}
              </td>
              <td className="px-3 py-3 text-right" data-testid="quarter-total-population">
                {fmt(totals.population)}
              </td>
              {canEdit && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-label={editing ? "Sửa khu phố" : "Thêm khu phố"}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editing ? "Sửa khu phố" : "Thêm khu phố"}
              </h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="quarter-name" className="text-form-label mb-1 block text-slate-700">
                  Tên khu phố
                </label>
                <input
                  id="quarter-name"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="quarter-head" className="text-form-label mb-1 block text-slate-700">
                  Trưởng khu phố
                </label>
                <input
                  id="quarter-head"
                  maxLength={100}
                  value={form.headName}
                  onChange={(e) => setField("headName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="quarter-secretary" className="text-form-label mb-1 block text-slate-700">
                  Bí thư
                </label>
                <input
                  id="quarter-secretary"
                  maxLength={100}
                  value={form.secretaryName}
                  onChange={(e) => setField("secretaryName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="quarter-mttq" className="text-form-label mb-1 block text-slate-700">
                  MTTQ
                </label>
                <input
                  id="quarter-mttq"
                  maxLength={100}
                  value={form.mttqName}
                  onChange={(e) => setField("mttqName", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div />
              <div>
                <label htmlFor="quarter-households" className="text-form-label mb-1 block text-slate-700">
                  Số hộ dân
                </label>
                <input
                  id="quarter-households"
                  type="number"
                  min={0}
                  step={1}
                  value={form.householdCount}
                  onChange={(e) => setField("householdCount", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="quarter-population" className="text-form-label mb-1 block text-slate-700">
                  Số dân
                </label>
                <input
                  id="quarter-population"
                  type="number"
                  min={0}
                  step={1}
                  value={form.population}
                  onChange={(e) => setField("population", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-caption mt-3 font-semibold text-rose-600">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-label rounded-xl border border-slate-200 px-3.5 py-2 text-slate-700 hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-label rounded-xl bg-vnpt px-3.5 py-2 text-white hover:bg-vnpt-dark disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
