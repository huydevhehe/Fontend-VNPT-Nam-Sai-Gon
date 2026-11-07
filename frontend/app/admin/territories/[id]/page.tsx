"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { getTerritoryDetail } from "@/lib/api/territories.api";
import type { TerritoryDetail } from "@/lib/crm/types/crm.types";
import OfficialsSection from "@/components/admin/territory/OfficialsSection";
import QuartersSection from "@/components/admin/territory/QuartersSection";
import WardLeadsContractsSection from "@/components/admin/territory/WardLeadsContractsSection";

export default function TerritoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const canEdit = user?.role === "Admin";

  const [detail, setDetail] = useState<TerritoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const data = await getTerritoryDetail(id);
      setDetail(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải chi tiết phường. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    getTerritoryDetail(id)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Không thể tải chi tiết phường. Vui lòng thử lại."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/territories"
          className="text-caption inline-flex items-center gap-1 font-semibold text-vnpt hover:text-vnpt-dark"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Địa bàn Phường
        </Link>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {detail ? `Phường ${detail.territory.wardName}` : "Chi tiết phường"}
        </h2>
        {detail && (
          <p className="text-xs text-slate-500">
            Nhân viên phụ trách: {detail.territory.staffName || "Chưa phân công"} ·{" "}
            {detail.territory.householdCount.toLocaleString("vi-VN")} hộ dân
          </p>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
          <p className="text-sm font-semibold text-rose-700">Không thể tải chi tiết phường</p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : loading || !detail ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-10 text-sm text-slate-500">
          Đang tải chi tiết phường...
        </div>
      ) : (
        <>
          <OfficialsSection
            territoryId={detail.territory.id}
            officials={detail.officials}
            canEdit={canEdit}
            onChanged={reload}
          />
          <QuartersSection
            territoryId={detail.territory.id}
            declaredCount={detail.territory.quarterCount}
            quarters={detail.quarters}
            totals={detail.totals}
            canEdit={canEdit}
            onChanged={reload}
          />
          <WardLeadsContractsSection
            leads={detail.leads}
            contracts={detail.contracts}
            totals={detail.totals}
          />
        </>
      )}
    </div>
  );
}
