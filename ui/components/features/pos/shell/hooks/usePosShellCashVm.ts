// components/features/pos/shell/hooks/usePosShellCashVm.ts
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { notify } from "@/lib/notify/notify";
import { cashService } from "@/lib/modules/cash/cash.service";
import type { CashCounted, CashCountReportDTO } from "@/lib/modules/cash/cash.dto";

import type { MeUser } from "@/lib/cash.types";
import { useCashStore } from "@/stores/cash.store";
import { useSessionStore } from "@/stores/session.store";
import { useTerminalStore } from "@/stores/terminal.store";
import { usePosShellOverlays } from "@/stores/posShellOverlays.store";

import { usePosCashierGate } from "@/components/features/pos/cash/hooks/usePosCashierGate";

type Role = "ADMIN" | "MANAGER" | "CASHIER";
type CountResult = { report: CashCountReportDTO };

export type PosShellCashVm = {
  role: Role;
  gate: ReturnType<typeof usePosCashierGate>;

  cashSessionId: string | null;
  xTerminalId: string | null;

  cashModalOpen: boolean;
  cashMode: "COUNT" | "CLOSE";
  closeCashModal: () => void;

  onOpenCountModal: () => void;
  onRequestOpenCloseModal: () => void;

  onCountCash: (counted: CashCounted) => Promise<CountResult>;
  onCloseCash: (counted: CashCounted) => Promise<void>;

  onGoAdmin: () => void;
  onRefresh: () => void;
};

export function usePosShellCashVm(args: {
  initialUser: MeUser;
  pollMs?: number;
}): PosShellCashVm {
  const router = useRouter();
  const pathname = usePathname();

  // session init
  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);
  const user = useSessionStore((s) => s.user);

  React.useEffect(() => {
    setUser(args.initialUser);
    setStatus("authenticated");
  }, [args.initialUser, setUser, setStatus]);

  // gate
  const gate = usePosCashierGate(args.pollMs ?? 15000);

  // terminal
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  // cash
  const cashActive = useCashStore((s) => s.active);
  const setCashActive = useCashStore((s) => s.setActive);
  const cashSessionId = cashActive?.id ?? null;

  // overlays (✅ store ya tipado)
  const cashModalOpen = usePosShellOverlays((s) => s.cashModalOpen);
  const cashMode = usePosShellOverlays((s) => s.cashMode);
  const openCashModal = usePosShellOverlays((s) => s.openCashModal);
  const closeCashModal = usePosShellOverlays((s) => s.closeCashModal);

  // confirm close (solo para abrir el modal CLOSE)

  // navegación cuando ya está listo
  React.useEffect(() => {
    if (!gate.readyToSell) return;
    if (pathname.startsWith("/pos/sales/new")) return;
    router.replace("/pos/sales/new");
  }, [gate.readyToSell, pathname, router]);

  const role: Role = user?.role ?? "CASHIER";

  const onOpenCountModal = React.useCallback(() => {
    openCashModal("COUNT");
  }, [openCashModal]);

  const onRequestOpenCloseModal = React.useCallback(() => {
    if (!cashSessionId) {
      notify.warning({
        title: "No hay caja abierta",
        description: "Primero abre caja o espera a que se cargue la sesión activa.",
      });
      return;
    }
    openCashModal("CLOSE");
  }, [cashSessionId, openCashModal]);

  const onCountCash = React.useCallback(
    async (counted: CashCounted): Promise<CountResult> => {
      if (!cashSessionId) throw new Error("Missing cashSessionId");

      const report = await cashService.count(cashSessionId, counted);
      notify.success({ title: "Conteo aplicado", description: "Conteo registrado correctamente." });

      return { report };
    },
    [cashSessionId]
  );

  const onCloseCash = React.useCallback(
    async (counted: CashCounted): Promise<void> => {
      if (!cashSessionId) {
        notify.warning({
          title: "Caja no disponible",
          description: "No hay sesión de caja activa (cashSessionId). Refresca o abre caja primero.",
        });
        throw new Error("Missing cashSessionId");
      }

      if (!xTerminalId) {
        notify.warning({
          title: "Terminal no listo",
          description: "Falta x-terminal-id para cerrar caja.",
        });
        throw new Error("Missing xTerminalId");
      }

      try {
        await cashService.close(cashSessionId, counted);
        setCashActive(null);
        notify.success({ title: "Caja cerrada", description: "Se generó Z y la caja quedó cerrada." });
        router.replace("/pos");
      } catch (e: unknown) {
        notify.error({
          title: "No se pudo cerrar caja",
          description: e instanceof Error ? e.message : "Error cerrando caja",
        });
        throw e; // 👈 importante: para que el panel vea el error si quieres
      }
    },
    [cashSessionId, xTerminalId, setCashActive, router]
  );

  const onGoAdmin = React.useCallback(() => router.replace("/admin"), [router]);
  const onRefresh = React.useCallback(() => window.location.reload(), []);

  return {
    role,
    gate,

    cashSessionId,
    xTerminalId: xTerminalId ?? null,

    cashModalOpen,
    cashMode,
    closeCashModal,

    onOpenCountModal,
    onRequestOpenCloseModal,

    onCountCash,
    onCloseCash,

    onGoAdmin,
    onRefresh,
  };
}
