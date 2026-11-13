"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const user = await login(username.trim(), password);
      if (user.mustChangePassword) {
        router.push("/doi-mat-khau");
        return;
      }
      router.push(
        user.role === "CTV" ? "/cong-tac-vien/dashboard" : "/admin/dashboard"
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // Không phân biệt loại lỗi đăng nhập (sai username hay sai mật khẩu)
      // để tránh dò tài khoản hợp lệ. Giữ nguyên thông báo của server khi
      // mất kết nối hoặc khi tài khoản (đã xác thực đúng mật khẩu) bị chặn
      // theo trạng thái (403: chờ duyệt / chưa được duyệt / ngừng hoạt động).
      if (message.includes("kết nối")) {
        setError(message);
      } else if (err instanceof ApiError && err.status === 403) {
        setError(message);
      } else {
        setError("Sai tài khoản hoặc mật khẩu");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-vnpt-light px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-vnpt-darker">VNPT Nam Sài Gòn</h1>
          <p className="text-caption mt-1 text-slate-500">
            Đăng nhập hệ thống CRM quản trị
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-form-label mb-1.5 block text-slate-700"
            >
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3 pl-10 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden"
                placeholder="VD: admin"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-form-label mb-1.5 block text-slate-700"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pr-3 pl-10 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-caption rounded-lg bg-red-50 px-3 py-2 text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-label flex w-full items-center justify-center rounded-xl bg-vnpt px-4 py-2.5 text-white transition-colors hover:bg-vnpt-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-caption mt-6 text-center text-slate-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/cong-tac-vien/dang-ky"
            className="font-semibold text-vnpt hover:text-vnpt-dark"
          >
            Đăng ký làm CTV
          </Link>
        </p>
      </div>
    </div>
  );
}
