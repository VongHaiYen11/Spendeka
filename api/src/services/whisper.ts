import "dotenv/config";
import OpenAI from "openai";
import fs from "node:fs";
import fsPromises from "node:fs/promises";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// 2 MB hard limit (Express + Multer should also enforce this)
export const MAX_AUDIO_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  // Global client timeout: 120s
  timeout: 120_000,
});

export async function transcribeAudioFile(
  filePath: string,
  originalName: string,
  size: number,
): Promise<string> {
  const sizeKb = (size / 1024).toFixed(1);
  console.log(
    `[whisper] Incoming file "${originalName}" (${sizeKb} KB, ${size} bytes)`,
  );

  if (!size || size <= 0) {
    await safeUnlink(filePath);
    throw new Error("Uploaded file is empty");
  }

  if (size > MAX_AUDIO_FILE_SIZE_BYTES) {
    await safeUnlink(filePath);
    throw Object.assign(new Error("File too large"), {
      code: "FILE_TOO_LARGE",
    });
  }

  const start = Date.now();

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "gpt-4o-mini-transcribe",
      // IMPORTANT: do NOT set language -> auto-detect
      response_format: "text",
    });

    const latencyMs = Date.now() - start;
    console.log(
      `[whisper] Transcription finished in ${latencyMs} ms for "${originalName}"`,
    );

    // response_format: "text" gives a plain string
    const text =
      typeof transcription === "string"
        ? transcription
        : // Fallback for any SDK typing quirks
          (transcription as any)?.text ?? String(transcription);

    return text;
  } finally {
    // Always clean up temp file
    await safeUnlink(filePath);
  }
}

async function safeUnlink(path: string) {
  try {
    await fsPromises.unlink(path);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.error(`[whisper] Failed to delete temp file ${path}`, err);
    }
  }
}

