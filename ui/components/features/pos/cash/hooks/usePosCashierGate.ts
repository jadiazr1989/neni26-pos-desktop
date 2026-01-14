// components/features/pos/shell/hooks/usePosCashierGate.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useTerminalStore } from "@/stores/terminal.store";
import { useCashStore } from "@/stores/cash.store";

import { useApiConnectivity } from "@/components/features/dashboard/hooks/useApiConnectivity";
import { getActiveCashSessionOrThrow } from "@/components/features/pos/cash/services/getActiveCashSessionOrThrow";

type GateReason =
  | "OFFLINE"
  | "NO_TERMINAL"
  | "NO_ACTIVE_CASH"
  | "CHECKING"
  | "OK";

export function usePosCashierGate(pollMs = 15000) {
  const router = useRouter();
  const pathname = usePathname();

  const hydrateTerminal = useTerminalStore((s) => s.hydrate);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  const cashActive = useCashStore((s) => s.active);
  const setActiveCash = useCashStore((s) => s.setActive);

  const { apiStatus, lastPingAt } = useApiConnectivity(pollMs);

  const [checkingCash, setCheckingCash] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  // 1) hydrate terminal
  useEffect(() => {
    hydrateTerminal();
  }, [hydrateTerminal]);

  const terminalReady = Boolean(xTerminalId);
  const cashOpen = Boolean(cashActive);
  const online = apiStatus === "online";
  const offline = apiStatus === "offline";

  // 2) si no hay terminal => /boot
  useEffect(() => {
    if (pathname.startsWith("/boot")) return;
    if (!terminalReady) router.replace("/boot");
  }, [terminalReady, router, pathname]);

  // 3) si online + terminal => check cash activa (1 vez al entrar o cuando cambie terminal/online)
  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!terminalReady) return;
      if (!online) return;

      // si ya está abierta, no gastes request
      if (cashOpen) {
        setCheckedOnce(true);
        return;
      }

      setCheckingCash(true);
      try {
        const dto = await getActiveCashSessionOrThrow({ terminalId: xTerminalId! });
        if (!mounted) return;

        if (dto.cashSession) {
          setActiveCash(dto.cashSession);
        }
        setCheckedOnce(true);
      } catch {
        // si falla el check (403/500/etc) igual marcamos checkedOnce para no loop infinito,
        // y el modal puede bloquear venta hasta que el usuario refresque o vuelva online.
        if (mounted) setCheckedOnce(true);
      } finally {
        if (mounted) setCheckingCash(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [terminalReady, online, cashOpen, xTerminalId, setActiveCash]);

  const reason: GateReason = useMemo(() => {
    if (!terminalReady) return "NO_TERMINAL";
    if (offline) return "OFFLINE";
    if (checkingCash) return "CHECKING";
    if (online && checkedOnce && !cashOpen) return "NO_ACTIVE_CASH";
    if (online && cashOpen) return "OK";
    return "CHECKING";
  }, [terminalReady, offline, checkingCash, online, checkedOnce, cashOpen]);

  const readyToSell = online && terminalReady && cashOpen;

  // Modal obligatorio SOLO cuando: online + terminalReady + ya chequeaste + no cash
  const openModal = online && terminalReady && checkedOnce && !cashOpen;

  // canSubmit: por ejemplo, si tienes terminalId y online
  const canSubmit = online && terminalReady;

  return {
    apiStatus,
    lastPingAt,
    xTerminalId: xTerminalId ?? null,
    terminalReady,
    cashOpen,
    readyToSell,
    openModal,
    canSubmit,
    reason,
    offline,
  };
}
