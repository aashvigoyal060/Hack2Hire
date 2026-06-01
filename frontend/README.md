# Hack2Hire Frontend

React + TypeScript + Vite application for the AI interview platform, deployed on Vercel.

## Live URL

[https://hack2-hire-woad.vercel.app/](https://hack2-hire-woad.vercel.app/)

## Tech Stack

- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- TanStack Query
- Lucide React (icons)
- Framer Motion (animations)

## Features

- AI-powered mock interviews
- Resume ATS score and analysis
- Technical quiz (MCQ) by skillset
- LeetCode-style coding problem practice
- English aptitude practice
- Math aptitude practice
- Voice questions & speech-to-text answers
- Interview history
- Readiness report generation
- Light/dark theme

## Local Development

1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Open [http://localhost:5173](http://localhost:5173)

## Environment Variables

Create a `.env` (optional):
```
VITE_API_URL=http://localhost:5000
```

In production, Vercel's `vercel.json` automatically proxies `/api/*` to the backend.

## Deployment (Vercel)

Import this repo (or the root `Hack2Hire` repo) on [Vercel](https://vercel.com). The `vercel.json` in the repo root will handle the build.

## Repo

- GitHub: [https://github.com/aashvigoyal060/Hack2Hire](https://github.com/aashvigoyal060/Hack2Hire)
