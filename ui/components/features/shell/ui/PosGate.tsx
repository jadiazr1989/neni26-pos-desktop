"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTerminalStore } from "@/stores/terminal.store";

export function PosGate() {
  const router = useRouter();
  const pathname = usePathname();

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrate = useTerminalStore((s) => s.hydrate);

  // 1) cargar terminal desde localStorage al entrar al área POS
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 2) si estamos en POS y no hay terminal, mandamos a /boot
  useEffect(() => {
    // evita loop cuando ya estás en /boot
    if (pathname.startsWith("/boot")) return;

    if (!xTerminalId) {
      router.replace("/boot");
    }
  }, [xTerminalId, router, pathname]);

  return null;
}
