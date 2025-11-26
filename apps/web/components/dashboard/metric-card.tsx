import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type Trend = "up" | "down" | "neutral";

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: Trend;
  delta?: string;
  icon?: LucideIcon;
  className?: string;
};

const trendStyles: Record<Trend, string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  neutral: "text-slate-600 bg-slate-100",
};

export function MetricCard({ label, value, hint, delta, trend = "neutral", icon: Icon, className }: MetricCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          {Icon ? (
            <span className="rounded-full bg-slate-100 p-2 text-slate-500">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <div className="mt-4 text-2xl font-semibold text-slate-900">{value}</div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
          {hint && <span>{hint}</span>}
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trendStyles[trend]
              )}
            >
              {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
              {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
