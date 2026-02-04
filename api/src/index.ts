import "dotenv/config";
// @ts-ignore - types are provided at runtime via node_modules
import express from "express";
// @ts-ignore - types are provided at runtime via node_modules
import cors from "cors";
import { parseTextToTransaction } from "./services/gemini.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*", // TODO: restrict to your mobile app / web origin in production
  }),
);
app.use(express.json());

// Simple root route so hitting http://localhost:PORT/ doesn't show "Cannot GET /"
app.get("/", (_req: any, res: any) => {
  res.json({ ok: true, message: "Spendeka API running" });
});

app.get("/health", (_req: any, res: any) => {
  res.json({ ok: true });
});

app.post("/text-to-transaction", async (req: any, res: any) => {
  try {
    const { text } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Missing or invalid 'text'" });
    }

    const parsed = await parseTextToTransaction(text);

    // Return only the structured JSON; the client will map it to DatabaseTransaction.
    return res.json(parsed);
  } catch (error: any) {
    console.error("text-to-transaction error", error);
    return res
      .status(500)
      .json({ error: error?.message || "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Spendeka API listening on http://localhost:${PORT}`);
});

