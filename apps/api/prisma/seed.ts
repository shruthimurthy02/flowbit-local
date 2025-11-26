import { PrismaClient, InvoiceStatus, Prisma } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type VendorJson = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type CustomerJson = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

type LineItemJson = {
  description?: string;
  category?: string;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  tax?: number;
};

type PaymentJson = {
  amount: number;
  paymentDate?: string;
  method?: string;
  reference?: string;
};

type InvoiceJson = {
  id: string;
  invoiceNumber?: string;
  vendorId: string;
  customerId?: string;
  issueDate?: string;
  dueDate?: string;
  status?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  notes?: string;
  lineItems?: LineItemJson[];
  payments?: PaymentJson[];
  category?: string;
};

type AnalyticsJson = {
  vendors: VendorJson[];
  customers: CustomerJson[];
  invoices: InvoiceJson[];
};

async function loadJson(): Promise<AnalyticsJson> {
  // Try several candidate paths to be robust across environments
  const candidates = [
    path.join(process.cwd(), "data", "Analytics_Test_Data.json"),
    path.join(__dirname, "..", "..", "..", "data", "Analytics_Test_Data.json"),
    path.join(__dirname, "..", "..", "data", "Analytics_Test_Data.json"),
  ];

  let filePath: string | undefined;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    throw new Error(
      "Data file Analytics_Test_Data.json not found. Expected at ./data/Analytics_Test_Data.json relative to repo root."
    );
  }

  console.log("📄 Using data file:", filePath);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as AnalyticsJson;
}

function normalizeStatus(status?: string): InvoiceStatus {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "paid":
      return InvoiceStatus.PAID;
    case "overdue":
    case "late":
      return InvoiceStatus.OVERDUE;
    case "cancelled":
    case "canceled":
      return InvoiceStatus.CANCELLED;
    case "pending":
    default:
      return InvoiceStatus.PENDING;
  }
}

async function main() {
  const data = await loadJson();

  console.log("🌱 Clearing existing data...");
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.category.deleteMany();

  console.log("📦 Seeding categories, vendors, customers, invoices, line items, payments...");

  // 1) Seed Categories (derived from invoice.category or lineItems[].category)
  const categoryNameToId = new Map<string, string>();
  const allCategoryNames = new Set<string>();

  for (const invoice of data.invoices || []) {
    if (invoice.category) {
      allCategoryNames.add(invoice.category);
    }
    for (const li of invoice.lineItems || []) {
      if (li.category) {
        allCategoryNames.add(li.category);
      }
    }
  }

  for (const name of allCategoryNames) {
    const created = await prisma.category.create({
      data: { name },
    });
    categoryNameToId.set(name, created.id);
  }

  // 2) Seed Vendors
  const vendorIdMap = new Map<string, string>();

  for (const v of data.vendors || []) {
    const created = await prisma.vendor.create({
      data: {
        name: v.name,
        email: v.email || null,
        phone: v.phone || null,
        address: v.address || null,
      },
    });
    vendorIdMap.set(v.id, created.id);
  }

  // 3) Seed Customers
  const customerIdMap = new Map<string, string>();

  for (const c of data.customers || []) {
    const created = await prisma.customer.create({
      data: {
        name: c.name,
        email: c.email || null,
        phone: c.phone || null,
        address: c.address || null,
      },
    });
    customerIdMap.set(c.id, created.id);
  }

  // 4) Seed Invoices + nested line items & payments
  let invoiceCount = 0;
  let lineItemCount = 0;
  let paymentCount = 0;

  for (const inv of data.invoices || []) {
    const vendorDbId = vendorIdMap.get(inv.vendorId);
    if (!vendorDbId) {
      console.warn("⚠ Skipping invoice with missing vendor:", inv.id);
      continue;
    }

    const customerDbId = inv.customerId
      ? customerIdMap.get(inv.customerId)
      : undefined;

    const categoryDbId =
      (inv.category && categoryNameToId.get(inv.category)) || undefined;

    const issueDate = inv.issueDate ? new Date(inv.issueDate) : new Date();
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : undefined;

    const subtotal = inv.subtotal ?? 0;
    const tax = inv.tax ?? 0;
    const total = inv.total ?? subtotal + tax;

    const createdInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: inv.invoiceNumber || inv.id,
        vendorId: vendorDbId,
        customerId: customerDbId,
        categoryId: categoryDbId,
        issueDate,
        dueDate: dueDate ?? null,
        status: normalizeStatus(inv.status),
        subtotal: new Prisma.Decimal(subtotal),
        tax: new Prisma.Decimal(tax),
        totalAmount: new Prisma.Decimal(total),
        notes: inv.notes || null,
      },
    });

    invoiceCount++;

    // Line items
    for (const li of inv.lineItems || []) {
      const qty = li.quantity ?? 1;
      const price = li.unitPrice ?? li.amount ?? 0;
      const amount = li.amount ?? qty * price;
      const tax = li.tax ?? 0;

      await prisma.lineItem.create({
        data: {
          invoiceId: createdInvoice.id,
          description: li.description || null,
          category: li.category || null,
          quantity: new Prisma.Decimal(qty),
          unitPrice: new Prisma.Decimal(price),
          amount: new Prisma.Decimal(amount),
          tax: new Prisma.Decimal(tax),
        },
      });
      lineItemCount++;
    }

    // Payments
    for (const p of inv.payments || []) {
      await prisma.payment.create({
        data: {
          invoiceId: createdInvoice.id,
          amount: new Prisma.Decimal(p.amount ?? 0),
          paymentDate: p.paymentDate
            ? new Date(p.paymentDate)
            : new Date(),
          method: p.method || null,
          reference: p.reference || null,
        },
      });
      paymentCount++;
    }
  }

  console.log(`✅ Seeded ${invoiceCount} invoices`);
  console.log(`✅ Seeded ${lineItemCount} line items`);
  console.log(`✅ Seeded ${paymentCount} payments`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });