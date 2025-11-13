"use client";

import { useState, useEffect } from "react";
import { fetchInvoices, type InvoiceResponse, type Invoice } from "@/lib/api";

interface InvoicesTableProps {
  initialData: InvoiceResponse;
}

export default function InvoicesTable({ initialData }: InvoicesTableProps) {
  const [data, setData] = useState<InvoiceResponse>(initialData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("issueDate");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      try {
        const result = await fetchInvoices({
          q: search || undefined,
          page,
          per_page: 10,
          sort,
          order,
        });
        setData(result);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setLoading(false);
      }
    }
    loadInvoices();
  }, [search, page, sort, order]);

  const handleSort = (field: string) => {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSort(field);
      setOrder("asc");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Invoices</h2>
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-border rounded-lg"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                className="text-left p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("invoiceNumber")}
              >
                Invoice #
              </th>
              <th
                className="text-left p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("vendor")}
              >
                Vendor
              </th>
              <th
                className="text-left p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("customer")}
              >
                Customer
              </th>
              <th
                className="text-left p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("issueDate")}
              >
                Issue Date
              </th>
              <th
                className="text-left p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("status")}
              >
                Status
              </th>
              <th
                className="text-right p-2 cursor-pointer hover:bg-accent"
                onClick={() => handleSort("total")}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : data.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  No invoices found
                </td>
              </tr>
            ) : (
              data.data.map((invoice: Invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-border hover:bg-accent"
                >
                  <td className="p-2">{invoice.invoiceNumber}</td>
                  <td className="p-2">{invoice.vendor.name}</td>
                  <td className="p-2">{invoice.customer.name}</td>
                  <td className="p-2">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        invoice.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : invoice.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    ${Number(invoice.total).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.data.length} of {data.pagination.total} invoices
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {data.pagination.page} of {data.pagination.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.total_pages}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

