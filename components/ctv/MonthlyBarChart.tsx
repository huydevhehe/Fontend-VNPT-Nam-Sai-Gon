"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function MonthlyBarChart({ data }: { data: { month: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}tr`}
        />
        <Tooltip formatter={(value) => [`${value} triệu đ`, "Doanh số"]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Bar dataKey="value" fill="#0068b3" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
