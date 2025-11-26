import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

/**
 * GET /category-spend
 * Returns spend grouped by category
 */
router.get("/", async (req, res) => {
  try {
    // Group by scalar field: categoryId
    const grouped = await prisma.invoice.groupBy({
      by: ["categoryId"],
      _sum: { totalAmount: true },
      orderBy: {
        _sum: { totalAmount: "desc" }
      }
    });

    // Join category details
    const result = await Promise.all(
      grouped.map(async (g) => {
        const category = g.categoryId
          ? await prisma.category.findUnique({ where: { id: g.categoryId } })
          : null;

        return {
          categoryId: g.categoryId,
          categoryName: category?.name ?? "Uncategorised",
          totalAmount: g._sum.totalAmount ?? 0
        };
      })
    );

    res.json(result);
  } catch (err) {
    console.error("CATEGORY ERROR:", err);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export default router;




