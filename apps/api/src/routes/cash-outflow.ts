import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export default function createCashOutflowRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const unpaidInvoices = await prisma.invoice.findMany({
        where: {
          status: {
            notIn: ["paid", "complete"],
          },
        },
        select: {
          date: true,
          totalAmount: true,
        },
        orderBy: { date: "asc" },
      });

      const now = new Date();
      const outflowMap: Record<string, { totalAmount: number; invoiceCount: number }> = {
        Overdue: { totalAmount: 0, invoiceCount: 0 },
        "This Month": { totalAmount: 0, invoiceCount: 0 },
        "Next 3 Months": { totalAmount: 0, invoiceCount: 0 },
        "Next 6 Months": { totalAmount: 0, invoiceCount: 0 },
        "Beyond 6 Months": { totalAmount: 0, invoiceCount: 0 },
      };

      unpaidInvoices.forEach((invoice) => {
        const dueDate = new Date(invoice.date);
        dueDate.setDate(dueDate.getDate() + 30);

        const daysFromNow = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        let bucket: keyof typeof outflowMap;
        if (daysFromNow < 0) bucket = "Overdue";
        else if (daysFromNow <= 30) bucket = "This Month";
        else if (daysFromNow <= 90) bucket = "Next 3 Months";
        else if (daysFromNow <= 180) bucket = "Next 6 Months";
        else bucket = "Beyond 6 Months";

        outflowMap[bucket].totalAmount += Number(invoice.totalAmount || 0);
        outflowMap[bucket].invoiceCount += 1;
      });

      const response = Object.entries(outflowMap)
        .filter(([, data]) => data.invoiceCount > 0)
        .map(([dueDateRange, data]) => ({
          dueDateRange,
          totalAmount: Number(data.totalAmount.toFixed(2)),
          invoiceCount: data.invoiceCount,
        }));

      res.json(response);
    } catch (err) {
      console.error("Error fetching cash outflow:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch cash outflow", message });
    }
  });

  return router;
}
