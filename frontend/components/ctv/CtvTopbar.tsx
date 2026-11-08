"use client";

import { useEffect, useState } from "react";
import { getCtvMe } from "@/lib/api/ctv.api";
import type { CtvProfile } from "@/lib/crm/types/crm.types";

export default function CtvTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [profile, setProfile] = useState<CtvProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCtvMe()
      .then((me) => {
        if (!cancelled) setProfile(me);
      })
      .catch(() => {
        // Lỗi tải hồ sơ không chặn nội dung trang; 401 đã được xử lý bởi layout.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const name = profile?.name ?? "";
  const initial = name.trim().split(/\s+/).slice(-1).join("").charAt(0).toUpperCase();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-vnpt-light text-sm font-bold text-vnpt">
          {initial || "·"}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-xs font-semibold text-slate-800">{name || "Đang tải..."}</div>
          <div className="text-[11px] text-slate-400">
            Cộng tác viên{profile?.referralCode ? ` - Mã ${profile.referralCode}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
