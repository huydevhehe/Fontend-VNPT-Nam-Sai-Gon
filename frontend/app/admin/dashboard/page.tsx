"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  RotateCw,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Target,
} from "lucide-react";
import Link from "next/link";
import KpiCard from "@/components/admin/shared/KpiCard";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { StaffRecord } from "@/lib/crm/types/crm.types";
import {
  getDashboardSummary,
  DashboardKpis,
  DashboardTerritorySummary,
} from "@/lib/api/dashboard.api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function buildKpiChartData(kpis: DashboardKpis | null) {
  return [
    { name: "Thu ngay", "Thực hiện (%)": kpis?.collectionRateImmediate ?? 0, "Mục tiêu (%)": 90 },
    { name: "Nợ lũy kế", "Thực hiện (%)": kpis?.collectionRateCumulative ?? 0, "Mục tiêu (%)": 85 },
    { name: "Gia hạn T", "Thực hiện (%)": kpis?.renewalRateT ?? 0, "Mục tiêu (%)": 70 },
    { name: "Gia hạn T-1", "Thực hiện (%)": kpis?.renewalRateT1 ?? 0, "Mục tiêu (%)": 75 },
  ];
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [territorySummary, setTerritorySummary] =
    useState<DashboardTerritorySummary | null>(null);
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const summary = await getDashboardSummary();
        if (isMounted) {
          setKpis(summary.kpis);
          setTerritorySummary(summary.territorySummary);
          setStaffList(summary.staffList);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải dữ liệu Dashboard. Vui lòng thử lại."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const kpiChartData = buildKpiChartData(kpis);

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Dashboard tổng hợp kinh doanh & CSKH
        </h2>
        <p className="text-xs text-slate-500">
          Theo dõi tỷ lệ hoàn thành các chỉ tiêu nợ, gia hạn trả trước và phễu bán hàng VNPT Nam Sài Gòn.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
          <span className="font-semibold text-rose-700">
            Không thể tải dữ liệu Dashboard:
          </span>
          <span className="text-rose-600">{error}</span>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="TỶ LỆ THU NGAY"
          value={loading ? "..." : `${(kpis?.collectionRateImmediate ?? 0).toFixed(1)}%`}
          subtitle="Tổng đã thu / Tổng phải thu thu ngay"
          icon={Banknote}
          badge="Tháng T"
        />
        <KpiCard
          title="TỶ LỆ NỢ LŨY KẾ"
          value={loading ? "..." : `${(kpis?.collectionRateCumulative ?? 0).toFixed(1)}%`}
          changeText="Mục tiêu: 85%"
          isPositive={false}
          subtitle={
            loading
              ? "Đang tải..."
              : `còn ${(kpis?.totalCumulativeDebtRemaining ?? 0).toLocaleString("vi-VN")} ₫ nợ đọng`
          }
          icon={TrendingUp}
        />
        <KpiCard
          title="GIA HẠN TRẢ TRƯỚC T"
          value={loading ? "..." : `${(kpis?.renewalRateT ?? 0).toFixed(1)}%`}
          subtitle={
            loading
              ? "Đang tải..."
              : `${kpis?.renewalCompletedT ?? 0} / ${kpis?.renewalTotalT ?? 0} giao dịch hoàn thành`
          }
          icon={RotateCw}
        />
        <KpiCard
          title="GIA HẠN TRẢ TRƯỚC T-1"
          value={loading ? "..." : `${(kpis?.renewalRateT1 ?? 0).toFixed(1)}%`}
          subtitle="Theo dữ liệu kỳ Tháng T-1"
          icon={FileCheck2}
        />
      </div>

      {/* Charts & Funnel row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recharts Double Bar Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tiến độ KPI các chương trình CSKH
              </h3>
              <p className="text-xs text-slate-500">
                So sánh tỷ lệ thực hiện thực tế so với mục tiêu tháng T
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-vnpt">
              Kỳ 10/2026
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kpiChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar
                  dataKey="Thực hiện (%)"
                  fill="var(--color-vnpt)"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="Mục tiêu (%)"
                  fill="#93c5fd"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Funnel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Phễu bán hàng & Chuyển đổi
              </h3>
              <p className="text-xs text-slate-500">
                Lead → Khách hàng → Hợp đồng → Doanh thu
              </p>
            </div>
            <Target className="h-5 w-5 text-blue-600" />
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Lead được giao</span>
                <span className="font-bold text-slate-900">320</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-full rounded-full bg-vnpt" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Đã chuyển thành khách hàng</span>
                <span className="font-bold text-slate-900">
                  184 <span className="font-normal text-slate-400">· 57.5%</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#008bd0]"
                  style={{ width: "57.5%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Hợp đồng được tạo</span>
                <span className="font-bold text-slate-900">
                  126 <span className="font-normal text-slate-400">· 39.4%</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: "39.4%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Đã triển khai & có doanh thu</span>
                <span className="font-bold text-slate-900">
                  89 <span className="font-normal text-slate-400">· 27.8%</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: "27.8%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Expiration summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Hợp đồng & Doanh thu
            </h3>
            <span className="text-xs font-bold text-vnpt">126 hợp đồng</span>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Triển khai hoàn tất</span>
              <span className="font-bold text-emerald-600">89</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Đã thanh toán</span>
              <span className="font-bold text-slate-800">102</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Hồ sơ hoàn thiện</span>
              <span className="font-bold text-slate-800">114</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Cảnh báo dịch vụ hết hạn
            </h3>
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
              38 dịch vụ
            </span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <div className="font-bold text-amber-900">Internet Fiber · 18 thuê bao</div>
                <div className="text-[11px] text-amber-700">Hết hạn trong 7 ngày</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold text-rose-900">Chữ ký số SmartCA · 12 khách</div>
                <div className="text-[11px] text-rose-700">Cần báo giá gia hạn gấp</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Địa bàn 7 phường
            </h3>
            <Link
              href="/admin/territories"
              className="flex items-center gap-1 text-xs font-semibold text-vnpt hover:underline"
            >
              <span className="btn-label">Chi tiết</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Tổng số hộ dân</span>
              <span className="font-bold text-slate-800">
                {loading
                  ? "..."
                  : (territorySummary?.totalHouseholds ?? 0).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Đã triển khai & có doanh thu</span>
              <span className="font-bold text-emerald-600">
                {loading
                  ? "..."
                  : `${territorySummary?.totalDeployed ?? 0} / ${territorySummary?.totalWards ?? 0} phường`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff KPI Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Kết quả KPI theo nhân viên
            </h3>
            <p className="text-xs text-slate-500">
              Tỷ lệ thu nợ, gia hạn, số lượng Lead và doanh thu thực hiện thực tế
            </p>
          </div>
          <Link
            href="/admin/employees"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Quản lý nhân viên →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Nhân viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Thu nợ</th>
                <th className="px-4 py-3">Gia hạn</th>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Hợp đồng</th>
                <th className="px-4 py-3 text-right">Đã chốt tháng</th>
                <th className="px-4 py-3 text-right">Đã thu tháng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {staff.name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={staff.role} />
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600">
                    {staff.collectionRate}%
                  </td>
                  <td className="px-4 py-3 font-bold text-vnpt">
                    {staff.renewalRate}%
                  </td>
                  <td className="px-4 py-3">{staff.monthlyLeads}</td>
                  <td className="px-4 py-3">{staff.monthlyContracts}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {(staff.revenue?.closedMonth ?? 0).toLocaleString("vi-VN")} ₫
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {(staff.revenue?.collectedMonth ?? 0).toLocaleString("vi-VN")} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

