// src/components/shared/guards/useRequireTerminal.ts
"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { useTerminalStore } from "@/stores/terminal.store";

export function useRequireTerminal(args: {
  enabled: boolean;                 // ej: true cuando user ya está auth
  allowPaths: string[];             // rutas permitidas sin terminal
  redirectTo: string;               // a dónde enviar si falta terminal
}) {
  const router = useRouter();
  const pathname = usePathname();

  const hydrate = useTerminalStore((s) => s.hydrate);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  React.useEffect(() => {
    void hydrate();
  }, [hydrate]);

  React.useEffect(() => {
    if (!args.enabled) return;
    if (!hydrated) return;

    const allowed = args.allowPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (allowed) return;

    if (!xTerminalId) router.replace(args.redirectTo);
  }, [args.enabled, hydrated, xTerminalId, pathname, router, args.allowPaths, args.redirectTo]);

  return { hydrated, xTerminalId };
}
