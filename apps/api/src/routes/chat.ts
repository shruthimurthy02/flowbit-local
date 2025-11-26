import { Router } from "express";
import fetch from "node-fetch";
import prisma from "../utils/prisma";

const router = Router();

/**
 * POST /chat-with-data
 * Body: { prompt: string }
 * Forwards the prompt to VANNA_API_BASE_URL (env) and returns { sql, rows }
 */
router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Missing prompt" });

    const VANNA = process.env.VANNA_API_BASE_URL || "http://localhost:8000";
    const key = process.env.VANNA_API_KEY || "";

    // forward to vanna /query (assumes Vanna returns { sql: string })
    const r = await fetch(`${VANNA}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { "Authorization": `Bearer ${key}` } : {})
      },
      body: JSON.stringify({ prompt })
    });

    if (!r.ok) {
      const txt = await r.text();
      return res.status(502).json({ error: "Vanna error", details: txt });
    }

    const json = await r.json();
    // expected { sql: "...", rows?: [...] } from Vanna
    const sql = json.sql ?? json.query ?? null;
    const rowsFromVanna = json.rows ?? null;

    if (!sql) {
      return res.json({ sql: null, rows: rowsFromVanna ?? [], message: "Vanna did not return SQL" });
    }

    // Execute the generated SQL directly using Prisma.$queryRawUnsafe
    const rows = await prisma.$queryRawUnsafe(sql);

    res.json({ sql, rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat proxy failed", details: err.message });
  }
});

export default router;
