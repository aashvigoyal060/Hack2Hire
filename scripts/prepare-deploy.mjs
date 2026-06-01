import { existsSync, readFileSync, writeFileSync } from "node:fs";

function readBackendUrl() {
  const configPath = "config/backend-url.txt";
  if (!existsSync(configPath)) return "";
  return (
    readFileSync(configPath, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("#")) ?? ""
  );
}

const url = readBackendUrl().replace(/\/$/, "");
const isValid = url.startsWith("https://");

if (isValid) {
  console.log(`[deploy] Backend URL: ${url}`);
  console.log("[deploy] Vercel serves /api via vercel.json rewrite → Railway");
  console.log("[deploy] Optional: set VITE_API_URL on Vercel only for direct Railway calls");
} else {
  console.warn("[deploy] Add Railway URL to config/backend-url.txt and vercel.json rewrites");
}
