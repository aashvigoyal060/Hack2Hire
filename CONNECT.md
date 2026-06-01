# Connect Frontend (Vercel) ↔ Backend (Railway)

## Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://hack2-hire-woad.vercel.app |
| Backend | https://hack2hire-backend-production.up.railway.app |

## How they connect

```
Browser → hack2-hire-woad.vercel.app/api/*
       → Vercel rewrite (vercel.json)
       → hack2hire-backend-production.up.railway.app/api/*
```

No CORS issues on the main app URL because the browser calls **same-origin** `/api`.

## Railway (backend)

1. Repo: `aashvigoyal060/Hack2Hire-Backend` (or deploy `backend/` from FinalGit)
2. **Variables:**

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon PostgreSQL URL |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Your OpenAI key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `CORS_ORIGIN` | `https://hack2-hire-woad.vercel.app` |

3. **Networking** → public domain generated  
4. Test: `https://hack2hire-backend-production.up.railway.app/health` → `{"status":"ok"}`

## Vercel (frontend)

1. Repo: `aashvigoyal060/Hack2Hire` (root `vercel.json` builds `frontend/`)
2. `config/backend-url.txt` and `vercel.json` must use the **same** Railway URL
3. Test: `https://hack2-hire-woad.vercel.app/api/health` → `{"status":"ok"}`
4. App home page shows **Backend connected** badge when linked

## Local dev

```bash
# Terminal 1
cd backend && cp .env.example .env && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

Frontend proxies `/api` → `http://localhost:5000` via `vite.config.ts`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| HTML instead of JSON | `vercel.json` rewrite missing or wrong Railway URL |
| CORS error | Set `CORS_ORIGIN` on Railway; use main Vercel URL not preview |
| 401 on preview URL | Use production URL or disable Deployment Protection |
| Resume/quiz 404 | Redeploy Railway after latest backend push |
