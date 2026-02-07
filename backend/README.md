<div align="center">

# Spendeka Backend API

**Parse text. Scan bills. Caption images.**

[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat&logo=express)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=flat&logo=google)](https://ai.google.dev)

*Node/Express API for text-to-transaction, bill scanning (OCR + AI), and image captioning. Powers the Spendeka app.*

[Setup](#setup) · [Endpoints](#endpoints) · [Deployed](#deployed-api)

</div>

---

## About

This backend serves the **Spendeka** mobile app with three AI-powered features:

| Feature | Description |
|--------|-------------|
| **Text-to-transaction** | Free text → structured transaction (amount, category, date) via Gemini |
| **Scan bill** | Bill/receipt image → OCR (Tesseract) + Gemini parsing → `rawText` + `parsed` transaction |
| **Image caption** | Image → caption + item list via Gemini vision |

The app uses the **deployed API** by default. Run this repo locally only when developing or testing the API.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Scripts](#scripts)
- [Tech stack](#tech-stack)
- [Endpoints](#endpoints)
- [Deployed API](#deployed-api)

---

## Prerequisites

- **Node.js** 18+
- **Google AI (Gemini) API key** – [Get one here](https://aistudio.google.com/app/apikey)

---

## Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Environment**

   ```bash
   cp .env.example .env
   ```

   Configure `.env`:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `GEMINI_API_KEY` | Yes | Google AI (Gemini) API key |
   | `GEMINI_MODEL` | No | Model name (default: `gemini-2.5-flash`) |
   | `PORT` | No | Server port (default: `4000`) |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run with tsx watch (development) |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled `dist/index.js` (production) |

---

## Tech stack

| Layer | Tech |
|-------|------|
| **Runtime** | Node.js, ES modules |
| **Server** | Express, CORS, express-rate-limit |
| **Uploads** | Multer (multipart/form-data) |
| **AI** | Google Gemini (text + vision) |
| **OCR** | Tesseract.js (bill scanning) |
| **Language** | TypeScript, tsx (dev) |

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check → `{ ok: true, message: "Spendeka API running" }` |
| GET | `/health` | Simple health → `{ ok: true }` |
| POST | `/text-to-transaction` | **Body:** `{ text: string, language?: "vie" \| "eng" }` → parsed transaction |
| POST | `/scan-bill` | **Form:** `file` (image), optional `language` ("vie" \| "eng") → `{ rawText, parsed }` |
| POST | `/image-caption` | **Form:** `file` (image), optional `language` → `{ items, caption }` |

All POST endpoints accept optional `language`: `"vie"` (Vietnamese) or `"eng"` (English). Default is `"eng"`.

---

## Deployed API

Production base URL:

**https://spendeka-backend-2.onrender.com**

The Spendeka Expo app is configured to use this URL by default. No local server is required for normal app development.

---

<div align="center">

**Spendeka Backend** · *version 1.0.0*

[Deployed API](https://spendeka-backend-2.onrender.com) · [App README](../README.md)

</div>
