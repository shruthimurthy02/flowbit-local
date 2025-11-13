import { Router } from "express";
import type { PrismaClient, Prisma } from "@prisma/client";

export default function createInvoicesRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      const page = parseInt((req.query.page as string) || "1", 10);
      const perPage = Math.min(parseInt((req.query.per_page as string) || "20", 10), 100);
      const sort = (req.query.sort as string) || "date";
      const order = ((req.query.order as string) || "desc").toLowerCase() === "asc" ? "asc" : "desc";
      const statusFilter = (req.query.status as string) || undefined;

      const skip = (page - 1) * perPage;

      const where: Prisma.InvoiceWhereInput = {};

      if (q) {
        where.OR = [
          { invoiceNumber: { contains: q, mode: "insensitive" } },
          { status: { contains: q, mode: "insensitive" } },
          { vendor: { name: { contains: q, mode: "insensitive" } } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
        ];
      }

      if (statusFilter) {
        where.status = { equals: statusFilter };
      }

      let orderBy: Prisma.InvoiceOrderByWithRelationInput = {};

      switch (sort) {
        case "vendor":
          orderBy = { vendor: { name: order as "asc" | "desc" } };
          break;
        case "customer":
          orderBy = { customer: { name: order as "asc" | "desc" } };
          break;
        case "amount":
          orderBy = { totalAmount: order as "asc" | "desc" };
          break;
        case "status":
          orderBy = { status: order as "asc" | "desc" };
          break;
        default:
          orderBy = { date: order as "asc" | "desc" };
      }

      const [total, data] = await Promise.all([
        prisma.invoice.count({ where }),
        prisma.invoice.findMany({
          where,
          include: {
            vendor: { select: { name: true } },
            customer: { select: { name: true } },
          },
          orderBy,
          skip,
          take: perPage,
        }),
      ]);

      const response = {
        invoices: data.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          vendor: invoice.vendor?.name || "Unknown vendor",
          customer: invoice.customer?.name || "Unknown customer",
          date: invoice.date.toISOString(),
          totalAmount: Number(invoice.totalAmount.toFixed(2)),
          status: invoice.status,
        })),
        pagination: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      };

      res.json(response);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "Failed to fetch invoices", message });
    }
  });

  return router;
}
