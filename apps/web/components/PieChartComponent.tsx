"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const colors = ["#6366F1", "#F97316", "#0EA5E9", "#14B8A6", "#F43F5E", "#A855F7"];

export default function PieChartComponent({ data }: { data: any[] }) {
  const chartData = (data || []).map((item) => ({
    name: item.categoryName || item.category || item.name,
    value: Number(item.totalAmount || item.value || 0),
  }));

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("en-IE", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(value)
            }
            contentStyle={{ borderRadius: 12, borderColor: "#E2E8F0" }}
          />
          <Pie
            data={chartData}
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={4}
          >
            {chartData.map((_, idx) => (
              <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors[idx % colors.length] }}
            />
            <span className="font-medium text-slate-700">{item.name}</span>
            <span>
              {((item.value / (total || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
