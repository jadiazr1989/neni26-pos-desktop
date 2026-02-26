"use client";

import * as React from "react";
import type { JSX } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { formatMoney } from "@/lib/money/money";

import { CheckoutHeader } from "./components/CheckoutHeader";
import { TotalsSummary } from "./components/TotalsSummary";
import { SyncAlerts } from "./components/SyncAlerts";

import { useAutofocusOnOpen } from "./hooks/useAutofocusOnOpen";
import { useCheckoutHotkeys } from "./hooks/useCheckoutHotkeys";

import {
  computeDueAndChange,
  getPrimaryLine,
  type PayLineDraft,
  type SyncStatus,
  type CheckoutState,
} from "./domain/checkoutViewModel";
import { QuickCashPanel } from "./components/QuickCashPanel";
import { AdvancedOptionsSheet } from "./components/AdvancedOptionsSheet";

type TicketTotals = {
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
};

function moneyStrToNumberSafe(v: unknown): number {
  const n = Number(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

export function PosCheckoutModal(props: {
  isOpen: boolean;
  onClose: () => void;

  state: CheckoutState;
  syncStatus: SyncStatus;
  syncErrorMessage?: string | null;

  totals: TicketTotals;
  lines: PayLineDraft[];
  paidMinor: number;
  changeMinor: number;
  lastConfirmedChangeMinor?: number | null;

  addPaymentLine: () => void;
  removePaymentLine: (id: string) => void;
  updatePaymentLine: (id: string, patch: Partial<Omit<PayLineDraft, "id">>) => void;
  setQuickCash: () => void;
  onSubmit: () => Promise<void>;
}): JSX.Element {
  const busy = props.state.status === "submitting";
  const canClose = !busy;

  const devBypassSync = process.env.NODE_ENV === "development";

  const close = React.useCallback(() => {
    if (!(props.state.status !== "submitting")) return;
    props.onClose();
  }, [props]);

  const primary = React.useMemo(() => getPrimaryLine(props.lines), [props.lines]);

  const successChangeMinor = React.useMemo(() => {
    if (props.state.status !== "success") return null;
    return moneyStrToNumberSafe(props.state.changeBaseMinor);
  }, [props.state]);

  const changeToShowMinor =
    props.state.status === "success"
      ? (successChangeMinor ?? 0)
      : props.lastConfirmedChangeMinor ?? props.changeMinor;

  const { dueMinor } = React.useMemo(
    () => computeDueAndChange(props.totals.totalMinor, props.paidMinor),
    [props.totals.totalMinor, props.paidMinor]
  );

  const confirmDisabled =
    busy ||
    props.state.status !== "editing" ||
    (!devBypassSync && props.syncStatus !== "ready") ||
    props.totals.totalMinor <= 0;

  const canSubmit = !confirmDisabled && dueMinor === 0;

  const [advancedOpen, setAdvancedOpen] = React.useState(false);

  const cashInputRef = React.useRef<HTMLInputElement | null>(null);
  useAutofocusOnOpen({ open: props.isOpen && !advancedOpen, focusRef: cashInputRef, delayMs: 60 });

  useCheckoutHotkeys({
    enabled: props.isOpen,
    onClose: close,
    onSubmit: () => void props.onSubmit(),
    canSubmit,
    onToggleAdvanced: () => setAdvancedOpen((v) => !v),
    onQuickCash: props.setQuickCash,
  });

  const primaryActionLabel = React.useMemo(() => {
    if (busy) return "Cobrando…";
    if (props.totals.totalMinor <= 0) return "Total inválido";
    if (!devBypassSync && props.syncStatus !== "ready") return "Esperando sync…";
    if (dueMinor > 0) return `Faltan ${formatMoney(dueMinor, "CUP")}`;
    return "Confirmar cobro (Enter)";
  }, [busy, props.totals.totalMinor, props.syncStatus, devBypassSync, dueMinor]);

  return (
    <>
      <Dialog open={props.isOpen} onOpenChange={(open) => (!open ? close() : null)}>
        <DialogContent className="max-w-3xl p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Cobrar</DialogTitle>

          <div className="p-6 pb-4">
            <CheckoutHeader syncStatus={props.syncStatus} />
          </div>

          <div className="px-6 pb-6 space-y-4">
            <SyncAlerts syncStatus={props.syncStatus} syncErrorMessage={props.syncErrorMessage} state={props.state} />

            <TotalsSummary
              totalMinor={props.totals.totalMinor}
              paidMinor={props.paidMinor}
              dueMinor={dueMinor}
              changeMinor={changeToShowMinor}
            />

            {primary ? (
              <QuickCashPanel
                ref={cashInputRef}
                line={primary}
                busy={busy}
                disabled={advancedOpen}
                onChange={(patch) => props.updatePaymentLine(primary.id, patch)}
                onToggleAdvanced={() => setAdvancedOpen(true)}
                onQuickCash={props.setQuickCash}
              />
            ) : null}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={close} disabled={!canClose}>
                Cerrar (Esc)
              </Button>

              <Button
                type="button"
                onClick={props.onSubmit}
                disabled={!canSubmit}
                className="min-w-64 h-11 text-base rounded-2xl"
              >
                {primaryActionLabel}
              </Button>
            </div>

            {props.state.status === "success" ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="font-semibold text-emerald-900">Venta cobrada</div>
                <div className="text-sm text-emerald-800">
                  SaleId: <span className="font-mono">{props.state.saleId}</span>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AdvancedOptionsSheet
        open={advancedOpen && props.isOpen}
        onOpenChange={setAdvancedOpen}
        busy={busy}
        lines={props.lines}
        onAdd={props.addPaymentLine}
        onRemove={props.removePaymentLine}
        onChange={props.updatePaymentLine}
      />
    </>
  );
}