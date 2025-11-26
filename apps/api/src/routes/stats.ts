import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

/**
 * GET /stats
 */
router.get("/", async (_req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const totalSpend = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { issueDate: { gte: startOfYear } },
    });

    const totalInvoices = await prisma.invoice.count();

    const avg = await prisma.invoice.aggregate({
      _avg: { totalAmount: true },
    });

    res.json({
      totalSpend: totalSpend._sum.totalAmount ?? 0,
      totalInvoicesProcessed: totalInvoices,
      documentsUploaded: 0,
      averageInvoiceValue: avg._avg.totalAmount ?? 0,
    });

  } catch (err) {
    console.error("❌ stats route error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
