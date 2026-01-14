// app/(pos)/pos/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTerminalStore } from "@/stores/terminal.store";
import { useCashStore } from "@/stores/cash.store";
import { useApiConnectivity } from "@/components/features/dashboard/hooks/useApiConnectivity";

export default function PosEntryPage() {
  const router = useRouter();
  const { apiStatus } = useApiConnectivity(15000);

  const terminalReady = Boolean(useTerminalStore((s) => s.xTerminalId));
  const cashOpen = Boolean(useCashStore((s) => s.active));
  const cashStatus = useCashStore((s) => s.status);

  useEffect(() => {
    if (apiStatus !== "online") return;
    if (!terminalReady) return;
    if (cashStatus === "unknown") return;

    if (cashOpen) router.replace("/pos/sales/new");
    // si no, te quedas en /pos y el modal se abre solo
  }, [apiStatus, terminalReady, cashStatus, cashOpen, router]);

  return null;
}
