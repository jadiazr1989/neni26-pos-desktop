// ui/app/redirect/redirect-client.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { SplashGate } from "@/components/shared/SplashGate";
import { useTerminalStore } from "@/stores/terminal.store";

type Role = "ADMIN" | "MANAGER" | "CASHIER";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export default function RedirectClient({ role }: { role: Role }) {
  const router = useRouter();

  const hydrate = useTerminalStore((s) => s.hydrate);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  const [subtitle, setSubtitle] = useState("Preparando el dispositivo…");
  const ran = useRef(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ran.current) return;
    if (!hydrated) return;

    ran.current = true;

    const run = async () => {
      setSubtitle("Verificando acceso…");
      await sleep(1200);

      const isAdmin = role === "ADMIN" || role === "MANAGER";

      if (isAdmin) {
        router.replace(xTerminalId ? "/admin" : "/admin/device");
        return;
      }

      router.replace(xTerminalId ? "/pos" : "/terminal-required");
    };

    void run();
  }, [hydrated, role, xTerminalId, router]);

  return <SplashGate title="Iniciando Session…" subtitle={subtitle} />;
}
