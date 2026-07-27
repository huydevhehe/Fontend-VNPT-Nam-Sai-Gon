"use client";

import { useState, type FormEvent } from "react";
import { CTV_PROFILE } from "@/content/ctv-mock";

export default function CtvSettingsForm() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Họ và tên</label>
          <input
            type="text"
            defaultValue={CTV_PROFILE.name}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-vnpt"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Mã CTV</label>
          <input
            type="text"
            defaultValue={CTV_PROFILE.code}
            disabled
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Số điện thoại</label>
          <input
            type="tel"
            defaultValue="0912 345 678"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-vnpt"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
          <input
            type="email"
            defaultValue="minh.nguyen@example.com"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-vnpt"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Ngân hàng</label>
          <input
            type="text"
            defaultValue="Vietcombank - CN Quận 7"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-vnpt"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">Số tài khoản</label>
          <input
            type="text"
            defaultValue="0071000123456"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-vnpt"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
        <button type="submit" className="rounded-md bg-vnpt px-5 py-2.5 text-sm font-semibold text-white hover:bg-vnpt-dark">
          Lưu thay đổi
        </button>
        {saved && <span className="text-xs font-semibold text-emerald-600">Đã lưu thay đổi (demo).</span>}
      </div>
    </form>
  );
}
