"use client";

import { useEffect, useState, FormEvent } from "react";
import { Mail, MessageSquare, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getSystemSettings,
  updateSystemSettings,
  SystemSettings,
} from "@/lib/api/settings.api";

interface FormState {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  zaloOaId: string;
  zaloOaToken: string;
}

const EMPTY_FORM: FormState = {
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  zaloOaId: "",
  zaloOaToken: "",
};

export default function SystemSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAdmin = user?.role === "Admin";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadSettings() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSystemSettings();
        if (isMounted) {
          setSettings(data);
          setForm({
            smtpHost: data.smtpHost,
            smtpPort: data.smtpPort ? String(data.smtpPort) : "",
            smtpUser: data.smtpUser,
            smtpPass: "",
            zaloOaId: data.zaloOaId,
            zaloOaToken: "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải Cài đặt hệ thống. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const updated = await updateSystemSettings({
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
        smtpUser: form.smtpUser,
        smtpPass: form.smtpPass || undefined,
        zaloOaId: form.zaloOaId,
        zaloOaToken: form.zaloOaToken || undefined,
      });
      setSettings(updated);
      setForm((prev) => ({ ...prev, smtpPass: "", zaloOaToken: "" }));
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Lưu Cài đặt hệ thống thất bại."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
        <ShieldAlert className="h-6 w-6 text-rose-500" />
        <p className="text-sm font-medium text-rose-700">
          Chỉ Admin được phép xem và cập nhật Cài đặt hệ thống.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
        Đang tải Cài đặt hệ thống...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
        <p className="text-sm font-medium text-rose-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500">
          Cấu hình gửi thông báo qua Email (SMTP) và Zalo OA ngay trong CMS — không
          cần sửa file .env trên server.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SMTP */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-4.5 w-4.5 text-vnpt" />
            <h2 className="text-sm font-bold text-slate-900">Email / SMTP</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                SMTP Host
              </label>
              <input
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                SMTP Port
              </label>
              <input
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
                placeholder="587"
                inputMode="numeric"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                SMTP User
              </label>
              <input
                value={form.smtpUser}
                onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                placeholder="noreply@vnpt.vn"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                SMTP Password{" "}
                {settings?.smtpPassSet && (
                  <span className="font-normal text-emerald-600">(đã có — để trống nếu giữ nguyên)</span>
                )}
              </label>
              <input
                type="password"
                value={form.smtpPass}
                onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                placeholder={settings?.smtpPassSet ? "••••••••" : ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Để trống toàn bộ Host/User/Password: hệ thống tự gửi qua hộp thư test
            Ethereal (không gửi được cho người dùng thật, chỉ dùng kiểm thử).
          </p>
        </div>

        {/* Zalo OA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-vnpt" />
            <h2 className="text-sm font-bold text-slate-900">Zalo OA</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Zalo OA ID
              </label>
              <input
                value={form.zaloOaId}
                onChange={(e) => setForm({ ...form, zaloOaId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Zalo OA Token{" "}
                {settings?.zaloOaTokenSet && (
                  <span className="font-normal text-emerald-600">(đã có — để trống nếu giữ nguyên)</span>
                )}
              </label>
              <input
                type="password"
                value={form.zaloOaToken}
                onChange={(e) => setForm({ ...form, zaloOaToken: e.target.value })}
                placeholder={settings?.zaloOaTokenSet ? "••••••••" : ""}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Chưa có Token thật: hệ thống chỉ ghi log mô phỏng, không gửi Zalo thật.
          </p>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Đã lưu Cài đặt hệ thống.
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-vnpt px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0066a6] disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu Cài đặt"}
          </button>
        </div>
      </form>
    </div>
  );
}
