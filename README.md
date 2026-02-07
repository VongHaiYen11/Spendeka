<div align="center">

# Spendeka

**Track spending. Scan bills. Understand your money.**

[![Expo](https://img.shields.io/badge/Expo-~54-000020?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)

*A cross-platform expense tracker with AI-powered bill scanning and text-to-transaction.*

[Features](#features) • [Setup](#setup) • [Tech stack](#tech-stack) • [Backend](#backend-api)

</div>

---

## About

Spendeka helps you record and analyze spending. You can add transactions manually, type a sentence and let the app parse it into amount/category/date, or scan a bill/receipt to auto-fill details. Data is stored in Firebase and synced across devices. The app supports light/dark theme, accent colors, and multiple languages (e.g. English, Vietnamese).

---

## Table of contents

- [Features](#features)
- [Preview](#preview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Scripts](#scripts)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Backend API](#backend-api)

---

## Preview

<!-- Add screenshots or a short GIF here. Example:
![Home](docs/screenshots/home.png) | ![Scan bill](docs/screenshots/scan.png) | ![Summary](docs/screenshots/summary.png)
-->

*Add screenshots or a demo GIF to showcase the app (e.g. Home, Scan bill, Summary).*

---

## Features

- **Home** – Today’s income and spent summary, quick actions to add via text or scan bill, and embedded day-level charts.
- **Add / Edit transaction** – Amount, category, date, note, type (income/expense), and optional photo; supports text-to-transaction and scan-bill flows.
- **Scan bill** – Take or pick a bill/receipt image; OCR + AI extracts amount, items, and category (uses deployed API).
- **Text to transaction** – Type a line like “Coffee 50k yesterday”; AI returns a structured transaction you can save (uses deployed API).
- **Camera / expense calendar** – Calendar view of expenses with images, detail and preview screens.
- **History** – Full transaction list with search, filters, and date grouping.
- **Summary** – Overview chart and category breakdown for day/week/month/year; date range picker and transaction list.
- **Settings** – Dark/light mode, accent color picker, language, daily reminder time, personal info, change password, clear data, logout.
- **Auth** – Email sign-in, register, and verify email (Firebase).

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for device testing) or iOS/Android simulator

## Setup

1. **Clone and install**

   ```bash
   cd Spendeka
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and adjust if needed. The app defaults to the deployed API; you only override when running the API locally.

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `EXPO_PUBLIC_API_BASE_URL` | Backend API base URL. Default: `https://spendeka-backend-2.onrender.com`. Override with e.g. `http://192.168.x.x:4000` when running the backend locally. |

3. **Firebase / Cloudinary** (if used)

   Configure Firebase and Cloudinary per your project (see `src/config/firebaseConfig.js`, `src/config/cloudinaryConfig.ts`). Add any extra keys to `.env` as needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in web browser |

---

## Tech stack

| Layer | Tech |
|-------|------|
| **Framework** | Expo (React Native), expo-router |
| **UI** | NativeWind (Tailwind), React Native components |
| **Backend / Auth** | Firebase (Auth, Firestore) |
| **Media** | Cloudinary (images), expo-camera, expo-image-picker |
| **AI / Parsing** | Deployed API (Gemini for text & bill parsing, Tesseract for OCR) |
| **i18n & theme** | Custom i18n (EN / VI), dark mode, accent colors |

---

## Project structure

- `src/app/` – expo-router screens and layouts (tabs, auth, history, settings, summary, etc.)
- `src/components/` – shared UI components
- `src/config/` – API base URL, Firebase, Cloudinary
- `src/contexts/` – Auth, Theme, Transaction, UserProfile
- `src/screens/` – feature screens (addTransaction, camera, history, home, settings, summary)
- `src/services/` – ImageService, TransactionService, NotificationService
- `src/models/`, `src/types/`, `src/utils/`, `src/i18n/` – models, types, helpers, i18n
- `backend/` – Optional Node/Express API (text-to-transaction, scan-bill, image-caption). The app uses the **deployed API** by default; see `backend/README.md` to run it locally.

---

## Backend API

The app calls these endpoints (default base URL: **https://spendeka-backend-2.onrender.com**):

- `POST /text-to-transaction` – parse free text into a transaction
- `POST /scan-bill` – OCR + parse bill image
- `POST /image-caption` – generate caption and items from image

You do **not** need to run the backend on your machine unless you are developing it. See `backend/README.md` for local setup.

---

<div align="center">

**Spendeka** · *version 1.0.0*

[Deployed API](https://spendeka-backend-2.onrender.com) · [Backend README](backend/README.md)

</div>
