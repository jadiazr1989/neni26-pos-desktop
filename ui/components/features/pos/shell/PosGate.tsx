"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTerminalStore } from "@/stores/terminal.store";

export function PosGate() {
  const router = useRouter();
  const pathname = usePathname();

  const xTerminalId = useTerminalStore((s) => s.xTerminalId);
  const hydrate = useTerminalStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (pathname.startsWith("/boot")) return;
    if (!xTerminalId) router.replace("/boot");
  }, [xTerminalId, router, pathname]);

  return null;
}
