"use client";

import { useState, type FormEvent } from "react";
import { Building2, Mail, MessageSquare, Phone, Send, ShieldCheck, Tag, User } from "lucide-react";

export default function LeadForm({
  title = "Đăng ký tư vấn",
  subtitle = "Chúng tôi sẽ liên hệ với bạn!",
  interestOptions = ["Internet", "MyTV", "Di động Vinaphone", "Hóa đơn điện tử", "Chữ ký số", "Cloud & IDC", "Chuyển đổi số"],
  showCompany = false,
  showInterest = true,
}: {
  title?: string;
  subtitle?: string;
  interestOptions?: string[];
  showCompany?: boolean;
  /** Ẩn ô "Nhu cầu quan tâm" ở những trang chỉ bán một dịch vụ. */
  showInterest?: boolean;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  const fieldClass =
    "w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-vnpt focus:ring-4 focus:ring-vnpt/10";
  const iconClass = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

  if (submitted) {
    return (
      <div className="rounded-lg border border-vnpt/20 bg-vnpt-light p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-vnpt text-white">
          <ShieldCheck size={20} />
        </div>
        <p className="font-semibold text-vnpt">Cảm ơn bạn đã đăng ký!</p>
        <p className="mt-1 text-sm text-slate-600">
          Đội ngũ VNPT Nam Sài Gòn sẽ liên hệ với bạn trong thời gian sớm nhất.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg shadow-slate-200/70">
      <div className="bg-gradient-to-br from-vnpt-neon to-vnpt-darker px-6 py-5">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-0.5 text-xs text-white/80">{subtitle}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 p-6">
        <div className="relative">
          <User size={16} className={iconClass} />
          <input required name="hoTen" placeholder="Họ và tên*" className={fieldClass} />
        </div>
        <div className="relative">
          <Phone size={16} className={iconClass} />
          <input required name="soDienThoai" placeholder="Số điện thoại*" className={fieldClass} />
        </div>
        <div className="relative">
          <Mail size={16} className={iconClass} />
          <input name="email" type="email" placeholder="Email" className={fieldClass} />
        </div>
        {showCompany && (
          <div className="relative">
            <Building2 size={16} className={iconClass} />
            <input name="tenCongTy" placeholder="Tên công ty" className={fieldClass} />
          </div>
        )}
        {showInterest && (
          <div className="relative">
            <Tag size={16} className={iconClass} />
            <select name="nhuCau" defaultValue="" className={`${fieldClass} text-slate-600`}>
              <option value="" disabled>
                Nhu cầu quan tâm
              </option>
              {interestOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="relative">
          <MessageSquare size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
          <textarea name="loiNhan" placeholder="Lời nhắn (nếu có)" rows={3} className={fieldClass} />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-vnpt py-2.5 text-sm font-semibold text-white transition hover:bg-vnpt-dark hover:shadow-md"
        >
          GỬI THÔNG TIN <Send size={16} />
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <ShieldCheck size={14} className="text-vnpt" /> Thông tin của bạn được bảo mật tuyệt đối
        </p>
      </form>
    </div>
  );
}
