/** Railway API — must match config/backend-url.txt and vercel.json rewrites */
export const RAILWAY_API_BASE = "https://hack2hire-backend-production.up.railway.app";

const PRODUCTION_APP_HOSTS = ["hack2-hire-woad.vercel.app", "hack2-hire.vercel.app"];

/**
 * API base URL:
 * - Dev: empty → Vite proxy `/api` → localhost:5000
 * - Prod (main Vercel): empty → `/api` → Vercel rewrite → Railway
 * - Prod (preview / other): Railway direct (avoids Vercel deployment protection on `/api`)
 */
export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (import.meta.env.PROD) {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (PRODUCTION_APP_HOSTS.includes(host)) return "";
      if (host.endsWith(".vercel.app")) return RAILWAY_API_BASE;
    }
    return "";
  }

  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export function isApiConfigured(): boolean {
  return import.meta.env.DEV || import.meta.env.PROD;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/api/health"), { method: "GET" });
    if (!res.ok) return false;
    const data = (await res.json()) as { status?: string };
    return data.status === "ok";
  } catch {
    return false;
  }
}

export async function parseApiError(res: Response): Promise<string> {
  if (res.status === 401) {
    return "API blocked (401). Use https://hack2-hire-woad.vercel.app or disable Vercel Deployment Protection on previews.";
  }
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    if (json.message) return json.message;
  } catch {
    /* not json */
  }
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    return "API not connected — check Railway is online and vercel.json rewrites.";
  }
  return text.slice(0, 200) || res.statusText || "Request failed";
}
