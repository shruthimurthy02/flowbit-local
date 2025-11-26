import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

/**
 * GET /invoices
 * Query params: page, perPage, search, status, vendorId, dateFrom, dateTo
 * Returns paginated invoices with vendor, date, invoiceNumber, amount, status
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const perPage = Math.max(1, parseInt(String(req.query.perPage || "20"), 10));
    const skip = (page - 1) * perPage;

    const where: any = {};

    if (req.query.search) {
      const s = String(req.query.search);
      where.OR = [
        { invoiceNumber: { contains: s, mode: "insensitive" } },
        { vendor: { name: { contains: s, mode: "insensitive" } } }
      ];
    }

    if (req.query.status) {
      where.status = String(req.query.status);
    }

    if (req.query.vendorId) {
      where.vendorId = String(req.query.vendorId);
    }

    if (req.query.dateFrom || req.query.dateTo) {
      const from = req.query.dateFrom ? new Date(String(req.query.dateFrom)) : undefined;
      const to = req.query.dateTo ? new Date(String(req.query.dateTo)) : undefined;
      where.issueDate = {};
      if (from) where.issueDate.gte = from;
      if (to) where.issueDate.lte = to;
    }

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { vendor: true, payments: true },
        orderBy: { issueDate: "desc" },
        skip,
        take: perPage
      }),
      prisma.invoice.count({ where })
    ]);

    const rows = items.map(i => ({
      id: i.id,
      vendor: i.vendor?.name ?? "Unknown",
      date: i.issueDate,
      invoiceNumber: i.invoiceNumber,
      amount: i.totalAmount,
      totalAmount: i.totalAmount,
      status: i.status,
      payments: i.payments
    }));

    res.json({ page, perPage, total, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

export default router;
