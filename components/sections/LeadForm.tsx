"use client";

import { useState, type FormEvent } from "react";

export default function LeadForm({
  title = "Đăng ký tư vấn",
  subtitle = "Chúng tôi sẽ liên hệ với bạn!",
  interestOptions = ["Internet", "MyTV", "Di động Vinaphone", "Hóa đơn điện tử", "Chữ ký số", "Cloud & IDC", "Chuyển đổi số"],
  showCompany = false,
}: {
  title?: string;
  subtitle?: string;
  interestOptions?: string[];
  showCompany?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-vnpt/20 bg-vnpt-light p-6 text-center">
        <p className="font-semibold text-vnpt">Cảm ơn bạn đã đăng ký!</p>
        <p className="mt-1 text-sm text-slate-600">
          Đội ngũ VNPT Nam Sài Gòn sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="rounded-t-xl bg-vnpt px-6 py-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-xs text-white/80">{subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 p-6">
        <input
          required
          name="hoTen"
          placeholder="Họ và tên*"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <input
          required
          name="soDienThoai"
          placeholder="Số điện thoại*"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        {showCompany && (
          <input
            name="tenCongTy"
            placeholder="Tên công ty"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
          />
        )}
        <select
          name="nhuCau"
          defaultValue=""
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 outline-vnpt"
        >
          <option value="" disabled>
            Nhu cầu quan tâm
          </option>
          {interestOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <textarea
          name="loiNhan"
          placeholder="Lời nhắn (nếu có)"
          rows={3}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-vnpt"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-vnpt-accent py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
        >
          GỬI THÔNG TIN
        </button>
        <p className="text-center text-xs text-slate-400">
          🔒 Thông tin của bạn được bảo mật tuyệt đối
        </p>
      </form>
    </div>
  );
}
