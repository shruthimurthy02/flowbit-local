import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export default function createStatsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const [invoiceCount, spendAggregate, averageAggregate, pendingCount, paidCount, overdueCount] =
        await Promise.all([
          prisma.invoice.count(),
          prisma.invoice.aggregate({ _sum: { totalAmount: true } }),
          prisma.invoice.aggregate({ _avg: { totalAmount: true } }),
          prisma.invoice.count({ where: { status: { equals: "pending" } } }),
          prisma.invoice.count({ where: { status: { equals: "paid" } } }),
          prisma.invoice.count({ where: { status: { equals: "overdue" } } }),
        ]);

      const totalSpend = Number(spendAggregate._sum.totalAmount || 0);
      const averageInvoiceValue = Number(averageAggregate._avg.totalAmount || 0);

      res.json({
        totalSpend: Number(totalSpend.toFixed(2)),
        totalInvoicesProcessed: invoiceCount,
        documentsUploaded: invoiceCount,
        averageInvoiceValue: Number(averageInvoiceValue.toFixed(2)),
        pendingInvoices: pendingCount,
        paidInvoices: paidCount,
        overdueInvoices: overdueCount,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch stats", message });
    }
  });

  return router;
}
