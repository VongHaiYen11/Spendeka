import "dotenv/config";
// @ts-ignore - types are provided at runtime via node_modules
import express from "express";
// @ts-ignore - types are provided at runtime via node_modules
import cors from "cors";
// @ts-ignore - types are provided at runtime via node_modules
import multer from "multer";
import type { Request, Response } from "express";
import { parseTextToTransaction } from "./services/gemini.js";
import { scanBillAndParse } from "./services/scanBill.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*", // TODO: restrict to your mobile app / web origin in production
  }),
);
app.use(express.json());

// Configure Multer for temporary storage of uploaded images
const upload = multer({
  dest: "tmp/",
});

// Simple root route so hitting http://localhost:PORT/ doesn't show "Cannot GET /"
app.get("/", (_req: Request, res: Response) => {
  res.json({ ok: true, message: "Spendeka API running" });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/text-to-transaction", async (req: Request, res: Response) => {
  try {
    const { text } = (req.body || {}) as { text?: string };

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

// Scan bill endpoint: OCR + Gemini parsing
app.post(
  "/scan-bill",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No bill image uploaded" });
      }

      const { originalname, size, path } = file;
      console.log(
        `[scanBill] Received file "${originalname}" (${size} bytes) for scanning`,
      );

      const { rawText, parsed } = await scanBillAndParse(
        path,
        originalname,
        size,
      );

      return res.json({ rawText, parsed });
    } catch (error: any) {
      console.error("[scanBill] error", error);

      if (error?.code === "FILE_TOO_LARGE") {
        return res.status(413).json({
          error: error.message,
        });
      }

      return res
        .status(500)
        .json({ error: error?.message || "Failed to scan bill" });
    }
  },
);

app.listen(PORT, () => {
  console.log(`Spendeka API listening on http://localhost:${PORT}`);
});

