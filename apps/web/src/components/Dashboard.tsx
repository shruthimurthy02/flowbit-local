"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_BASE_URL } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
  totalInvoices: number;
  totalRevenue: string;
  pendingInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  averageInvoiceAmount: string;
}

interface InvoiceTrend {
  month: string;
  total: string;
  count: number;
}

interface TopVendor {
  vendorId: string;
  name: string;
  totalSpent: string;
  invoiceCount: number;
}

interface CategorySpend {
  category: string;
  total: string;
  count: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: { name: string };
  customer: { name: string };
  issueDate: string;
  dueDate: string;
  status: string;
  total: string;
}

interface InvoicesResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<InvoiceTrend[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [categories, setCategories] = useState<CategorySpend[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("issueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTrends();
    fetchTopVendors();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [searchQuery, currentPage, sortBy, sortOrder]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/invoices/trends`);
      const data = await res.json();
      setTrends(data);
    } catch (error) {
      console.error("Error fetching trends:", error);
    }
  };

  const fetchTopVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors/top10`);
      const data = await res.json();
      setTopVendors(data);
    } catch (error) {
      console.error("Error fetching top vendors:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/category-spend`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: currentPage.toString(),
        per_page: "20",
        sort: sortBy,
        order: sortOrder,
      });
      const res = await fetch(`${API_BASE_URL}/invoices?${params}`);
      const data: InvoicesResponse = await res.json();
      setInvoices(data.invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const trendData = {
    labels: trends.map((t) => t.month),
    datasets: [
      {
        label: "Total Revenue",
        data: trends.map((t) => parseFloat(t.total)),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
      },
    ],
  };

  const vendorData = {
    labels: topVendors.map((v) => v.name),
    datasets: [
      {
        label: "Total Spent",
        data: topVendors.map((v) => parseFloat(v.totalSpent)),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
      },
    ],
  };

  const categoryData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => parseFloat(c.total)),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
      },
    ],
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalInvoices}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${parseFloat(stats.totalRevenue).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.pendingInvoices}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">
                {stats.overdueInvoices}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={trendData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={vendorData} options={{ responsive: true }} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie data={categoryData} options={{ responsive: true }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="mt-4"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("invoiceNumber")}
                  >
                    Invoice #
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("vendor")}
                  >
                    Vendor
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("customer")}
                  >
                    Customer
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("issueDate")}
                  >
                    Issue Date
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("dueDate")}
                  >
                    Due Date
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("total")}
                  >
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.vendor.name}</TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell>${parseFloat(invoice.total).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
