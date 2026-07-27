"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function ProductRatioChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
