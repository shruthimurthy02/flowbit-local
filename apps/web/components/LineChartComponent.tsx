"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
} from "recharts";

type TrendPoint = {
  month: string;
  invoiceCount: number;
  totalAmount: number;
};

const colors = {
  invoices: "#6366F1",
  total: "#A855F7",
};

type Props = {
  data: TrendPoint[];
  highlight?: "invoices" | "total";
};

const CustomTooltip = memo(function CustomTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-slate-500">
          {item.name}: <span className="font-medium text-slate-900">
            {item.dataKey === "total"
              ? new Intl.NumberFormat("en-IE", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(item.value ?? 0)
              : item.value}
          </span>
        </p>
      ))}
    </div>
  );
});

export default function LineChartComponent({
  data,
  highlight = "total",
}: Props) {
  const chartData = (data || []).map((d) => ({
    name: d.month,
    invoices: d.invoiceCount,
    total: Number(d.totalAmount || 0),
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="lineInvoices" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.invoices} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.invoices} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="lineTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.total} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors.total} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#CBD5F5" }} />
          <Line
            type="monotone"
            dataKey="invoices"
            name="Invoice volume"
            stroke={colors.invoices}
            strokeWidth={2}
            strokeOpacity={highlight === "total" ? 0.5 : 1}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Invoice value"
            stroke={colors.total}
            strokeWidth={2}
            strokeOpacity={highlight === "invoices" ? 0.5 : 1}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

