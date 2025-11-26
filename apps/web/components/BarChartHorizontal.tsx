"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const palette = ["#0EA5E9", "#6366F1", "#14B8A6", "#F97316", "#F43F5E"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BarChartHorizontal({ data }: { data: any[] }) {
  const chartData = (data || []).map((d) => ({
    name: d.vendorName || d.vendor || "Unknown",
    value: Number(d.totalAmount || 0),
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, bottom: 0, top: 10 }}>
          <CartesianGrid horizontal={false} stroke="#E2E8F0" />
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            tick={{ fill: "#475569", fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "#F8FAFC" }}
            formatter={(value: number) => formatCurrency(value)}
            labelClassName="text-slate-500"
            contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={18}>
            {chartData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
