"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BarChartVertical({ data }: { data: any[] }) {
  const chartData = (data || []).map((item) => ({
    name: item.date || item.month || item.label,
    forecast: Number(item.expectedAmount ?? item.amount ?? item.value ?? 0),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelClassName="text-slate-500"
            contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
          />
          <Bar
            dataKey="forecast"
            fill="url(#barForecast)"
            radius={[10, 10, 4, 4]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

