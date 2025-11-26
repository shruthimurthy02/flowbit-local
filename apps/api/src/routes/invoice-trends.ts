import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const months = parseInt(String(req.query.months || "12"));
    const now = new Date();

    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const agg = await prisma.invoice.aggregate({
        where: { issueDate: { gte: start, lt: end } },
        _count: { id: true },
        _sum: { totalAmount: true },
      });

      results.push({
        month: `${start.getFullYear()}-${String(
          start.getMonth() + 1
        ).padStart(2, "0")}`,
        invoiceCount: agg._count.id ?? 0,
        totalAmount: agg._sum.totalAmount ?? 0,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ invoice-trends error:", err);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

export default router;

