import { Router } from "express";
import prisma from "../utils/prisma";

/**
 * GET /cash-outflow?days=30
 * Returns expected cash outflow aggregated by day for the next N days (default 30)
 */
const router = Router();

router.get("/", async (req, res) => {
  try {
    const days = parseInt(String(req.query.days || "30"), 10);
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    const data = await prisma.invoice.findMany({
      where: { dueDate: { gte: start, lte: end } },
      select: { dueDate: true, totalAmount: true }
    });

    // aggregate by date
    const map = new Map();
    data.forEach((row) => {
      const d = new Date(row.dueDate).toISOString().slice(0, 10);
      map.set(d, (map.get(d) || 0) + Number(row.totalAmount));
    });

    const result = Array.from(map.entries()).map(([date, total]) => ({ date, total }));

    res.json(result.sort((a, b) => a.date.localeCompare(b.date)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cash outflow" });
  }
});

export default router;
