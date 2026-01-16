"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/fetch";

export type ApiStatus = "online" | "offline" | "unknown";

export function useApiConnectivity(
  pollMs = 3000
): { apiStatus: ApiStatus; lastPingAt: string | null } {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("unknown");
  const [lastPingAt, setLastPingAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const tick = async () => {
      try {
        // Si tu backend está local, esto debería funcionar incluso sin internet.
        await apiFetch<{ ok: true }>("/health", { method: "GET" });

        if (!mounted) return;
        setApiStatus("online");
        setLastPingAt(new Date().toLocaleTimeString());
      } catch {
        if (!mounted) return;
        setApiStatus("offline"); 
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), pollMs);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return { apiStatus, lastPingAt };
}
