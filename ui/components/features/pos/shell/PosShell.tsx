"use client";

import { usePathname, useRouter } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { useCallback, useEffect } from "react";

import type { CashCountReportDTO, CurrencyCode, MeUser } from "@/lib/cash.types";
import { useCashStore } from "@/stores/cash.store";
import { useSessionStore } from "@/stores/session.store";

import { CashOpenGateModal } from "@/components/features/pos/cash/ui/CashOpenGateModal";
import { usePosCashierGate } from "../cash/hooks/usePosCashierGate";

import { usePosSaleStore } from "@/stores/posSale.store";
import { PosBottomBar } from "./PosBottomBar";

import {
  closeCashSession,
  countCashSession,
} from "@/components/features/pos/cash/services/cashSession.actions";

import { usePosShellOverlays } from "@/stores/posShellOverlays.store";
import { CashCountCloseModal } from "../cash/ui/CashCountCloseModal";

import { CashSessionMenu } from "../cash/ui/CashSessionMenu";
import { PosShellTopBar } from "./ui/PosShellTopBar";
import { PosStatusBar } from "./ui/PosStatusBar";

function CashBadgeDot(props: { show: boolean }): JSX.Element | null {
  if (!props.show) return null;
  return (
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
  );
}

export function PosShell(props: {
  initialUser: MeUser;
  children: ReactNode;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const setUser = useSessionStore((s) => s.setUser);
  const setStatus = useSessionStore((s) => s.setStatus);
  const user = useSessionStore((s) => s.user);

  const gate = usePosCashierGate(15000);

  // overlays
  const cashModalOpen = usePosShellOverlays((s) => s.cashModalOpen);
  const cashMode = usePosShellOverlays((s) => s.cashMode);
  const openCashModal = usePosShellOverlays((s) => s.openCashModal);
  const closeCashModal = usePosShellOverlays((s) => s.closeCashModal);

  // sale state
  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);
  const saleStatus = usePosSaleStore((s) => s.status);
  const canPay = usePosSaleStore((s) => s.canPay);
  const clear = usePosSaleStore((s) => s.clear);
  const checkout = usePosSaleStore((s) => s.checkout);

  const cashActive = useCashStore((s) => s.active);
  const setCashActive = useCashStore((s) => s.setActive);

  useEffect(() => {
    setUser(props.initialUser);
    setStatus("authenticated");
  }, [props.initialUser, setUser, setStatus]);

  // navegación única cuando ya está listo
  useEffect(() => {
    if (!gate.readyToSell) return;
    if (pathname.startsWith("/pos/sales/new")) return;
    router.replace("/pos/sales/new");
  }, [gate.readyToSell, pathname, router]);

  const showBottomBar = pathname.startsWith("/pos/sales");
  const paying = saleStatus === "checking_out";

  const onCancelSale = useCallback(() => {
    if (items.length === 0) return;
    const ok = window.confirm("¿Cancelar la orden actual?");
    if (ok) clear();
  }, [items.length, clear]);

  const cashSessionId = cashActive?.id ?? null;
  const terminalId = gate.xTerminalId;
  const readyToSell = gate.readyToSell;

  const onPay = useCallback(async () => {
    if (!readyToSell) return;
    if (!terminalId) return;
    if (!cashSessionId) return;
    if (!canPay()) return;
    await checkout({ terminalId, cashSessionId });
  }, [readyToSell, terminalId, cashSessionId, canPay, checkout]);

  const onCountCash = useCallback(
    async (
      counted: Partial<Record<CurrencyCode, number>>
    ): Promise<{ report: CashCountReportDTO }> => {
      if (!terminalId || !cashSessionId) {
        throw new Error("Missing terminalId or cashSessionId");
      }
      return await countCashSession({ terminalId, cashSessionId, counted });
    },
    [terminalId, cashSessionId]
  );

  // onCloseCash queda igual (Promise<void>)
  const onCloseCash = useCallback(
    async (counted: Partial<Record<CurrencyCode, number>>): Promise<void> => {
      if (!terminalId || !cashSessionId) return;

      const ok = window.confirm("¿Seguro? Esto genera Z y cierra la caja.");
      if (!ok) return;

      await closeCashSession({ terminalId, cashSessionId, counted });

      setCashActive(null);
      router.replace("/pos");
    },
    [terminalId, cashSessionId, setCashActive, router]
  );


  const role = (user?.role ?? "CASHIER") as "ADMIN" | "MANAGER" | "CASHIER";
  const itemsInProgress = items.length > 0;

  // ✅ confirm extra ANTES de abrir el modal CLOSE (sin ensuciar CashSessionMenu)
  const onRequestOpenCloseModal = useCallback(() => {
    const ok = window.confirm("Vas a cerrar caja (Z). ¿Continuar?");
    if (!ok) return;
    openCashModal("CLOSE");
  }, [openCashModal]);

  const rightSlot = (
    <div className="relative">
      <CashBadgeDot show={!gate.cashOpen} />
      <CashSessionMenu
        variant="icon"
        role={role}
        offline={gate.offline}
        cashOpen={gate.cashOpen}
        itemsInProgress={itemsInProgress}
        onOpenCount={() => openCashModal("COUNT")}
        onOpenClose={onRequestOpenCloseModal}
        onGoAdmin={() => router.replace("/admin")}
      />
    </div>
  );

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      <PosShellTopBar
        area="pos"
        centerSlot={
          <PosStatusBar
            offline={gate.offline}
            terminalReady={gate.terminalReady}
            cashOpen={gate.cashOpen}
            compact
          />
        }
        rightSlot={rightSlot}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0">{props.children}</div>
      </main>

      {showBottomBar && gate.readyToSell && (
        <PosBottomBar
          role={role}
          offline={gate.offline}
          cashOpen={gate.cashOpen}
          itemsCount={items.length}
          total={totals.total}
          paying={paying}
          payDisabled={!canPay()}
          onPay={onPay}
          onCancelSale={onCancelSale}
          onHoldSale={() => alert("hold (placeholder)")}
          onNote={() => alert("nota (placeholder)")}
          onCustomer={() => alert("cliente (placeholder)")}
        />
      )}

      {/* ✅ OVERLAYS GLOBALES */}
      <CashCountCloseModal
        open={cashModalOpen}
        mode={cashMode}
        onClose={closeCashModal}
        onCount={onCountCash}
        onCloseCash={onCloseCash}
      />

      <CashOpenGateModal
        open={gate.openModal}
        reason={gate.reason}
        canSubmit={gate.canSubmit}
        terminalId={gate.xTerminalId}
        role={role}
        onRefresh={() => window.location.reload()}
        onGoAdmin={() => router.replace("/admin")}
      />

    </div>
  );
}
