import { Router } from "express";
import type { PrismaClient } from "@prisma/client";

export default function createVendorsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/top10", async (_req, res) => {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          vendor: { select: { id: true, name: true } },
        },
      });

      const vendorMap: Record<number, { name: string; totalSpend: number; invoiceCount: number }> = {};

      invoices.forEach((invoice) => {
        if (!invoice.vendor) return;
        const vendorId = invoice.vendor.id;
        if (!vendorMap[vendorId]) {
          vendorMap[vendorId] = {
            name: invoice.vendor.name,
            totalSpend: 0,
            invoiceCount: 0,
          };
        }
        vendorMap[vendorId].totalSpend += Number(invoice.totalAmount || 0);
        vendorMap[vendorId].invoiceCount += 1;
      });

      const topVendors = Object.values(vendorMap)
        .map((vendor) => ({
          vendor: vendor.name,
          totalSpend: Number(vendor.totalSpend.toFixed(2)),
          invoiceCount: vendor.invoiceCount,
        }))
        .sort((a, b) => b.totalSpend - a.totalSpend)
        .slice(0, 10);

      res.json(topVendors);
    } catch (err) {
      console.error("Error fetching top vendors:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch top vendors", message });
    }
  });

  return router;
}
