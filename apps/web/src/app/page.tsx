"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

interface StatsResponse {
  totalSpend: number;
  totalInvoicesProcessed: number;
  documentsUploaded: number;
  averageInvoiceValue: number;
}

interface TrendResponse {
  month: string;
  invoiceCount: number;
  totalSpend: number;
}

interface VendorResponse {
  vendor: string;
  totalSpend: number;
}

interface CategoryResponse {
  category: string;
  totalSpend: number;
}

interface OutflowResponse {
  dueDateRange: string;
  totalAmount: number;
}

interface InvoiceItem {
  id: number;
  invoiceNumber: string;
  vendor: string;
  customer: string;
  date: string;
  totalAmount: number;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [trends, setTrends] = useState<TrendResponse[]>([]);
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [outflow, setOutflow] = useState<OutflowResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, trendsRes, vendorsRes, categoriesRes, outflowRes, invoicesRes] =
          await Promise.all([
            axios.get<StatsResponse>(`${API_BASE}/stats`, { signal: controller.signal }),
            axios.get<TrendResponse[]>(`${API_BASE}/invoice-trends`, { signal: controller.signal }),
            axios.get<VendorResponse[]>(`${API_BASE}/vendors/top10`, { signal: controller.signal }),
            axios.get<CategoryResponse[]>(`${API_BASE}/category-spend`, { signal: controller.signal }),
            axios.get<OutflowResponse[]>(`${API_BASE}/cash-outflow`, { signal: controller.signal }),
            axios.get<{ invoices: InvoiceItem[] }>(`${API_BASE}/invoices`, {
              signal: controller.signal,
              params: { page: 1, per_page: 8 },
            }),
          ]);

        setStats(statsRes.data);
        setTrends(trendsRes.data || []);
        setVendors(vendorsRes.data || []);
        setCategories(categoriesRes.data || []);
        setOutflow(outflowRes.data || []);
        setInvoices(invoicesRes.data?.invoices || []);
      } catch (err: any) {
        if (!axios.isCancel(err)) {
          setError(err?.message || "Failed to load dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const trendChart = useMemo(() => {
    if (!trends.length) return null;
    return {
      labels: trends.map((item) => item.month),
      datasets: [
        {
          label: "Total Spend",
          data: trends.map((item) => item.totalSpend),
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.15)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [trends]);

  const vendorChart = useMemo(() => {
    if (!vendors.length) return null;
    return {
      labels: vendors.map((v) => v.vendor),
      datasets: [
        {
          label: "Total Spend",
          data: vendors.map((v) => v.totalSpend),
          backgroundColor: "rgba(52, 211, 153, 0.75)",
          borderRadius: 12,
        },
      ],
    };
  }, [vendors]);

  const categoryChart = useMemo(() => {
    if (!categories.length) return null;
    const palette = ["#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];
    return {
      labels: categories.map((c) => c.category),
      datasets: [
        {
          data: categories.map((c) => c.totalSpend),
          backgroundColor: categories.map((_, index) => palette[index % palette.length]),
        },
      ],
    };
  }, [categories]);

  const outflowChart = useMemo(() => {
    if (!outflow.length) return null;
    return {
      labels: outflow.map((o) => o.dueDateRange),
      datasets: [
        {
          label: "Outflow Amount",
          data: outflow.map((o) => o.totalAmount),
          backgroundColor: "rgba(244, 114, 182, 0.8)",
          borderRadius: 10,
        },
      ],
    };
  }, [outflow]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-lg font-semibold text-indigo-500 animate-pulse">Preparing your analytics dashboard…</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-2">Unable to load dashboard</h2>
          <p className="text-sm text-gray-600 mb-6">
            {error || "Something went wrong while fetching analytics. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white font-medium shadow hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 md:p-10">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-indigo-400">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">Flowbit Analytics</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-lg">
            Monitor spending trends, vendor performance, and upcoming cash outflows — all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-white px-4 py-2 shadow-sm text-sm text-slate-500">
            API base: <span className="font-semibold text-indigo-600">{API_BASE}</span>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Spend (YTD)" value={formatCurrency(stats.totalSpend)} subtitle="Across all invoices" />
        <StatCard title="Total Invoices" value={stats.totalInvoicesProcessed} subtitle="Processed to date" />
        <StatCard title="Documents Uploaded" value={stats.documentsUploaded} subtitle="Digitized for review" />
        <StatCard title="Avg Invoice Value" value={formatCurrency(stats.averageInvoiceValue)} subtitle="Rolling 12 months" />
      </section>

      {/* Charts */}
      <section className="mt-10 grid gap-6 2xl:grid-cols-3">
        <DashboardCard title="Invoice Trends" description="Monthly spend and volume evolution" className="2xl:col-span-2">
          {trendChart ? (
            <Line
              data={trendChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: "bottom" },
                  tooltip: { callbacks: { label: (item) => `${item.dataset.label}: ${formatCurrency(Number(item.raw))}` } },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => formatCurrency(Number(value)),
                    },
                  },
                },
              }}
            />
          ) : (
            <EmptyState message="No trend data available" />
          )}
        </DashboardCard>

        <DashboardCard title="Top Vendors" description="Vendors ranked by spend impact">
          {vendorChart ? (
            <Bar
              data={vendorChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (item) => `${item.dataset.label}: ${formatCurrency(Number(item.raw))}`,
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => formatCurrency(Number(value)),
                    },
                  },
                },
              }}
            />
          ) : (
            <EmptyState message="Vendor spend data will appear here" />
          )}
        </DashboardCard>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <DashboardCard title="Spend by Category" description="Allocation across expense categories">
          {categoryChart ? (
            <Pie
              data={categoryChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    callbacks: {
                      label: (item) => `${item.label}: ${formatCurrency(Number(item.raw))}`,
                    },
                  },
                },
              }}
            />
          ) : (
            <EmptyState message="Category spend data coming soon" />
          )}
        </DashboardCard>

        <DashboardCard title="Cash Outflow Forecast" description="Upcoming payment commitments">
          {outflowChart ? (
            <Bar
              data={outflowChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (item) => `${formatCurrency(Number(item.raw))}`,
                    },
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => formatCurrency(Number(value)),
                    },
                  },
                },
              }}
            />
          ) : (
            <EmptyState message="Cashflow forecast requires payment schedules" />
          )}
        </DashboardCard>
      </section>

      {/* Invoices table */}
      <section className="mt-10 rounded-3xl bg-white/90 p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Recent Invoices</h2>
            <p className="text-sm text-slate-500">Latest eight invoices synced from Flowbit AI ingestion.</p>
          </div>
          <a
            href="/chat-with-data"
            className="inline-flex items-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-600"
          >
            Ask Flowbit AI ↗
          </a>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-slate-500">
                <th className="py-3 pr-4">Invoice</th>
                <th className="py-3 pr-4">Vendor</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {invoices.length ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-indigo-50/50">
                    <td className="py-3 pr-4 font-mono text-xs text-slate-500">{invoice.invoiceNumber}</td>
                    <td className="py-3 pr-4 font-medium">{invoice.vendor}</td>
                    <td className="py-3 pr-4">{invoice.customer}</td>
                    <td className="py-3 pr-4">{new Date(invoice.date).toLocaleDateString()}</td>
                    <td className="py-3 pr-4 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : invoice.status === "overdue"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No invoices available right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur">
      <p className="text-xs uppercase tracking-widest text-indigo-400">{title}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

function DashboardCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative min-h-[300px] rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-black/5 backdrop-blur ${
        className || ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      <div className="h-[260px] w-full">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
      {message}
    </div>
  );
}
