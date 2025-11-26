"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";

import {
  fetchStats,
  fetchInvoiceTrends,
  fetchTopVendors,
  fetchCategorySpend,
  fetchCashOutflow,
  fetchInvoices,
} from "@/lib/api";
import LineChartComponent from "@/components/LineChartComponent";
import BarChartHorizontal from "@/components/BarChartHorizontal";
import PieChartComponent from "@/components/PieChartComponent";
import BarChartVertical from "@/components/BarChartVertical";
import InvoiceTable from "@/components/InvoiceTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorBlock } from "@/components/error-block";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState("90d");
  const [highlight, setHighlight] = useState<"invoices" | "total">("total");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [s, t, v, c, cf, inv] = await Promise.all([
        fetchStats(),
        fetchInvoiceTrends(),
        fetchTopVendors(),
        fetchCategorySpend(),
        fetchCashOutflow(),
        fetchInvoices({ perPage: 10 }),
      ]);

      setStats(s);
      setTrends(t);
      setVendors(v);
      setCategories(c);
      setCashflow(cf);
      setInvoices(inv);
    } catch (err: any) {
      console.error("Failed to load dashboard", err);
      setError(err?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Flowbit Pulse
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Real-time spend intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring {stats?.totalInvoicesProcessed ?? "—"} invoices this fiscal year.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quick filters</DialogTitle>
                <DialogDescription>
                  Choose which data points and statuses appear in your dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Include statuses</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                    {["Paid", "Pending", "Processing", "Overdue"].map((status) => (
                      <span
                        key={status}
                        className="rounded-full border border-slate-200 px-3 py-1"
                      >
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Vendors</p>
                  <p className="text-sm text-slate-500">
                    Currently showing your top 10 vendors by spend.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost">Reset</Button>
                <Button>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <MetricGrid stats={stats} />

      <ChartCard
        className="w-full"
        title="Invoice volume & value"
        description="Daily aggregation across automation flows"
        action={
          <Tabs value={highlight} onValueChange={(val) => setHighlight(val as "invoices" | "total")}>
            <TabsList>
              <TabsTrigger value="invoices">Volume</TabsTrigger>
              <TabsTrigger value="total">Value</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <LineChartComponent data={trends} highlight={highlight} />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-1"
          title="Spend by vendor"
          description="Top counterparties this period"
        >
          <BarChartHorizontal data={vendors} />
        </ChartCard>

        <ChartCard title="Spend by category" description="Distribution by GL code">
          <PieChartComponent data={categories} />
        </ChartCard>

        <ChartCard title="Cash outflow forecast" description="Projection based on approvals">
          <BarChartVertical data={cashflow} />
        </ChartCard>
      </div>

      <ChartCard title="Invoices" description="Latest records synced from ERP">
        <InvoiceTable data={invoices?.rows ?? []} />
      </ChartCard>
    </div>
  );
}
