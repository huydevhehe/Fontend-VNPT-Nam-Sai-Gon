"use client";

import { useEffect, useState, FormEvent } from "react";
import { X, Pencil, Trash2, Plus } from "lucide-react";
import {
  CustomerTeamRecord,
  getCustomerTeams,
  createCustomerTeam,
  updateCustomerTeam,
  deleteCustomerTeam,
} from "@/lib/api/customer-teams.api";

interface TeamManagerProps {
  onClose: () => void;
  /** Gọi lại khi danh sách team thay đổi (tạo/sửa/xóa) để trang cha refresh. */
  onChanged?: () => void;
}

export default function TeamManager({ onClose, onChanged }: TeamManagerProps) {
  const [teams, setTeams] = useState<CustomerTeamRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerTeams();
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách team");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getCustomerTeams();
        if (isMounted) setTeams(data);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Không thể tải danh sách team");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setNote("");
    setEditingId(null);
    setFormError(null);
  }

  function startEdit(team: CustomerTeamRecord) {
    setEditingId(team.id);
    setName(team.name);
    setNote(team.note || "");
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Vui lòng nhập tên team");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateCustomerTeam(editingId, { name: name.trim(), note: note.trim() || undefined });
      } else {
        await createCustomerTeam({ name: name.trim(), note: note.trim() || undefined });
      }
      resetForm();
      await reload();
      onChanged?.();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Không thể lưu team");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(team: CustomerTeamRecord) {
    setError(null);
    try {
      await deleteCustomerTeam(team.id);
      await reload();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa team");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Quản lý Team khách hàng</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mb-4 space-y-2 rounded-xl border border-slate-200 p-3">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên team (ví dụ: NOVA)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú (tuỳ chọn)"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
            />
          </div>
          {formError && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {formError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy sửa
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1 rounded-lg bg-vnpt px-3 py-1.5 text-xs font-bold text-white hover:bg-vnpt-dark disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              {editingId ? "Lưu" : "Thêm team"}
            </button>
          </div>
        </form>

        {error && (
          <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="py-6 text-center text-xs text-slate-400">Đang tải...</p>
        ) : teams.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">Chưa có team nào</p>
        ) : (
          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-800">{team.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {team.customerCount} khách hàng{team.note ? ` · ${team.note}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(team)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-vnpt"
                    title="Sửa"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(team)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Xóa"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
