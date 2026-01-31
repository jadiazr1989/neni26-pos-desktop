// components/features/pos/shell/hooks/usePosCashierGate.ts
"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { useApiConnectivity } from "@/components/features/dashboard/hooks/useApiConnectivity";
import { cashService } from "@/lib/modules/cash/cash.service";
import { useCashStore } from "@/stores/cash.store";
import { useTerminalStore } from "@/stores/terminal.store";

type GateReason = "OFFLINE" | "NO_TERMINAL" | "NO_ACTIVE_CASH" | "CHECKING" | "OK";

function isTerminalRequiredRoute(pathname: string): boolean {
  return pathname === "/terminal-required" || pathname.startsWith("/terminal-required/");
}

export function usePosCashierGate(pollMs = 15000) {
  const router = useRouter();
  const pathname = usePathname();

  const hydrateTerminal = useTerminalStore((s) => s.hydrate);
  const hydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  const cashActive = useCashStore((s) => s.active);
  const setActiveCash = useCashStore((s) => s.setActive);

  const { apiStatus, lastPingAt } = useApiConnectivity(pollMs);

  const [checkingCash, setCheckingCash] = React.useState(false);
  const [checkedOnce, setCheckedOnce] = React.useState(false);

  // 1) hydrate terminal (una vez)
  React.useEffect(() => {
    void hydrateTerminal();
  }, [hydrateTerminal]);

  const terminalReady = Boolean(xTerminalId);
  const cashOpen = Boolean(cashActive);
  const online = apiStatus === "online";
  const offline = apiStatus === "offline";

  // ✅ 2) Redirect POS si NO hay terminal
  React.useEffect(() => {
    if (!hydrated) return;
    if (terminalReady) return;

    // evita loop: si ya estás en terminal-required, no redirijas
    if (isTerminalRequiredRoute(pathname)) return;

    router.replace("/terminal-required");
  }, [hydrated, terminalReady, router, pathname]);

  // 3) check cash (usa cashService.active())
  React.useEffect(() => {
    let mounted = true;

    async function run(): Promise<void> {
      if (!hydrated) return;
      if (!terminalReady) return;
      if (!online) return;

      if (cashOpen) {
        setCheckedOnce(true);
        return;
      }

      setCheckingCash(true);
      try {
        const active = await cashService.active(); // CashSessionDTO | null
        if (!mounted) return;

        if (active) {
          await setActiveCash(active);
        }
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
  }, [hydrated, terminalReady, online, cashOpen, setActiveCash]);

  const reason: GateReason = React.useMemo(() => {
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
