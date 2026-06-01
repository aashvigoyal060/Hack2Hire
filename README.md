# Hack2Hire — AI Interview Coach

Practice technical interviews with an AI interviewer that reads your **resume** and **job description**, asks adaptive questions, scores answers in real time, and generates a readiness report.

## Live URLs

| App | URL |
|-----|-----|
| **Frontend (Vercel)** | [https://hack2-hire-woad.vercel.app/](https://hack2-hire-woad.vercel.app/) |
| **Backend API (Railway)** | [https://hack2hire-backend-production.up.railway.app/health](https://hack2hire-backend-production.up.railway.app/health) |

## Repos

| Repo | URL |
|------|-----|
| **Frontend + Root Repo | [https://github.com/aashvigoyal060/Hack2Hire](https://github.com/aashvigoyal060/Hack2Hire) |
| **Backend Repo** | [https://github.com/aashvigoyal060/Hack2Hire-Backend](https://github.com/aashvigoyal060/Hack2Hire-Backend) |

## Features

- **Resume PDF upload** — ATS score, keyword match/miss, interview readiness verdict
- **Tech quiz** — Interview-level MCQ questions for JavaScript, React, Node.js, SQL, Python, TypeScript
- **LeetCode practice** — Random coding problems by skill & difficulty
- **English aptitude** — Grammar, vocabulary, reading comprehension
- **Math aptitude** — Arithmetic, algebra, number series, probability
- **Voice questions** — AI questions read aloud (browser text-to-speech) plus voice answers (speech-to-text)
- Timed questions (120s per question), live scoring, session history, PDF report
- Interview modes: behavioral, technical, system design, mixed
- Dark / light theme

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query, shadcn/ui |
| Backend | Node.js, Express, Drizzle ORM, PostgreSQL (Neon) |
| AI | OpenAI API |
| Deploy | Vercel (frontend), Railway (backend) |

## Repository Structure

```
Hack2Hire/
├── frontend/          # React SPA (deploy to Vercel)
│   └── README.md
├── backend/         # Express API (deploy to Railway)
│   └── README.md
├── config/
│   └── backend-url.txt
├── scripts/
│   └── prepare-deploy.mjs
├── vercel.json       # Vercel build & API rewrites
└── README.md
```

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL connection string (e.g., [Neon](https://neon.tech))
- OpenAI API key

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env: DATABASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY, etc.
npm install
npm run db:push
npm run dev
```
Runs at http://localhost:5000.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Runs at http://localhost:5173 (proxies /api to the backend).

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| AI_INTEGRATIONS_OPENAI_API_KEY | OpenAI API key |
| AI_INTEGRATIONS_OPENAI_BASE_URL | https://api.openai.com/v1 |
| CORS_ORIGIN | Frontend URL(s), comma-separated |
| PORT | 5000 locally (Railway sets this in prod) |

### Frontend

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend URL in production (optional if using Vercel /api rewrite |

Production backend URL is also in `config/backend-url.txt`.

## Deployment

### Frontend (Vercel)

1. Import the root `Hack2Hire` repo on [Vercel](https://vercel.com).
2. The root `vercel.json` builds `frontend/`, serves `frontend/dist`, and rewrites /api/* to your backend.

### Backend (Railway)

1. Deploy the `Hack2Hire-Backend` repo on Railway (or connect `backend/` from here).
2. Set variables from table above.
3. Networking → Generate Domain for public URL.
4. Set `CORS_ORIGIN` to `https://hack2-hire-woad.vercel.app`.
5. Redeploy to apply changes.

## License
MIT
## Author
[Aashvi Goyal](https://github.com/aashvigoyal060)
