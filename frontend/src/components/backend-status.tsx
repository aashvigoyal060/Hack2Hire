import { useEffect, useState } from "react";
import { checkBackendHealth, RAILWAY_API_BASE } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wifi, WifiOff } from "lucide-react";

export default function BackendStatus() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkBackendHealth().then((healthy) => {
      if (!cancelled) setOk(healthy);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (ok === null) {
    return (
      <Badge variant="secondary" className="gap-1.5 font-normal">
        <Loader2 className="w-3 h-3 animate-spin" />
        Checking backend…
      </Badge>
    );
  }

  return (
    <Badge
      variant={ok ? "default" : "destructive"}
      className="gap-1.5 font-normal"
      title={RAILWAY_API_BASE}
    >
      {ok ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
      {ok ? "Backend connected" : "Backend offline"}
    </Badge>
  );
}
