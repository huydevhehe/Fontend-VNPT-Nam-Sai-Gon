"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function RevenueChart({ data }: { data: { date: string; doanhSo: number; hoaHong: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}tr`}
        />
        <Tooltip
          formatter={(value, name) => [`${value} triệu đ`, name]}
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="doanhSo"
          name="Doanh số (triệu đ)"
          stroke="#0068b3"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          type="monotone"
          dataKey="hoaHong"
          name="Hoa hồng (triệu đ)"
          stroke="#f97316"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
