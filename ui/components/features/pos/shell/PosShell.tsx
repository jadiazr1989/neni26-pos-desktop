// components/features/pos/shell/PosShell.tsx
"use client";

import * as React from "react";
import type { JSX, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import type { MeUser } from "@/lib/cash.types";
import { notify } from "@/lib/notify/notify";

import { usePosSaleStore } from "@/stores/posSale.store";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { PosShellTopBar } from "./ui/PosShellTopBar";
import { PosStatusBar } from "./ui/PosStatusBar";
import { PosBottomBar } from "./ui/PosBottomBar";
import { CashSessionMenu } from "../cash/ui/CashSessionMenu";
import { CashCountCloseModal } from "../cash/ui/CashCountCloseModal";
import { CashOpenGateModal } from "@/components/features/pos/cash/ui/CashOpenGateModal";

import { usePosShellCashVm } from "./hooks/usePosShellCashVm";

// ✅ NUEVO: hook de checkout UI (modal)
import { usePosSaleCheckout } from "../sale/hooks/usePosSaleCheckout";
import { PosCheckoutModal } from "../sale/ui/modal/posCheckout/PosCheckoutModal";
import { usePosCatalogUi } from "@/stores/posCatalogUi.store";

// ✅ Aquí asumo que tienes un modal UI real que consume checkoutUi.
// Si no lo tienes todavía, te dejo al final un stub.

function CashBadgeDot(props: { show: boolean }): JSX.Element | null {
  if (!props.show) return null;
  return (
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
  );
}

export function PosShell(props: { initialUser: MeUser; children: ReactNode }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const vm = usePosShellCashVm({ initialUser: props.initialUser, pollMs: 15000 });

  // ✅ Sale store (nuevo)
  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);
  const canPay = usePosSaleStore((s) => s.canPay);
  const clear = usePosSaleStore((s) => s.clear);
  const checkoutStatus = usePosSaleStore((s) => s.checkoutStatus);

  // ✅ Hook de checkout (modal + pagos múltiples)
  const bumpCatalog = usePosCatalogUi((s) => s.bump);

  const checkoutUi = usePosSaleCheckout({
    cashSessionId: vm.cashSessionId ?? null,
    onPaid: async () => {
      bumpCatalog(); // ✅ refresh grid
    },
  });


  const showBottomBar = pathname.startsWith("/pos/sales");
  const paying = checkoutStatus === "paying";
  const itemsInProgress = items.length > 0;

  // cancel sale confirm (UI)
  const [cancelSaleOpen, setCancelSaleOpen] = React.useState(false);

  const onRequestCancelSale = React.useCallback(() => {
    if (items.length === 0) return;
    setCancelSaleOpen(true);
  }, [items.length]);

  const rightSlot = (
    <div className="relative">
      <CashBadgeDot show={!vm.gate.cashOpen} />
      <CashSessionMenu
        variant="icon"
        role={vm.role}
        offline={vm.gate.offline}
        cashOpen={vm.gate.cashOpen}
        itemsInProgress={itemsInProgress}
        onOpenCount={vm.onOpenCountModal}
        onOpenClose={vm.onRequestOpenCloseModal}
        onGoAdmin={() => router.replace("/admin")}
      />
    </div>
  );

  const onPay = React.useCallback(async () => {
    if (!vm.gate.readyToSell) return;

    if (!vm.cashSessionId) {
      notify.error({
        title: "Caja no disponible",
        description: "Abre la caja antes de realizar el cobro.",
      });
      return;
    }

    try {
      const result = await usePosSaleStore.getState().validateBeforeCheckout();
      if (result === "FIXED") {
        // ✅ ticket ya fue corregido y el toast ya salió
        // ✅ NO abras el modal: deja que el usuario revise y presione Cobrar otra vez
        return;
      }

      // ✅ OK -> ahora sí
      checkoutUi.open();
    } catch (e) {
      notify.error({
        title: "No se puede cobrar",
        description: e instanceof Error ? e.message : "Error validando el ticket.",
      });
    }
  }, [checkoutUi, vm.cashSessionId, vm.gate.readyToSell]);



  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      <PosShellTopBar
        area="pos"
        centerSlot={
          <PosStatusBar
            offline={vm.gate.offline}
            terminalReady={vm.gate.terminalReady}
            cashOpen={vm.gate.cashOpen}
            compact
          />
        }
        rightSlot={rightSlot}
      />

      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0">{props.children}</div>
      </main>

      {showBottomBar && vm.gate.readyToSell && (
        <PosBottomBar
          role={vm.role}
          offline={vm.gate.offline}
          cashOpen={vm.gate.cashOpen}
          itemsCount={items.length}
          totalMinor={totals.totalMinor} // ✅
          paying={paying}
          payDisabled={!canPay() || vm.gate.offline || !vm.gate.cashOpen} // ✅ típico gate
          onPay={onPay}
          onCancelSale={onRequestCancelSale}
          onHoldSale={() => notify.warning({ title: "Hold", description: "Pendiente de implementar." })}
          onNote={() => notify.warning({ title: "Nota", description: "Pendiente de implementar." })}
          onCustomer={() => notify.warning({ title: "Cliente", description: "Pendiente de implementar." })}
        />
      )}

      {/* ✅ Modal de cobro (con el hook que ya tienes) */}
      <PosCheckoutModal
        isOpen={checkoutUi.isOpen}
        onClose={checkoutUi.close}
        state={checkoutUi.state}
        totals={checkoutUi.totals}
        lines={checkoutUi.lines}
        paidMinor={checkoutUi.paidMinor}
        changeMinor={checkoutUi.changeMinor}
        syncStatus={checkoutUi.syncStatus}
        addPaymentLine={checkoutUi.addPaymentLine}
        removePaymentLine={checkoutUi.removePaymentLine}
        updatePaymentLine={checkoutUi.updatePaymentLine}
        setQuickCash={checkoutUi.setQuickCash}
        onSubmit={checkoutUi.submit}
      />


      {/* Cash overlays */}
      <CashCountCloseModal
        open={vm.cashModalOpen}
        mode={vm.cashMode}
        onClose={vm.closeCashModal}
        onCount={vm.onCountCash}
        onCloseCash={vm.onCloseCash}
      />

      <CashOpenGateModal
        open={vm.gate.openModal}
        reason={vm.gate.reason}
        canSubmit={vm.gate.canSubmit}
        terminalId={vm.gate.xTerminalId}
        role={vm.role}
        onRefresh={vm.onRefresh}
        onGoAdmin={vm.onGoAdmin}
      />

      {/* Confirm: cancel sale */}
      <ConfirmDialog
        open={cancelSaleOpen}
        onOpenChange={setCancelSaleOpen}
        title="Cancelar orden"
        description="¿Cancelar la orden actual? Se perderán los items en curso."
        confirmText="Cancelar orden"
        cancelText="Seguir vendiendo"
        destructive
        onConfirm={async () => {
          clear();
          setCancelSaleOpen(false);
          notify.success({ title: "Orden cancelada", description: "Se limpió la venta actual." });
        }}
      />
    </div>
  );
}
