"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { registerCtv } from "@/lib/api/auth.api";

const USERNAME_PATTERN = /^[A-Za-z0-9_.-]{4,30}$/;
const PHONE_PATTERN = /^0\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  username: string;
  name: string;
  phone: string;
  email: string;
  password: string;
}

const EMPTY_FORM: FormState = { username: "", name: "", phone: "", email: "", password: "" };

// Validate giống backend để báo lỗi sớm; server vẫn là nơi quyết định cuối cùng.
function validate(form: FormState): string | null {
  if (!USERNAME_PATTERN.test(form.username.trim())) {
    return "Tên đăng nhập gồm 4-30 ký tự chữ, số, dấu chấm, gạch dưới hoặc gạch ngang";
  }
  const nameLength = form.name.trim().length;
  if (nameLength < 2 || nameLength > 80) {
    return "Họ tên phải từ 2 đến 80 ký tự";
  }
  if (!PHONE_PATTERN.test(form.phone.trim())) {
    return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0";
  }
  if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
    return "Email không hợp lệ";
  }
  if (form.password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự";
  }
  return null;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 transition-all focus:border-vnpt focus:bg-white focus:outline-hidden";

export default function CtvRegisterPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invalid = validate(form);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await registerCtv({
        username: form.username.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      });
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đăng ký. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-vnpt-light px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-vnpt-darker">Đăng ký làm Cộng tác viên</h1>
          <p className="text-caption mt-1 text-slate-500">
            Điền thông tin bên dưới, tài khoản sẽ được kích hoạt sau khi Admin duyệt
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="text-sm text-slate-700">
              Đăng ký đã được gửi, vui lòng chờ Admin duyệt. Bạn có thể đăng nhập sau khi tài khoản
              được duyệt.
            </p>
            <Link
              href="/login"
              className="btn-label inline-flex w-full items-center justify-center rounded-xl bg-vnpt px-4 py-2.5 text-white transition-colors hover:bg-vnpt-dark"
            >
              Đến trang đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="text-form-label mb-1.5 block text-slate-700">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                disabled={submitting}
                className={INPUT_CLASS}
                placeholder="VD: nguyenvana"
              />
            </div>

            <div>
              <label htmlFor="name" className="text-form-label mb-1.5 block text-slate-700">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                disabled={submitting}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-form-label mb-1.5 block text-slate-700">
                Số điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                disabled={submitting}
                className={INPUT_CLASS}
                placeholder="0909xxxxxx"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-form-label mb-1.5 block text-slate-700">
                Email (không bắt buộc)
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={submitting}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-form-label mb-1.5 block text-slate-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={submitting}
                className={INPUT_CLASS}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            {error && (
              <p className="text-caption rounded-lg bg-red-50 px-3 py-2 text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-label flex w-full items-center justify-center rounded-xl bg-vnpt px-4 py-2.5 text-white transition-colors hover:bg-vnpt-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi đăng ký"}
            </button>

            <p className="text-caption text-center text-slate-500">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-semibold text-vnpt hover:text-vnpt-dark">
                Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
