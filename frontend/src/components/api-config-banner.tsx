import { isApiConfigured } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

export default function ApiConfigBanner() {
  if (!import.meta.env.PROD || isApiConfigured()) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-3 text-center text-sm font-medium flex items-center justify-center gap-2">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>
        Backend not connected — add{" "}
        <code className="bg-black/20 px-1 rounded">VITE_API_URL</code> in Vercel (your Railway URL), then
        redeploy.
      </span>
    </div>
  );
}
