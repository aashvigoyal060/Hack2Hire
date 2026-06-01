/** Prefix API paths with the backend URL in production (Vercel). Empty in dev uses Vite proxy. */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL ?? "";
  if (!base) return path;
  return `${base.replace(/\/$/, "")}${path}`;
}
