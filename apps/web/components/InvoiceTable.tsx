"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type InvoiceRow = {
  id: string;
  vendor: string;
  date: string;
  invoiceNumber: string;
  amount?: number;
  totalAmount?: number;
  status?: string;
};

const statusIntent: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  paid: "success",
  approved: "success",
  pending: "warning",
  processing: "warning",
  overdue: "destructive",
  rejected: "destructive",
};

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return "€0";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InvoiceTable({ data }: { data: InvoiceRow[] }) {
  const rows = data ?? [];

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        No invoices available for this view.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/80">
        <TableRow className="border-b border-slate-100">
          <TableHead>Vendor</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Invoice #</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const amount = Number(row.amount ?? row.totalAmount ?? 0);
          const intent = statusIntent[row.status?.toLowerCase() ?? ""] ?? "secondary";

          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium text-slate-900">
                {row.vendor || "Unknown vendor"}
              </TableCell>
              <TableCell>
                {row.date ? new Date(row.date).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-slate-500">
                {row.invoiceNumber}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(amount)}
              </TableCell>
              <TableCell>
                <Badge variant={intent}>{row.status ?? "Unknown"}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
