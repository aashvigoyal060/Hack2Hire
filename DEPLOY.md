# Deploy Hack2Hire — Vercel (frontend) + Railway (backend)

Project structure:

```
Hack2Hire/
├── frontend/     → Deploy to Vercel
├── backend/      → Deploy to Railway
└── shared/       → Source of truth (copied into frontend/ & backend/)
```

---

## 1. Backend — Railway

### Setup
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Set **Root Directory** to `backend`
3. Add a **PostgreSQL** plugin (or use your existing Neon `DATABASE_URL`)

### Environment variables (Railway → Variables)

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon/Railway Postgres connection string |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Your OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `CORS_ORIGIN` | Your Vercel URL, e.g. `https://hack2hire.vercel.app` |
| `PORT` | Railway sets this automatically |

### Push database schema (one time, locally)

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL
npm install
npm run db:push
```

### Verify
After deploy, open: `https://YOUR-RAILWAY-APP.railway.app/api/health`  
You should see: `{"status":"ok",...}`

---

## 2. Frontend — Vercel

### Setup
1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`

### Environment variables (Vercel → Settings → Environment Variables)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway backend URL, e.g. `https://your-app.railway.app` |

> **Important:** No trailing slash on `VITE_API_URL`.

### Redeploy
After adding env vars, trigger a **Redeploy** so Vite bakes in the API URL.

---

## 3. Local development

**Terminal 1 — Backend:**
```bash
cd backend
cp .env.example .env   # configure DATABASE_URL, OpenAI key
npm install
npm run dev              # http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173 (proxies /api → backend)
```

For local dev, leave `VITE_API_URL` unset — Vite proxies `/api` to `localhost:5000`.

---

## 4. CORS checklist

If the frontend can't reach the API:

1. `CORS_ORIGIN` on Railway must exactly match your Vercel domain (no trailing slash)
2. `VITE_API_URL` on Vercel must exactly match your Railway domain
3. Redeploy both after changing env vars

---

## 5. Free tier notes

- **Vercel:** Free hobby tier — great for React/Vite SPAs
- **Railway:** $5/month free credit (may require card) — use **Neon** for free Postgres instead of Railway DB if needed
- **Neon:** Free Postgres tier works with Railway backend via `DATABASE_URL`
