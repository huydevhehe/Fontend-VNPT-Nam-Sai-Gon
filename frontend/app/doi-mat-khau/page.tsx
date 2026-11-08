"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { changePassword } from "@/lib/api/auth.api";

export default function DoiMatKhauPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng điền đầy đủ các thông tin mật khẩu");
      return;
    }

    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    if (newPassword.length > 72) {
      setError("Mật khẩu mới tối đa 72 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        router.push(user?.role === "CTV" ? "/cong-tac-vien/dashboard" : "/admin/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-vnpt-light px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-vnpt/10 text-vnpt">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đổi mật khẩu tài khoản</h1>
          <p className="mt-1 text-xs text-slate-500">
            {user?.mustChangePassword
              ? "Đây là lần đầu đăng nhập bằng mật khẩu mặc định. Vui lòng thiết lập mật khẩu mới để bảo mật tài khoản."
              : "Cập nhật mật khẩu bảo vệ tài khoản của bạn"}
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-50 p-6 text-center text-emerald-800">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="text-sm font-semibold">Đổi mật khẩu thành công!</p>
            <p className="text-xs text-emerald-600">Đang chuyển hướng về trang làm việc...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="text-form-label mb-1.5 block text-slate-700">
                Mật khẩu hiện tại
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3 pl-10 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="text-form-label mb-1.5 block text-slate-700">
                Mật khẩu mới (ít nhất 8 ký tự)
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3 pl-10 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="Nhập mật khẩu mới"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-form-label mb-1.5 block text-slate-700">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3 pl-10 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-vnpt py-2.5 text-center text-sm font-semibold text-white shadow-xs transition-all hover:bg-vnpt-darker disabled:opacity-50"
            >
              {submitting ? "Đang xử lý..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
