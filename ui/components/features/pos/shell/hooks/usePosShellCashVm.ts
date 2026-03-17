// components/features/pos/shell/hooks/usePosShellCashVm.ts
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { notify } from "@/lib/notify/notify";
import { cashService } from "@/lib/modules/cash/cash.service";
import type {
  CashCloseWarningDTO,
  CashCloseWarningLevel,
  CashCounted,
  CashCountReportDTO,
  CashSessionCloseReason,
  CashSessionDTO,
} from "@/lib/modules/cash/cash.dto";

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

  cashSession: CashSessionDTO | null;
  cashSessionId: string | null;
  xTerminalId: string | null;

  cashOpen: boolean;
  cashStatus: "OPEN" | "CLOSED" | null;
  businessDay: string | null;
  shiftLabel: string | null;

  warning: CashCloseWarningDTO | null;
  warningLevel: CashCloseWarningLevel;
  closingSoon: boolean;
  minutesUntilClose: number | null;
  canOpenNow: boolean;
  closeWarningMessage: string | null;

  isHydratingCashStore: boolean;
  isLoadingCashState: boolean;
  isRefreshingCashState: boolean;

  cashModalOpen: boolean;
  cashMode: "COUNT" | "CLOSE";
  closeCashModal: () => void;

  reloadCashState: () => Promise<void>;

  onOpenCountModal: () => void;
  onRequestOpenCloseModal: () => void;

  onCountCash: (counted: CashCounted) => Promise<CountResult>;
  onCloseCash: (
    counted: CashCounted,
    options?: { closeReason?: CashSessionCloseReason | null }
  ) => Promise<void>;

  onGoAdmin: () => void;
  onRefresh: () => void;
};

function sameSession(
  a: CashSessionDTO | null,
  b: CashSessionDTO | null
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.id === b.id &&
    a.warehouseId === b.warehouseId &&
    a.terminalId === b.terminalId &&
    a.openedAt === b.openedAt &&
    a.closedAt === b.closedAt &&
    a.businessDay === b.businessDay &&
    a.status === b.status &&
    a.openReason === b.openReason &&
    a.closeReason === b.closeReason &&
    a.shiftLabel === b.shiftLabel &&
    a.openedById === b.openedById &&
    a.closedById === b.closedById
  );
}

function sameWarning(
  a: CashCloseWarningDTO | null,
  b: CashCloseWarningDTO | null
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    a.level === b.level &&
    a.isWithinOperatingWindow === b.isWithinOperatingWindow &&
    a.canOpenNow === b.canOpenNow &&
    a.minutesUntilClose === b.minutesUntilClose &&
    a.businessDay === b.businessDay &&
    a.closesAt === b.closesAt &&
    a.message === b.message
  );
}

export function usePosShellCashVm(args: {
  initialUser: MeUser;
  pollMs?: number;
}): PosShellCashVm {
  const router = useRouter();
  const pathname = usePathname();
  const pollMs = args.pollMs ?? 15000;

  // session
  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);
  const user = useSessionStore((s) => s.user);

  React.useEffect(() => {
    setUser(args.initialUser);
    setStatus("authenticated");
  }, [args.initialUser, setUser, setStatus]);

  // gate
  const gate = usePosCashierGate(pollMs);

  // terminal
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  // cash store
  const cashActiveRef = useCashStore((s) => s.active);
  const hydrateCashStore = useCashStore((s) => s.hydrate);
  const setCashFromSession = useCashStore((s) => s.setFromSession);
  const clearCashStore = useCashStore((s) => s.clear);

  // overlays
  const cashModalOpen = usePosShellOverlays((s) => s.cashModalOpen);
  const cashMode = usePosShellOverlays((s) => s.cashMode);
  const openCashModal = usePosShellOverlays((s) => s.openCashModal);
  const closeCashModal = usePosShellOverlays((s) => s.closeCashModal);

  // local state
  const [cashSession, setCashSession] = React.useState<CashSessionDTO | null>(null);
  const [warning, setWarning] = React.useState<CashCloseWarningDTO | null>(null);
  const [isHydratingCashStore, setIsHydratingCashStore] = React.useState(true);
  const [isLoadingCashState, setIsLoadingCashState] = React.useState(true);
  const [isRefreshingCashState, setIsRefreshingCashState] = React.useState(false);

  const role: Role = user?.role ?? "CASHIER";

  const isMountedRef = React.useRef(true);
  const hydratedRef = React.useRef(false);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const applySession = React.useCallback(
    async (nextSession: CashSessionDTO | null) => {
      if (!isMountedRef.current) return;

      setCashSession((prev) => (sameSession(prev, nextSession) ? prev : nextSession));
      await setCashFromSession(nextSession);
    },
    [setCashFromSession]
  );

  const applyWarning = React.useCallback((nextWarning: CashCloseWarningDTO | null) => {
    if (!isMountedRef.current) return;

    setWarning((prev) => (sameWarning(prev, nextWarning) ? prev : nextWarning));
  }, []);

  const fetchCashState = React.useCallback(async () => {
    const [active, closeWarning] = await Promise.all([
      cashService.active(),
      cashService.closeWarning(),
    ]);

    await applySession(active);
    applyWarning(closeWarning);

    return { active, closeWarning };
  }, [applySession, applyWarning]);

  const loadCashState = React.useCallback(
    async (opts?: { silent?: boolean; notifyOnError?: boolean }) => {
      const silent = opts?.silent ?? false;
      const notifyOnError = opts?.notifyOnError ?? !silent;

      if (!silent) {
        setIsLoadingCashState(true);
      } else {
        setIsRefreshingCashState(true);
      }

      try {
        await fetchCashState();
      } catch (e) {
        if (notifyOnError) {
          notify.error({
            title: "No se pudo cargar el estado de caja",
            description:
              e instanceof Error ? e.message : "Error consultando caja activa.",
          });
        }
      } finally {
        if (!isMountedRef.current) return;

        if (!silent) {
          setIsLoadingCashState(false);
        } else {
          setIsRefreshingCashState(false);
        }
      }
    },
    [fetchCashState]
  );

  // hydrate store once
  React.useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        if (!hydratedRef.current) {
          await hydrateCashStore();
          hydratedRef.current = true;
        }

        if (!cancelled && isMountedRef.current) {
          setIsHydratingCashStore(false);
        }

        await loadCashState({ silent: false, notifyOnError: true });
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsHydratingCashStore(false);
          setIsLoadingCashState(false);
        }
      }
    };

    void boot();

    return () => {
      cancelled = true;
    };
  }, [hydrateCashStore, loadCashState]);

  // polling
  React.useEffect(() => {
    const id = window.setInterval(() => {
      void loadCashState({ silent: true, notifyOnError: false });
    }, pollMs);

    return () => window.clearInterval(id);
  }, [loadCashState, pollMs]);

  // navigation
  React.useEffect(() => {
    if (!gate.readyToSell) return;
    if (pathname.startsWith("/pos/sales/new")) return;
    router.replace("/pos/sales/new");
  }, [gate.readyToSell, pathname, router]);

  // fallback inicial desde store mientras carga backend
  const fallbackSessionId = cashActiveRef?.id ?? null;
  const fallbackBusinessDay = cashActiveRef?.businessDay ?? null;
  const fallbackShiftLabel = cashActiveRef?.shiftLabel ?? null;
  const fallbackStatus = cashActiveRef?.status ?? null;

  const cashSessionId = cashSession?.id ?? fallbackSessionId;
  const cashStatus = cashSession?.status ?? fallbackStatus ?? (cashSessionId ? "OPEN" : null);
  const cashOpen = !!cashSessionId && cashStatus === "OPEN";
  const businessDay = cashSession?.businessDay ?? warning?.businessDay ?? fallbackBusinessDay;
  const shiftLabel = cashSession?.shiftLabel ?? fallbackShiftLabel;

  const warningLevel: CashCloseWarningLevel = warning?.level ?? "none";
  const minutesUntilClose = warning?.minutesUntilClose ?? null;
  const canOpenNow = warning?.canOpenNow ?? true;
  const closeWarningMessage = warning?.message ?? null;
  const closingSoon = warningLevel !== "none";

  const reloadCashState = React.useCallback(async () => {
    await loadCashState({ silent: true, notifyOnError: true });
  }, [loadCashState]);

  const onOpenCountModal = React.useCallback(() => {
    if (!cashSessionId) {
      notify.warning({
        title: "No hay caja abierta",
        description: "Primero abre caja antes de realizar un conteo.",
      });
      return;
    }

    openCashModal("COUNT");
  }, [cashSessionId, openCashModal]);

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
      if (!cashSessionId) {
        notify.warning({
          title: "Caja no disponible",
          description: "No hay sesión activa para contar.",
        });
        throw new Error("Missing cashSessionId");
      }

      const report = await cashService.count(cashSessionId, counted);

      await applySession(report.cashSession);

      notify.success({
        title: "Conteo aplicado",
        description: "Conteo registrado correctamente.",
      });

      return { report };
    },
    [cashSessionId, applySession]
  );

  const onCloseCash = React.useCallback(
    async (
      counted: CashCounted,
      options?: { closeReason?: CashSessionCloseReason | null }
    ): Promise<void> => {
      if (!cashSessionId) {
        notify.warning({
          title: "Caja no disponible",
          description: "No hay sesión de caja activa. Refresca o abre caja primero.",
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
        await cashService.close(cashSessionId, counted, {
          closeReason: options?.closeReason ?? "END_OF_DAY",
        });

        if (isMountedRef.current) {
          setCashSession(null);
          setWarning(null);
        }

        await clearCashStore();
        closeCashModal();

        notify.success({
          title: "Caja cerrada",
          description: "Se generó Z y la caja quedó cerrada.",
        });

        router.replace("/pos");
      } catch (e: unknown) {
        notify.error({
          title: "No se pudo cerrar caja",
          description: e instanceof Error ? e.message : "Error cerrando caja",
        });
        throw e;
      }
    },
    [cashSessionId, xTerminalId, clearCashStore, closeCashModal, router]
  );

  const onGoAdmin = React.useCallback(() => {
    router.replace("/admin");
  }, [router]);

  const onRefresh = React.useCallback(() => {
    window.location.reload();
  }, []);

  return {
    role,
    gate,

    cashSession,
    cashSessionId,
    xTerminalId: xTerminalId ?? null,

    cashOpen,
    cashStatus,
    businessDay,
    shiftLabel,

    warning,
    warningLevel,
    closingSoon,
    minutesUntilClose,
    canOpenNow,
    closeWarningMessage,

    isHydratingCashStore,
    isLoadingCashState,
    isRefreshingCashState,

    cashModalOpen,
    cashMode,
    closeCashModal,

    reloadCashState,

    onOpenCountModal,
    onRequestOpenCloseModal,

    onCountCash,
    onCloseCash,

    onGoAdmin,
    onRefresh,
  };
}