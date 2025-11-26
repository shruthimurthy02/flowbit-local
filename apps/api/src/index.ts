import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Route modules
import statsRouter from "./routes/stats";
import invoicesRouter from "./routes/invoices";
import vendorsRouter from "./routes/vendors";
import categoriesRouter from "./routes/categories";
import cashOutflowRouter from "./routes/cash-outflow";
import invoiceTrendsRouter from "./routes/invoice-trends";
import chatRouter from "./routes/chat";

dotenv.config();

const app = express();

// CORS
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

// Health
app.get("/", (_req, res) => res.json({ ok: true }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes — FIXED
app.use("/stats", statsRouter);
app.use("/invoices", invoicesRouter);
app.use("/vendors", vendorsRouter);
app.use("/category-spend", categoriesRouter);
app.use("/cash-outflow", cashOutflowRouter);
app.use("/invoice-trends", invoiceTrendsRouter);
app.use("/chat-with-data", chatRouter);

// Error handler
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("API ERROR:", err);
    res.status(500).json({ error: err.message });
  }
);

// Server
const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});

export default app;



