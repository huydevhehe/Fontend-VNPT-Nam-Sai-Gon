"use client";

import { Fragment, useEffect, useState } from "react";
import { getKpiPerformance, type KpiCell, type StaffKpiRow } from "@/lib/api/kpi.api";
import type { KpiKey } from "@/lib/kpi-formula";

const KPI_LABELS: Record<KpiKey, string> = {
  thu_ngay: "Thu ngay",
  ghtt_t: "GHTT tháng T",
  ghtt_t1: "GHTT tháng T+1",
};

const CELL_BY_KEY: Record<KpiKey, keyof StaffKpiRow> = {
  thu_ngay: "thuNgay",
  ghtt_t: "ghttT",
  ghtt_t1: "ghttT1",
};

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function formatScore(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

interface StaffKpiTableProps {
  /** Các chỉ số KPI hiển thị trên bảng này (vd chỉ ["thu_ngay"] ở trang Nợ). */
  kpiKeys: KpiKey[];
}

export default function StaffKpiTable({ kpiKeys }: StaffKpiTableProps) {
  const [month, setMonth] = useState(currentMonth());
  const [rows, setRows] = useState<StaffKpiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getKpiPerformance(month);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải bảng % thực hiện KPI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [month]);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-600">Tháng</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      ) : loading ? (
        <p className="py-6 text-center text-xs text-slate-500">Đang tải...</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-400">Không có dữ liệu cho tháng này</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead className="text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Nhân viên</th>
                {kpiKeys.map((key) => (
                  <th key={key} colSpan={4} className="px-3 py-2 text-center">
                    {KPI_LABELS[key]}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="px-3 py-1" />
                {kpiKeys.map((key) => (
                  <Fragment key={key}>
                    <th className="px-2 py-1">Thực hiện</th>
                    <th className="px-2 py-1">Chỉ tiêu</th>
                    <th className="px-2 py-1">% hoàn thành</th>
                    <th className="px-2 py-1">Điểm</th>
                  </Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.staffName}>
                  <td className="px-3 py-2 font-semibold text-slate-800">{row.staffName}</td>
                  {kpiKeys.map((key) => {
                    const cell: KpiCell = row[CELL_BY_KEY[key]] as KpiCell;
                    return (
                      <Fragment key={key}>
                        <td className="px-2 py-2">{formatPercent(cell.actualRate)}</td>
                        <td className="px-2 py-2">
                          {cell.targetRate === null ? "Chưa có chỉ tiêu" : formatPercent(cell.targetRate)}
                        </td>
                        <td className="px-2 py-2">{formatPercent(cell.completion)}</td>
                        <td className="px-2 py-2 font-bold text-vnpt">{formatScore(cell.score)}</td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
