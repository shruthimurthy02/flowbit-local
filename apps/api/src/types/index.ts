/**
 * Server entry placed at src/types/index.ts per project structure.
 * Exposes Express server and mounts routes.
 */

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "../routes";
import prisma from "../utils/prisma";

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*"
}));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// health
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.json({ ok: true, message: "Flowbit API running" }));

// mount routes
app.use("/api", routes);

// global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// start server if this file is launched directly
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Flowbit API running on http://0.0.0.0:${port}`);
  });
}

export default app;
