import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // Find data file - seed.ts is in apps/api/prisma/
  // Data file is in project root: ../../data/Analytics_Test_Data.json
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const filePath = path.join(projectRoot, "data", "Analytics_Test_Data.json");
  
  // Also try absolute path
  const absolutePath = "C:\\Users\\shrut\\OneDrive\\Desktop\\flowbit-intern-assignment\\data\\Analytics_Test_Data.json";
  
  let dataFilePath = filePath;
  if (!fs.existsSync(dataFilePath) && fs.existsSync(absolutePath)) {
    dataFilePath = absolutePath;
  }
  
  if (!fs.existsSync(dataFilePath)) {
    console.error(`❌ Data file not found`);
    console.error(`Tried: ${filePath}`);
    console.error(`Tried: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`✅ Found data file: ${dataFilePath}`);
  const rawData = fs.readFileSync(dataFilePath, "utf-8");
  const data = JSON.parse(rawData);

  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  // Step 1: Seed Vendors
  console.log("📦 Seeding vendors...");
  const vendorMap = new Map<string, number>();
  const vendorCategories = new Map<string, string>();

  // Collect categories from lineItems
  if (data.invoices && Array.isArray(data.invoices)) {
    for (const invoice of data.invoices) {
      const vendorId = invoice.vendorId;
      if (vendorId && typeof vendorId === "string" && !vendorCategories.has(vendorId)) {
        const lineItems = invoice.lineItems || [];
        const categories = lineItems.map((li: any) => li.category).filter((cat: string) => cat);
        if (categories.length > 0) {
          const categoryCounts: Record<string, number> = {};
          categories.forEach((cat: string) => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          });
          const primaryCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
          vendorCategories.set(vendorId, primaryCategory || "General");
        } else {
          vendorCategories.set(vendorId, "General");
        }
      }
    }
  }

  // Create vendors
  if (data.vendors && Array.isArray(data.vendors)) {
    for (const vendor of data.vendors) {
      if (!vendor.id || !vendor.name) continue;
      const category = vendorCategories.get(vendor.id) || "General";
      
      const existing = await prisma.vendor.findUnique({
        where: { name: vendor.name },
      });

      if (existing) {
        await prisma.vendor.update({
          where: { id: existing.id },
          data: { category: category },
        });
        vendorMap.set(vendor.id, existing.id);
      } else {
        const created = await prisma.vendor.create({
          data: { name: vendor.name, category: category },
        });
        vendorMap.set(vendor.id, created.id);
      }
    }
  }
  console.log(`✅ Seeded ${vendorMap.size} vendors`);

  // Step 2: Seed Customers
  console.log("👥 Seeding customers...");
  const customerMap = new Map<string, number>();

  if (data.customers && Array.isArray(data.customers)) {
    for (const customer of data.customers) {
      if (!customer.id || !customer.name) continue;
      
      const existing = customer.email
        ? await prisma.customer.findFirst({ where: { email: customer.email } })
        : await prisma.customer.findFirst({ where: { name: customer.name } });

      if (existing) {
        customerMap.set(customer.id, existing.id);
      } else {
        const created = await prisma.customer.create({
          data: {
            name: customer.name,
            email: customer.email || null,
          },
        });
        customerMap.set(customer.id, created.id);
      }
    }
  }
  console.log(`✅ Seeded ${customerMap.size} customers`);

  // Step 3: Seed Invoices
  console.log("📄 Seeding invoices...");
  let invoiceCount = 0;
  let lineItemCount = 0;
  let paymentCount = 0;

  if (data.invoices && Array.isArray(data.invoices)) {
    for (const invoice of data.invoices) {
      if (!invoice.vendorId || !invoice.customerId) continue;

      const vendorDbId = vendorMap.get(invoice.vendorId);
      const customerDbId = customerMap.get(invoice.customerId);

      if (!vendorDbId || !customerDbId) {
        console.warn(`⚠ Skipping invoice: vendor or customer not found`);
        continue;
      }

      const invoiceDate = invoice.issueDate
        ? new Date(invoice.issueDate)
        : invoice.date
        ? new Date(invoice.date)
        : new Date();

      const invoiceNumber = invoice.invoiceNumber || invoice.id || `INV-${Date.now()}`;
      const totalAmount = parseFloat(String(invoice.total ?? invoice.amount ?? invoice.subtotal ?? 0));
      const status = invoice.status || "Pending";

      try {
        const createdInvoice = await prisma.invoice.upsert({
          where: { invoiceNumber: invoiceNumber },
          update: {},
          create: {
            invoiceNumber: invoiceNumber,
            vendorId: vendorDbId,
            customerId: customerDbId,
            date: invoiceDate,
            totalAmount: totalAmount,
            status: status,
          },
        });

        // Create line items
        if (invoice.lineItems && Array.isArray(invoice.lineItems)) {
          for (const li of invoice.lineItems) {
            await prisma.lineItem.create({
              data: {
                invoiceId: createdInvoice.id,
                description: li.description || "Item",
                quantity: parseInt(String(li.quantity || 1)),
                unitPrice: parseFloat(String(li.unitPrice ?? li.price ?? 0)),
              },
            });
            lineItemCount++;
          }
        }

        // Create payments
        if (invoice.payments && Array.isArray(invoice.payments)) {
          for (const p of invoice.payments) {
            const paymentDate = p.paymentDate ? new Date(p.paymentDate) : p.date ? new Date(p.date) : null;
            await prisma.payment.create({
              data: {
                invoiceId: createdInvoice.id,
                amount: parseFloat(String(p.amount ?? 0)),
                date: paymentDate,
              },
            });
            paymentCount++;
          }
        }

        invoiceCount++;
      } catch (error: any) {
        console.error(`❌ Error creating invoice:`, error.message);
      }
    }
  }

  console.log(`✅ Seeded ${invoiceCount} invoices`);
  console.log(`✅ Seeded ${lineItemCount} line items`);
  console.log(`✅ Seeded ${paymentCount} payments`);
  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
