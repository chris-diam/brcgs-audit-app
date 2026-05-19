# BRCGS Food Safety Audit App

Cross-platform audit app for BRCGS Food Safety Issue 9 — runs on **iOS**, **Android**, and **Web** from a single codebase.

## Stack

- [Expo](https://expo.dev) SDK 52 + Expo Router
- React Native Web (browser support)
- NativeWind v4 (Tailwind CSS for React Native)
- Zustand (offline-first state + persistence)
- TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npx expo start
```

Then press:
- `w` — open in browser
- `a` — Android emulator
- `i` — iOS simulator
- Scan QR with **Expo Go** app for real device preview

## Features

- **344 BRCGS clauses** with **944 scored control points**
- Greek language interface
- Offline-first (AsyncStorage on mobile · localStorage on web)
- Automatic finding generation per clause
- Grade calculation: AA / A / B / C / D / F
- Full audit report with native share

## Project Structure

```
app/                    Expo Router screens
  (tabs)/
    index.tsx           Dashboard (grade + KPIs)
    audit.tsx           Clause list with search & filter
    report.tsx          Final report + share
  clause/[id].tsx       Clause detail + checklist

src/
  core/
    types.ts            TypeScript interfaces
    scoring.ts          Scoring, grading, finding logic
  data/
    index.ts            Clause data exports
    sections/           9 JSON files (one per BRCGS section)
    meta.json           Dataset metadata
  store/
    auditStore.ts       Zustand store (persisted)
  components/
    GradeBadge.tsx
    KPIBar.tsx
    SeverityPicker.tsx
    ClauseListItem.tsx
```

## Data

All 344 clauses and 944 control points are embedded in the app — no network required. Data sourced from BRCGS Food Safety Issue 9, Greek language version (v34.7.33).
