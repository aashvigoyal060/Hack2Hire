/**
 * API base URL:
 * - Dev: Vite proxy (`/api` → localhost:5000) when VITE_API_URL unset
 * - Prod: `VITE_API_URL` from build, or same-origin `/api` (Vercel proxy → Railway)
 */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL?.trim() ?? "";
  if (base) return base.replace(/\/$/, "");
  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  return base ? `${base}${path}` : path;
}

export function isApiConfigured(): boolean {
  if (import.meta.env.DEV) return true;
  return Boolean(getApiBase()) || import.meta.env.PROD;
}

export async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    if (json.message) return json.message;
  } catch {
    /* not json */
  }
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    return "API returned HTML instead of JSON — check config/backend-url.txt or VITE_API_URL.";
  }
  return text.slice(0, 200) || res.statusText || "Request failed";
}
