import "dotenv/config";
import fetch from "node-fetch";
import { ParsedTransactionFromText } from "../types/transaction.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

/**
 * Extract the first JSON object from Gemini output safely.
 */
function extractJsonObject(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in Gemini response");
  return match[0];
}

export async function parseTextToTransaction(
  text: string,
): Promise<ParsedTransactionFromText> {
  console.warn("[Gemini] Incoming text:", text);

  // Quick pre-check: if there's no digit at all, it's very unlikely
  // to contain a money amount – treat as invalid immediately.
  if (!/\d/.test(text)) {
    throw new Error(
      "No number related to money was found in this text. Please include at least one amount (e.g. 25, 10.50, 100k) and try again.",
    );
  }

  // Server reference time (used for today/yesterday fallback)
  const now = new Date();
  const nowIso = now.toISOString();

  const prompt = `
You are a transaction parser.

Your job: convert the user text into exactly ONE valid JSON object.

------------------------------------------------------------
Current datetime reference (ISO 8601):
${nowIso}
------------------------------------------------------------

User text:
"""
${text}
"""

Return exactly ONE JSON object (no markdown, no extra text) in this shape:

{
  "caption": string,
  "amount": number,
  "category": string,
  "type": "income" | "spent",
  "createdAt": string
}

Rules:

AMOUNT:
- "amount" must be a positive number.
- If multiple items exist, sum them.
- If the user text does NOT contain any number that could reasonably be a money amount (e.g. 10, 10.50, 100k, $20), then the message is invalid.
- In that case, do NOT return JSON. Instead, return exactly this single word (lowercase, no quotes): error

TYPE:
- "income" if money received, otherwise "spent".

CATEGORY:
- MUST be one of these exact values:

Expenses:
"food", "transport", "shopping", "entertainment",
"bills", "health", "education", "other"

Income:
"salary", "freelance", "investment", "gift",
"refund", "other_income"

- Never invent new categories.

CREATEDAT (IMPORTANT):
- "createdAt" must be ISO 8601 datetime.
- If the user text contains a specific date, use that date.
- If the user says "today" or "yesterday", resolve it relative to the current datetime reference above.
- If the user provides a date but NO time, set the time to exactly 00:00:00.
- If the user provides NO date at all, use the current datetime reference above.

BLANK FIELDS:
- Try your best to fill all fields from the text.
- If, after trying your best, more than 3 of the fields (caption, amount, category, type, createdAt) would be empty, unknown, or meaningless defaults, then the message is invalid.
- In that case, do NOT return JSON. Instead, return exactly this single word (lowercase, no quotes): error

OUTPUT FORMAT:
- If the message is valid, return ONLY the JSON object described above.
- If the message is invalid, return ONLY the word error (lowercase), with no JSON and no explanations.
- No backticks.
- No explanations.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.warn("[Gemini] Error response:", errorText.slice(0, 500));
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as any;

  const candidateText: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!candidateText) {
    console.warn("[Gemini] No candidate text:", JSON.stringify(data, null, 2));
    throw new Error("Gemini API did not return any content");
  }

  console.warn("[Gemini] Raw output:", candidateText);

  // Model-level "error" signal: when prompt rules decide the message is invalid.
  const trimmed = candidateText.trim().toLowerCase();
  if (trimmed === "error") {
    throw new Error(
      "Could not extract a valid transaction from this text. Please include at least one clear money amount and enough details, then try again.",
    );
  }

  let parsed: ParsedTransactionFromText;

  try {
    // Safer JSON extraction
    const jsonOnly = extractJsonObject(candidateText);
    parsed = JSON.parse(jsonOnly);
  } catch (err) {
    console.warn("[Gemini] JSON parse failed:", err);
    throw new Error("Failed to parse Gemini response as JSON");
  }

  // Validation
  if (
    typeof parsed.caption !== "string" ||
    typeof parsed.amount !== "number" ||
    typeof parsed.category !== "string" ||
    (parsed.type !== "income" && parsed.type !== "spent") ||
    typeof parsed.createdAt !== "string"
  ) {
    throw new Error("Gemini response JSON is missing required fields");
  }

  console.warn("[Gemini] Final parsed transaction:", parsed);

  return parsed;
}
