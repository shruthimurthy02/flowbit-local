import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Route modules
import chatRouter from "./routes/chat";
import createStatsRouter from "./routes/stats";
import createInvoicesRouter from "./routes/invoices";
import createVendorsRouter from "./routes/vendors";
import createCategoryRouter from "./routes/categories";
import createCashOutflowRouter from "./routes/cash-outflow";
import createInvoiceTrendsRouter from "./routes/invoice-trends";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// ✅ CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "https://flowbit.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// ✅ Health check endpoints
app.get("/", (_req, res) => res.json({ ok: true, message: "Flowbit API running" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// ✅ Mount all route modules
app.use("/stats", createStatsRouter(prisma));
app.use("/invoices", createInvoicesRouter(prisma));
app.use("/vendors", createVendorsRouter(prisma));
app.use("/category-spend", createCategoryRouter(prisma));
app.use("/cash-outflow", createCashOutflowRouter(prisma));
app.use("/invoice-trends", createInvoiceTrendsRouter(prisma));
app.use("/chat-with-data", chatRouter);

// ✅ Legacy Chat endpoint (fallback proxy to Vanna)
app.post("/chat-with-data-legacy", async (req, res) => {
  try {
    const { query, question } = req.body;
    const userQuery = query || question;

    if (!userQuery) {
      return res.status(400).json({ error: "Missing query or question field" });
    }

    const vannaUrl = `${process.env.VANNA_API_BASE_URL || "http://localhost:8000"}/query`;

    const response = await axios.post(
      vannaUrl,
      { query: userQuery },
      {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      }
    );

    const payload = response.data;

    if (payload?.status === "success") {
      res.json({ sql: userQuery, results: payload.rows || payload.results || [] });
      return;
    }

    res.json(payload);
  } catch (error: any) {
    console.error("❌ Chat proxy error:", error.message);
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: "Chat service error",
        message: error.response.data?.error || error.message,
      });
    } else if (error.request) {
      res.status(503).json({
        error: "Chat service unavailable",
        message: "Cannot connect to Vanna service",
      });
    } else {
      res.status(500).json({
        error: "Chat proxy failed",
        message: error.message,
      });
    }
  }
});

// ✅ Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Uncaught API error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// ✅ Start server (when run directly)
const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Flowbit API running at http://localhost:${PORT}`);
  });
}

// ✅ Export app for testing or serverless hosting
export default app;

// ✅ Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
