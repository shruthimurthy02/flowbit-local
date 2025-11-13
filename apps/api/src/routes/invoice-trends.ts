import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export default function createInvoiceTrendsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        select: {
          date: true,
          totalAmount: true,
        },
        orderBy: { date: "asc" },
      });

      const trendsMap: Record<string, { invoiceCount: number; totalSpend: number }> = {};

      invoices.forEach((invoice) => {
        const month = `${invoice.date.getFullYear()}-${String(invoice.date.getMonth() + 1).padStart(2, "0")}`;
        if (!trendsMap[month]) {
          trendsMap[month] = { invoiceCount: 0, totalSpend: 0 };
        }
        trendsMap[month].invoiceCount += 1;
        trendsMap[month].totalSpend += Number(invoice.totalAmount || 0);
      });

      const response = Object.entries(trendsMap)
        .map(([month, data]) => ({
          month,
          invoiceCount: data.invoiceCount,
          totalSpend: Number(data.totalSpend.toFixed(2)),
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      res.json(response);
    } catch (err) {
      console.error("Error fetching invoice trends:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch invoice trends", message });
    }
  });

  return router;
}
