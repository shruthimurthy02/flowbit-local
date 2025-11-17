import express, { Request, Response } from "express";
import axios from "axios";

const router = express.Router();
const VANNA_API_BASE_URL = process.env.VANNA_API_BASE_URL || "http://localhost:8000";

router.post("/", async (req: Request, res: Response) => {
  try {
    const { question, query } = req.body;
    const userQuestion = question || query;

    if (!userQuestion) {
      return res.status(400).json({ error: "Missing question or query field" });
    }

    const response = await axios.post(
      `${VANNA_API_BASE_URL}/query`,
      { query: userQuestion },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const payload = response.data;

    if (payload?.status === "success") {
      res.json({
        sql: userQuestion,
        notes: payload.answer || "Query executed successfully",
        results: payload.rows || payload.results || [],
      });
      return;
    }

    // Handle error responses
    if (payload?.status === "error") {
      return res.status(500).json({
        error: "Vanna query failed",
        message: payload.message || "Unknown error",
      });
    }

    res.json(payload);
  } catch (err: any) {
    console.error("Error proxying to Vanna:", err.message);
    res.status(500).json({
      error: "Chat proxy failed",
      details: err.message,
      vannaUrl: VANNA_API_BASE_URL,
    });
  }
});

export default router;
