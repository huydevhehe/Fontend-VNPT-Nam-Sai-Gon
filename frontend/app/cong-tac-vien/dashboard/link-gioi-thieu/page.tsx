"use client";

import { useEffect, useState } from "react";
import { Percent, Share2, UserPlus } from "lucide-react";
import CtvTopbar from "@/components/ctv/CtvTopbar";
import CopyLinkBox from "@/components/ctv/CopyLinkBox";
import { getCtvMe, getCtvSummary } from "@/lib/api/ctv.api";
import type { CtvProfile, CtvSummary } from "@/lib/crm/types/crm.types";
import { categories } from "@/content/category-map";

export default function LinkGioiThieuPage() {
  const [profile, setProfile] = useState<CtvProfile | null>(null);
  const [summary, setSummary] = useState<CtvSummary | null>(null);
  const [origin, setOrigin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCtvMe(), getCtvSummary()])
      .then(([me, s]) => {
        if (cancelled) return;
        setOrigin(window.location.origin);
        setProfile(me);
        setSummary(s);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không tải được dữ liệu");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const baseLink =
    profile?.referralCode && origin ? `${origin}/ref/${profile.referralCode}` : "";
  const rate =
    summary && summary.totalLeads > 0
      ? Math.round((summary.successfulLeads / summary.totalLeads) * 100)
      : 0;

  const stats = [
    { id: "ref-total-leads", icon: UserPlus, value: summary ? String(summary.totalLeads) : "…", label: "Khách hàng đã giới thiệu" },
    { id: "ref-successful-leads", icon: Share2, value: summary ? String(summary.successfulLeads) : "…", label: "Chốt thành công" },
    { id: "ref-success-rate", icon: Percent, value: summary ? `${rate}%` : "…", label: "Tỷ lệ chốt thành công" },
  ];

  return (
    <div>
      <CtvTopbar title="Link giới thiệu" subtitle="Chia sẻ link giới thiệu để nhận hoa hồng" />

      <div className="space-y-4 p-6">
        {error && (
          <div role="alert" className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.id}
              data-testid={s.id}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-vnpt-light text-vnpt">
                <s.icon size={18} />
              </span>
              <div className="mt-3 text-xl font-extrabold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-slate-800">Link giới thiệu chung</h2>
          {profile?.referralCode && (
            <p className="mb-3 text-xs text-slate-500">
              Mã giới thiệu của bạn: <span className="font-semibold text-slate-800">{profile.referralCode}</span>
            </p>
          )}
          {baseLink ? (
            <CopyLinkBox link={baseLink} />
          ) : (
            <p className="text-xs text-slate-400">Đang tải...</p>
          )}
        </div>

        {baseLink && (
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Link giới thiệu theo dịch vụ</h2>
            <div className="space-y-3">
              {categories.map((c) => (
                <div key={c.slug} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-vnpt-light text-vnpt">
                    <c.icon size={15} />
                  </span>
                  <span className="w-40 shrink-0 text-sm font-medium text-slate-700">{c.name}</span>
                  <div className="flex-1">
                    <CopyLinkBox link={`${baseLink}?to=/san-pham/${c.slug}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
