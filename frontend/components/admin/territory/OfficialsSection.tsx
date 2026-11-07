"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { WARD_UNITS } from "@/lib/crm/constants/org.constants";
import type { WardOfficialRecord } from "@/lib/crm/types/crm.types";
import {
  createWardOfficial,
  deleteWardOfficial,
  updateWardOfficial,
} from "@/lib/api/territories.api";

interface OfficialsSectionProps {
  territoryId: string;
  officials: WardOfficialRecord[];
  canEdit: boolean;
  onChanged: () => void | Promise<void>;
}

interface DialogState {
  unit: string;
  position: string;
  official: WardOfficialRecord | null;
}

export default function OfficialsSection({
  territoryId,
  officials,
  canEdit,
  onChanged,
}: OfficialsSectionProps) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function openAdd(unit: string, position: string) {
    setDialog({ unit, position, official: null });
    setFullName("");
    setPhone("");
    setError(null);
  }

  function openEdit(official: WardOfficialRecord) {
    setDialog({ unit: official.unit, position: official.position, official });
    setFullName(official.fullName);
    setPhone(official.phone);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dialog) return;
    setSaving(true);
    setError(null);
    try {
      if (dialog.official) {
        await updateWardOfficial(dialog.official.id, { fullName, phone });
      } else {
        await createWardOfficial(territoryId, {
          unit: dialog.unit,
          position: dialog.position,
          fullName,
          phone,
        });
      }
      setDialog(null);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu thông tin thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteWardOfficial(id);
      setConfirmId(null);
      await onChanged();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Xoá thất bại");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="border-b border-slate-100 p-5">
        <h3 className="text-sm font-bold text-slate-900">Lãnh đạo &amp; Phòng ban</h3>
        <p className="text-caption mt-0.5 text-slate-500">
          Cấu trúc cố định cho mọi phường: Lãnh đạo Phường và 3 phòng chuyên môn
        </p>
        {actionError && (
          <p role="alert" className="text-caption mt-2 font-semibold text-rose-600">
            {actionError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        {WARD_UNITS.map((u) => (
          <div key={u.unit} className="rounded-xl border border-slate-200 p-4">
            <h4 className="mb-3 text-xs font-bold tracking-wide text-vnpt uppercase">{u.unit}</h4>
            <ul className="space-y-2">
              {u.positions.map((position) => {
                const matches = officials.filter(
                  (o) => o.unit === u.unit && o.position === position
                );
                return (
                  <li key={position} className="text-xs">
                    <div className="text-caption text-slate-500">{position}</div>
                    {matches.length === 0 ? (
                      <div className="flex items-center justify-between gap-2">
                        <span className="italic text-slate-400">Chưa cập nhật</span>
                        {canEdit && (
                          <button
                            type="button"
                            aria-label={`Thêm ${position} ${u.unit}`}
                            onClick={() => openAdd(u.unit, position)}
                            className="btn-label flex items-center gap-1 rounded-lg bg-vnpt px-2.5 py-1 text-white hover:bg-vnpt-dark"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm
                          </button>
                        )}
                      </div>
                    ) : (
                      matches.map((o) => (
                        <div
                          key={o.id}
                          data-testid="official-row"
                          className="flex items-center justify-between gap-2 py-0.5"
                        >
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900">{o.fullName}</span>
                            {o.phone && <span className="ml-2 text-slate-500">{o.phone}</span>}
                          </div>
                          {canEdit &&
                            (confirmId === o.id ? (
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(o.id)}
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
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  aria-label={`Sửa ${o.fullName}`}
                                  onClick={() => openEdit(o)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-vnpt"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Xoá ${o.fullName}`}
                                  onClick={() => {
                                    setActionError(null);
                                    setConfirmId(o.id);
                                  }}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                        </div>
                      ))
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-label={dialog.official ? "Sửa cán bộ" : "Thêm cán bộ"}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {dialog.official ? "Sửa" : "Thêm"} {dialog.position} — {dialog.unit}
              </h3>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setDialog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="official-full-name" className="text-form-label mb-1 block text-slate-700">
                  Họ tên
                </label>
                <input
                  id="official-full-name"
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-hidden"
                />
              </div>
              <div>
                <label htmlFor="official-phone" className="text-form-label mb-1 block text-slate-700">
                  Số điện thoại
                </label>
                <input
                  id="official-phone"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-hidden"
                />
              </div>
              {error && (
                <p role="alert" className="text-caption font-semibold text-rose-600">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialog(null)}
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
