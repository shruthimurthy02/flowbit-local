import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export default function createCategoryRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const vendors = await prisma.vendor.findMany({
        select: {
          name: true,
          category: true,
          invoices: {
            select: {
              totalAmount: true,
            },
          },
        },
      });

      const categoryMap: Record<string, { totalSpend: number; invoiceCount: number }> = {};

      vendors.forEach((vendor) => {
        const category = vendor.category || "Uncategorized";
        if (!categoryMap[category]) {
          categoryMap[category] = { totalSpend: 0, invoiceCount: 0 };
        }

        vendor.invoices.forEach((invoice) => {
          categoryMap[category].totalSpend += Number(invoice.totalAmount || 0);
          categoryMap[category].invoiceCount += 1;
        });
      });

      const response = Object.entries(categoryMap)
        .map(([category, data]) => ({
          category,
          totalSpend: Number(data.totalSpend.toFixed(2)),
          invoiceCount: data.invoiceCount,
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend);

      res.json(response);
    } catch (err) {
      console.error("Error fetching category spend:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch category spend", message });
    }
  });

  return router;
}
