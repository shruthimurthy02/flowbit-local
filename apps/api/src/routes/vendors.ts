import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

router.get("/top10", async (req, res) => {
  try {
    const limit = parseInt(String(req.query.limit || "10"));

    const result = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: limit,
    });

    const vendors = await Promise.all(
      result.map(async (r) => {
        const vendor = await prisma.vendor.findUnique({
          where: { id: r.vendorId },
        });
        return {
          vendorId: r.vendorId,
          vendorName: vendor?.name ?? "Unknown",
          totalAmount: r._sum.totalAmount ?? 0,
        };
      })
    );

    res.json(vendors);
  } catch (err) {
    console.error("❌ vendors error:", err);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

export default router;

