/** Backend base URL — required on Vercel (set VITE_API_URL in project env vars). */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL?.trim() ?? "";
  if (!base && import.meta.env.PROD) {
    console.error(
      "VITE_API_URL is not set. Add your Railway backend URL in Vercel → Settings → Environment Variables, then redeploy.",
    );
  }
  return base.replace(/\/$/, "");
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  if (!base) {
    if (import.meta.env.PROD) {
      throw new Error(
        "Backend API URL is not configured. Set VITE_API_URL in Vercel to your Railway URL (e.g. https://xxx.up.railway.app), then redeploy.",
      );
    }
    return path;
  }
  return `${base}${path}`;
}

export function isApiConfigured(): boolean {
  return Boolean(getApiBase());
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
    return "API returned HTML instead of JSON — is VITE_API_URL set to your Railway backend?";
  }
  return text.slice(0, 200) || res.statusText || "Request failed";
}
