import "dotenv/config";
// @ts-ignore - types are provided at runtime via node_modules
import express from "express";
// @ts-ignore - types are provided at runtime via node_modules
import cors from "cors";
// @ts-ignore - types are provided at runtime via node_modules
import multer from "multer";
import type { Request, Response } from "express";
import { parseTextToTransaction } from "./services/gemini.js";
import {
  MAX_AUDIO_FILE_SIZE_BYTES,
  transcribeAudioFile,
} from "./services/whisper.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "*", // TODO: restrict to your mobile app / web origin in production
  }),
);
app.use(express.json());

// Configure Multer for temporary storage of uploaded audio files
// Files are stored on disk and deleted right after transcription.
const upload = multer({
  dest: "tmp/",
  limits: {
    fileSize: MAX_AUDIO_FILE_SIZE_BYTES,
  },
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

// Speech-to-text transcription endpoint using OpenAI Whisper
app.post(
  "/transcribe",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      // Log basic file info
      const { originalname, size, path } = file;
      const sizeKb = (size / 1024).toFixed(1);
      console.log(
        `[transcribe] Received file "${originalname}" (${sizeKb} KB, ${size} bytes)`,
      );

      // Multer already enforces a limit, but we double-check for clarity.
      if (size > MAX_AUDIO_FILE_SIZE_BYTES) {
        return res.status(413).json({
          error: "File too large. Please keep recordings under 2MB (~8-10s).",
        });
      }

      const start = Date.now();
      const transcript = await transcribeAudioFile(path, originalname, size);
      const latencyMs = Date.now() - start;
      console.log(
        `[transcribe] Completed in ${latencyMs} ms for "${originalname}"`,
      );

      return res.json({ transcript });
    } catch (error: any) {
      console.error("[transcribe] error", error);

      if (error?.code === "LIMIT_FILE_SIZE" || error?.code === "FILE_TOO_LARGE") {
        return res.status(413).json({
          error: "File too large. Please keep recordings under 2MB (~8-10s).",
        });
      }

      return res
        .status(500)
        .json({ error: error?.message || "Failed to transcribe audio" });
    }
  },
);

const server = app.listen(PORT, () => {
  console.log(`Spendeka API listening on http://localhost:${PORT}`);
});

// Increase server timeouts to accommodate slower mobile uploads + Whisper latency
// Default Node timeouts can be too aggressive for 8–10s recordings over Wi‑Fi.
server.setTimeout(120_000); // 120s overall timeout for responses
// @ts-ignore - headersTimeout is available on Node HTTP server
server.headersTimeout = 130_000;
