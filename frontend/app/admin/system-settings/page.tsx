"use client";

import { useEffect, useState, FormEvent } from "react";
import { Mail, MessageSquare, AlertTriangle, CheckCircle2, ShieldAlert, CreditCard, Send } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  getSystemSettings,
  updateSystemSettings,
  sendTestEmail,
  SystemSettings,
  SmtpMode,
} from "@/lib/api/settings.api";

const DEFAULT_PAYMENT_BENEFICIARY = "VNPT thành phố Hồ Chí Minh";
const DEFAULT_PAYMENT_ACCOUNT_NO = "1058561111";
const DEFAULT_PAYMENT_BANK_NAME = "TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)";
const DEFAULT_PAYMENT_SIGNER_NAME = "Lê Văn Thuần";

type EmailProvider = "gmail" | "outlook" | "other";

const EMAIL_PROVIDER_PRESETS: Record<"gmail" | "outlook", { host: string; port: string }> = {
  gmail: { host: "smtp.gmail.com", port: "465" },
  outlook: { host: "smtp.office365.com", port: "587" },
};

interface FormState {
  smtpMode: SmtpMode;
  emailProvider: EmailProvider;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromName: string;
  smtpFromEmail: string;
  zaloOaId: string;
  zaloOaToken: string;
  paymentBeneficiary: string;
  paymentAccountNo: string;
  paymentBankName: string;
  paymentSignerName: string;
}

const EMPTY_FORM: FormState = {
  smtpMode: "domain",
  emailProvider: "gmail",
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  smtpFromName: "VNPT Nam Sài Gòn",
  smtpFromEmail: "",
  zaloOaId: "",
  zaloOaToken: "",
  paymentBeneficiary: DEFAULT_PAYMENT_BENEFICIARY,
  paymentAccountNo: DEFAULT_PAYMENT_ACCOUNT_NO,
  paymentBankName: DEFAULT_PAYMENT_BANK_NAME,
  paymentSignerName: DEFAULT_PAYMENT_SIGNER_NAME,
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
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

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
          const detectedProvider: EmailProvider =
            data.smtpHost === EMAIL_PROVIDER_PRESETS.gmail.host
              ? "gmail"
              : data.smtpHost === EMAIL_PROVIDER_PRESETS.outlook.host
                ? "outlook"
                : "other";
          setForm({
            smtpMode: data.smtpMode || "domain",
            emailProvider: detectedProvider,
            smtpHost: data.smtpHost,
            smtpPort: data.smtpPort ? String(data.smtpPort) : "",
            smtpUser: data.smtpUser,
            smtpPass: "",
            smtpFromName: data.smtpFromName || "VNPT Nam Sài Gòn",
            smtpFromEmail: data.smtpFromEmail || "",
            zaloOaId: data.zaloOaId,
            zaloOaToken: "",
            paymentBeneficiary: data.paymentBeneficiary || DEFAULT_PAYMENT_BENEFICIARY,
            paymentAccountNo: data.paymentAccountNo || DEFAULT_PAYMENT_ACCOUNT_NO,
            paymentBankName: data.paymentBankName || DEFAULT_PAYMENT_BANK_NAME,
            paymentSignerName: data.paymentSignerName || DEFAULT_PAYMENT_SIGNER_NAME,
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
        smtpMode: form.smtpMode,
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
        smtpUser: form.smtpUser,
        smtpPass: form.smtpPass || undefined,
        smtpFromName: form.smtpFromName,
        smtpFromEmail: form.smtpFromEmail,
        zaloOaId: form.zaloOaId,
        zaloOaToken: form.zaloOaToken || undefined,
        paymentBeneficiary: form.paymentBeneficiary,
        paymentAccountNo: form.paymentAccountNo,
        paymentBankName: form.paymentBankName,
        paymentSignerName: form.paymentSignerName,
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

  async function handleSendTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await sendTestEmail(testTo, {
        smtpMode: form.smtpMode,
        smtpHost: form.smtpHost,
        smtpPort: form.smtpPort ? Number(form.smtpPort) : undefined,
        smtpUser: form.smtpUser,
        smtpPass: form.smtpPass || undefined,
        smtpFromName: form.smtpFromName,
        smtpFromEmail: form.smtpFromEmail,
      });
      if (result.sent) {
        setTestResult({ ok: true, message: "Đã gửi, kiểm tra hộp thư (cả mục Spam)." });
      } else {
        setTestResult({ ok: false, message: result.error || "Gửi thử thất bại." });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message: err instanceof Error ? err.message : "Gửi thử thất bại.",
      });
    } finally {
      setTesting(false);
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

          <div className="mb-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="radio"
                name="smtpMode"
                checked={form.smtpMode === "normal"}
                onChange={() =>
                  setForm((prev) => ({
                    ...prev,
                    smtpMode: "normal",
                    smtpHost: EMAIL_PROVIDER_PRESETS[prev.emailProvider === "outlook" ? "outlook" : "gmail"].host,
                    smtpPort: EMAIL_PROVIDER_PRESETS[prev.emailProvider === "outlook" ? "outlook" : "gmail"].port,
                    emailProvider: prev.emailProvider === "outlook" ? "outlook" : "gmail",
                  }))
                }
              />
              Email thường (Gmail, Outlook…)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="radio"
                name="smtpMode"
                checked={form.smtpMode === "domain"}
                onChange={() => setForm((prev) => ({ ...prev, smtpMode: "domain" }))}
              />
              Email domain riêng
            </label>
          </div>

          {form.smtpMode === "normal" ? (
            <>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Nhà cung cấp
                </label>
                <select
                  value={form.emailProvider === "other" ? "gmail" : form.emailProvider}
                  onChange={(e) => {
                    const provider = e.target.value as "gmail" | "outlook";
                    setForm((prev) => ({
                      ...prev,
                      emailProvider: provider,
                      smtpHost: EMAIL_PROVIDER_PRESETS[provider].host,
                      smtpPort: EMAIL_PROVIDER_PRESETS[provider].port,
                    }));
                  }}
                  className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                >
                  <option value="gmail">Gmail</option>
                  <option value="outlook">Outlook / Office 365</option>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Host
                  </label>
                  <input
                    value={form.smtpHost}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Port
                  </label>
                  <input
                    value={form.smtpPort}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Email đăng nhập
                  </label>
                  <input
                    value={form.smtpUser}
                    onChange={(e) =>
                      setForm({ ...form, smtpUser: e.target.value, smtpFromEmail: e.target.value })
                    }
                    placeholder="ten-cong-ty@gmail.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Mật khẩu ứng dụng{" "}
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
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Tên hiển thị
                  </label>
                  <input
                    value={form.smtpFromName}
                    onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                    placeholder="VNPT Nam Sài Gòn"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                  />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-amber-700">
                Gmail cần <strong>Mật khẩu ứng dụng</strong> (App Password), không dùng mật khẩu đăng nhập.
              </p>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Host
                </label>
                <input
                  value={form.smtpHost}
                  onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                  placeholder="smtp.vnptnamsaigon.vn"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Port
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
                  Tài khoản
                </label>
                <input
                  value={form.smtpUser}
                  onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                  placeholder="noreply@vnptnamsaigon.vn"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Mật khẩu{" "}
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
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Email gửi đi
                </label>
                <input
                  value={form.smtpFromEmail}
                  onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })}
                  placeholder="noreply@vnptnamsaigon.vn"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Tên hiển thị
                </label>
                <input
                  value={form.smtpFromName}
                  onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                  placeholder="VNPT Nam Sài Gòn"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Gửi thử tới
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="ban@example.com"
                className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSendTest}
                disabled={testing || !testTo}
                className="flex items-center gap-1.5 rounded-lg border border-vnpt px-4 py-2 text-sm font-semibold text-vnpt hover:bg-blue-50 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {testing ? "Đang gửi..." : "Gửi thử"}
              </button>
            </div>
            {testResult && (
              <p
                className={`mt-2 text-sm ${testResult.ok ? "text-emerald-600" : "text-rose-600"}`}
              >
                {testResult.message}
              </p>
            )}
          </div>
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

        {/* Thông tin trên đề nghị thanh toán */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4.5 w-4.5 text-vnpt" />
            <h2 className="text-sm font-bold text-slate-900">
              Thông tin trên đề nghị thanh toán
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Đơn vị thụ hưởng
              </label>
              <input
                value={form.paymentBeneficiary}
                onChange={(e) =>
                  setForm({ ...form, paymentBeneficiary: e.target.value })
                }
                placeholder="VNPT thành phố Hồ Chí Minh"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Số tài khoản
              </label>
              <input
                value={form.paymentAccountNo}
                onChange={(e) =>
                  setForm({ ...form, paymentAccountNo: e.target.value })
                }
                placeholder="1058561111"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Ngân hàng
              </label>
              <input
                value={form.paymentBankName}
                onChange={(e) =>
                  setForm({ ...form, paymentBankName: e.target.value })
                }
                placeholder="TMCP Ngoại Thương Việt Nam – CN TP.HCM. (VietcomBank)"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Người ký đại diện
              </label>
              <input
                value={form.paymentSignerName}
                onChange={(e) =>
                  setForm({ ...form, paymentSignerName: e.target.value })
                }
                placeholder="Lê Văn Thuần"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-vnpt focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Thông tin này được tự động điền vào văn bản Đề nghị thanh toán khi xuất file Word.
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
