import "dotenv/config";
import Tesseract from "tesseract.js";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { parseTextToTransaction } from "./gemini.js";
import type { ParsedTransactionFromText } from "../types/transaction.js";

const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB hard limit for bill images

export async function scanBillAndParse(
  filePath: string,
  originalName: string,
  size: number,
): Promise<{ rawText: string; parsed: ParsedTransactionFromText }> {
  const sizeKb = (size / 1024).toFixed(1);
  console.log(
    `[scanBill] Incoming file "${originalName}" (${sizeKb} KB, ${size} bytes)`,
  );

  if (!size || size <= 0) {
    await safeUnlink(filePath);
    throw new Error("Uploaded bill image is empty");
  }

  if (size > MAX_IMAGE_FILE_SIZE_BYTES) {
    await safeUnlink(filePath);
    const err: any = new Error(
      "Bill image too large. Please upload an image under 5MB.",
    );
    err.code = "FILE_TOO_LARGE";
    throw err;
  }

  try {
    console.log(`[scanBill] Running OCR via Tesseract on "${originalName}" (vie+eng)`);
    // Support Vietnamese + English OCR
    const result = await Tesseract.recognize(filePath, "vie+eng", {
      logger: (m) => {
        if (m.status) {
          console.log(`[scanBill][ocr] ${m.status} ${Math.round((m.progress || 0) * 100)}%`);
        }
      },
    });

    const rawText = (result.data?.text || "").trim();

    if (!rawText) {
      throw new Error("OCR did not detect any text in the bill image.");
    }

    console.log(
      `[scanBill] OCR extracted ${rawText.length} characters of text from "${originalName}"`,
    );

    const parsed = await parseTextToTransaction(rawText);

    return { rawText, parsed };
  } finally {
    await safeUnlink(filePath);
  }
}

async function safeUnlink(path: string) {
  try {
    await fsPromises.unlink(path);
  } catch (err: any) {
    if (err?.code !== "ENOENT") {
      console.error(`[scanBill] Failed to delete temp file ${path}`, err);
    }
  }
}

