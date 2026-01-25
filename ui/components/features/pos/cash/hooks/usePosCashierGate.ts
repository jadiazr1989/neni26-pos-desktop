// components/features/pos/shell/hooks/usePosCashierGate.ts
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useApiConnectivity } from "@/components/features/dashboard/hooks/useApiConnectivity";
import { getActiveCashSessionOrThrow } from "@/components/features/pos/cash/services/getActiveCashSessionOrThrow";
import { useCashStore } from "@/stores/cash.store";
import { useTerminalStore } from "@/stores/terminal.store";

type GateReason = "OFFLINE" | "NO_TERMINAL" | "NO_ACTIVE_CASH" | "CHECKING" | "OK";

export function usePosCashierGate(pollMs = 15000) {
  const router = useRouter();
  const pathname = usePathname();

  const hydrateTerminal = useTerminalStore((s) => s.hydrate);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  const cashActive = useCashStore((s) => s.active);
  const setActiveCash = useCashStore((s) => s.setActive);

  const { apiStatus, lastPingAt } = useApiConnectivity(pollMs);

  const [checkingCash, setCheckingCash] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  // 1) hydrate terminal (una vez)
  useEffect(() => {
    void hydrateTerminal();
  }, [hydrateTerminal]);

  const terminalReady = Boolean(xTerminalId);
  const cashOpen = Boolean(cashActive);
  const online = apiStatus === "online";
  const offline = apiStatus === "offline";

  // ✅ 2) NO redirijas hasta que hydrated=true
  useEffect(() => {
    if (!hydrated) return; // <- CLAVE
    if (pathname.startsWith("/admin/dashboard")) return; // evita loops raros si compartes shell
    if (!terminalReady) router.replace("/admin/dashboard"); // o "/terminal-required"
  }, [hydrated, terminalReady, router, pathname]);

  // 3) check cash
  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!hydrated) return;        // <- CLAVE (no checks antes de hidratar)
      if (!terminalReady) return;
      if (!online) return;

      if (cashOpen) {
        setCheckedOnce(true);
        return;
      }

      setCheckingCash(true);
      try {
        const dto = await getActiveCashSessionOrThrow({ terminalId: xTerminalId! });
        if (!mounted) return;
        if (dto.cashSession) setActiveCash(dto.cashSession);
        setCheckedOnce(true);
      } catch {
        if (mounted) setCheckedOnce(true);
      } finally {
        if (mounted) setCheckingCash(false);
      }
    }

    void run();
    return () => {
      mounted = false;
    };
  }, [hydrated, terminalReady, online, cashOpen, xTerminalId, setActiveCash]);

  const reason: GateReason = useMemo(() => {
    if (!hydrated) return "CHECKING";
    if (!terminalReady) return "NO_TERMINAL";
    if (offline) return "OFFLINE";
    if (checkingCash) return "CHECKING";
    if (online && checkedOnce && !cashOpen) return "NO_ACTIVE_CASH";
    if (online && cashOpen) return "OK";
    return "CHECKING";
  }, [hydrated, terminalReady, offline, checkingCash, online, checkedOnce, cashOpen]);

  const readyToSell = online && hydrated && terminalReady && cashOpen;
  const openModal = online && hydrated && terminalReady && checkedOnce && !cashOpen;
  const canSubmit = online && hydrated && terminalReady;

  return {
    apiStatus,
    lastPingAt,
    xTerminalId: xTerminalId ?? null,
    hydrated,
    terminalReady,
    cashOpen,
    readyToSell,
    openModal,
    canSubmit,
    reason,
    offline,
  };
}
