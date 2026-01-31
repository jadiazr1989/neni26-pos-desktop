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

function CashBadgeDot(props: { show: boolean }): JSX.Element | null {
  if (!props.show) return null;
  return <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />;
}

export function PosShell(props: { initialUser: MeUser; children: ReactNode }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const vm = usePosShellCashVm({ initialUser: props.initialUser, pollMs: 15000 });

  // Sale store (demo)
  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);
  const saleStatus = usePosSaleStore((s) => s.status);
  const canPay = usePosSaleStore((s) => s.canPay);
  const clear = usePosSaleStore((s) => s.clear);
  const checkout = usePosSaleStore((s) => s.checkout);

  const showBottomBar = pathname.startsWith("/pos/sales");
  const paying = saleStatus === "checking_out";
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
          total={totals.total}
          paying={paying}
          payDisabled={!canPay()}
          onPay={async () => {
            if (!vm.gate.readyToSell) return;
            if (!vm.cashSessionId) return;
            if (!canPay()) return;

            if (!vm.xTerminalId) {
              notify.warning({ title: "Terminal no listo", description: "Falta terminalId para procesar el pago." });
              return;
            }

            await checkout({ terminalId: vm.xTerminalId, cashSessionId: vm.cashSessionId });
          }}
          onCancelSale={onRequestCancelSale}
          onHoldSale={() => notify.warning({ title: "Hold", description: "Pendiente de implementar." })}
          onNote={() => notify.warning({ title: "Nota", description: "Pendiente de implementar." })}
          onCustomer={() => notify.warning({ title: "Cliente", description: "Pendiente de implementar." })}
        />
      )}

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
