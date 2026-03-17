"use client";

import * as React from "react";
import type { JSX, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Lock } from "lucide-react";

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

import { usePosSaleCheckout } from "../sale/hooks/usePosSaleCheckout";
import { PosCheckoutModal } from "../sale/ui/modal/posCheckout/PosCheckoutModal";
import { usePosCatalogUi } from "@/stores/posCatalogUi.store";

const MAX_CASH_SESSION_HOURS = 16;

function CashBadgeDot(props: { show: boolean }): JSX.Element | null {
  if (!props.show) return null;
  return (
    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />
  );
}

function BlockingCashOverlay(props: {
  show: boolean;
  message: string | null;
  onOpenClose: () => void;
}): JSX.Element | null {
  if (!props.show) return null;

  return (
    <div className="absolute inset-0 z-20 bg-background/85 backdrop-blur-[2px] flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-card shadow-xl p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 grid place-items-center shrink-0">
            <AlertTriangle className="size-6 text-red-600" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Cierre obligatorio de caja</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {props.message ??
                "La caja llegó al límite operativo y debe cerrarse antes de continuar."}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={props.onOpenClose}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Lock className="mr-2 size-4" />
                Cerrar caja ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getOpenMinutes(openedAt: string | null | undefined): number | null {
  if (!openedAt) return null;
  const openedMs = new Date(openedAt).getTime();
  if (!Number.isFinite(openedMs)) return null;

  return Math.max(0, Math.floor((Date.now() - openedMs) / 60000));
}

export function PosShell(props: { initialUser: MeUser; children: ReactNode }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const vm = usePosShellCashVm({ initialUser: props.initialUser, pollMs: 15000 });

  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);
  const canPay = usePosSaleStore((s) => s.canPay);
  const clear = usePosSaleStore((s) => s.clear);
  const checkoutStatus = usePosSaleStore((s) => s.checkoutStatus);

  const bumpCatalog = usePosCatalogUi((s) => s.bump);

  const checkoutUi = usePosSaleCheckout({
    cashSessionId: vm.cashSessionId ?? null,
    onPaid: async () => {
      bumpCatalog();
    },
  });

  const showBottomBar = pathname.startsWith("/pos/sales");
  const paying = checkoutStatus === "paying";
  const itemsInProgress = items.length > 0;

  const [cancelSaleOpen, setCancelSaleOpen] = React.useState(false);

  const openMinutes = getOpenMinutes(vm.cashSession?.openedAt ?? null);
  const staleSession =
    vm.cashOpen &&
    openMinutes != null &&
    openMinutes >= MAX_CASH_SESSION_HOURS * 60;

  const forceCloseRequired =
    vm.cashOpen &&
    (
      staleSession ||
      vm.warningLevel === "critical" ||
      vm.minutesUntilClose === 0 ||
      vm.warning?.isWithinOperatingWindow === false
    );

  React.useEffect(() => {
    if (!forceCloseRequired) return;
    if (vm.cashModalOpen && vm.cashMode === "CLOSE") return;

    vm.onRequestOpenCloseModal();
  }, [forceCloseRequired, vm.cashModalOpen, vm.cashMode, vm.onRequestOpenCloseModal]);

  React.useEffect(() => {
    if (!forceCloseRequired) return;
    if (!checkoutUi.isOpen) return;

    checkoutUi.close();
  }, [forceCloseRequired, checkoutUi]);

  const onRequestCancelSale = React.useCallback(() => {
    if (forceCloseRequired) {
      notify.warning({
        title: "Cierre obligatorio",
        description: "Debes cerrar la caja antes de continuar.",
      });
      return;
    }

    if (items.length === 0) return;
    setCancelSaleOpen(true);
  }, [forceCloseRequired, items.length]);

  const rightSlot = (
    <div className="relative">
      <CashBadgeDot show={!vm.cashOpen || forceCloseRequired} />
      <CashSessionMenu
        variant="icon"
        role={vm.role}
        offline={vm.gate.offline}
        cashOpen={vm.cashOpen}
        itemsInProgress={itemsInProgress}
        forceCloseRequired={forceCloseRequired}
        staleSession={staleSession}
        warningLevel={vm.warningLevel}
        minutesUntilClose={vm.minutesUntilClose}
        openedAt={vm.cashSession?.openedAt ?? null}
        businessDay={vm.businessDay}
        shiftLabel={vm.shiftLabel}
        onOpenCount={forceCloseRequired ? () => vm.onRequestOpenCloseModal() : vm.onOpenCountModal}
        onOpenClose={vm.onRequestOpenCloseModal}
        onGoAdmin={() => router.replace("/admin")}
      />
    </div>
  );

  const onPay = React.useCallback(async () => {
    if (!vm.gate.readyToSell) return;

    if (forceCloseRequired) {
      notify.error({
        title: "Cierre obligatorio",
        description: staleSession
          ? "La sesión de caja es demasiado antigua. Debes cerrarla antes de continuar."
          : "Debes cerrar la caja antes de continuar.",
      });
      vm.onRequestOpenCloseModal();
      return;
    }

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
        return;
      }

      checkoutUi.open();
    } catch (e) {
      notify.error({
        title: "No se puede cobrar",
        description: e instanceof Error ? e.message : "Error validando el ticket.",
      });
    }
  }, [checkoutUi, forceCloseRequired, staleSession, vm]);

  const payDisabled =
    !canPay() ||
    vm.gate.offline ||
    !vm.cashOpen ||
    forceCloseRequired ||
    vm.isLoadingCashState ||
    vm.isHydratingCashStore;

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex flex-col">
      <PosShellTopBar
        area="pos"
        centerSlot={
          <PosStatusBar
            offline={vm.gate.offline}
            terminalReady={vm.gate.terminalReady}
            cashOpen={vm.cashOpen}
            compact
            openedAt={vm.cashSession?.openedAt ?? null}
            minutesUntilClose={vm.minutesUntilClose}
            warningLevel={vm.warningLevel}
            forceCloseRequired={forceCloseRequired}
            staleSession={staleSession}
            staleSessionMaxHours={MAX_CASH_SESSION_HOURS}
          />
        }
        rightSlot={rightSlot}
      />

      <main className="relative flex-1 min-h-0 overflow-hidden">
        <div className="h-full min-h-0">{props.children}</div>

        <BlockingCashOverlay
          show={forceCloseRequired}
          message={
            staleSession
              ? `La caja lleva abierta más de ${MAX_CASH_SESSION_HOURS} horas y debe cerrarse ahora.`
              : vm.closeWarningMessage
          }
          onOpenClose={vm.onRequestOpenCloseModal}
        />
      </main>

      {showBottomBar && vm.gate.readyToSell && (
        <PosBottomBar
          role={vm.role}
          offline={vm.gate.offline}
          cashOpen={vm.cashOpen}
          itemsCount={items.length}
          totalMinor={totals.totalMinor}
          paying={paying}
          payDisabled={payDisabled}
          onPay={onPay}
          onCancelSale={onRequestCancelSale}
          onHoldSale={() =>
            notify.warning({
              title: "Hold",
              description: forceCloseRequired
                ? "Debes cerrar la caja antes de continuar."
                : "Pendiente de implementar.",
            })
          }
          onNote={() =>
            notify.warning({
              title: "Nota",
              description: forceCloseRequired
                ? "Debes cerrar la caja antes de continuar."
                : "Pendiente de implementar.",
            })
          }
          onCustomer={() =>
            notify.warning({
              title: "Cliente",
              description: forceCloseRequired
                ? "Debes cerrar la caja antes de continuar."
                : "Pendiente de implementar.",
            })
          }
        />
      )}

      <PosCheckoutModal
        isOpen={checkoutUi.isOpen}
        onClose={forceCloseRequired ? () => {} : checkoutUi.close}
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

      <CashCountCloseModal
        open={vm.cashModalOpen}
        mode={vm.cashMode}
        forceCloseRequired={forceCloseRequired}
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
          notify.success({
            title: "Orden cancelada",
            description: "Se limpió la venta actual.",
          });
        }}
      />
    </div>
  );
}