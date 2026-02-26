"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

type Props = {
  row: WarehouseStockRowUI;

  qtyInput: string;
  notes: string;
  reason: string;

  setQtyInput: (v: string) => void;
  setNotes: (v: string) => void;
  setReason: (v: string) => void;

  isBusy: boolean;

  maxAbsText: string | null;
  qtyInputClass: string;

  showErrorBanner: boolean;
  errId: string;

  onQtyKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  negBlocked: boolean;
};

export const QuickAdjustForm = React.forwardRef<HTMLInputElement, Props>(function QuickAdjustForm(
  {
    row,
    qtyInput,
    notes,
    reason,
    setQtyInput,
    setNotes,
    setReason,
    isBusy,
    maxAbsText,
    qtyInputClass,
    showErrorBanner,
    errId,
    onQtyKeyDown,
    negBlocked,
  },
  qtyRef
) {
  const describedBy = showErrorBanner ? errId : undefined;

  return (
    <div className="grid gap-3 mt-3">
      <div className="grid gap-1">
        <div className="text-sm font-medium">Cantidad (con signo)</div>
        <Input
          ref={qtyRef}
          inputMode="decimal"
          value={qtyInput}
          disabled={isBusy}
          onChange={(e) => setQtyInput(e.target.value)}
          placeholder="+0.5 / -2 / +3.25"
          onKeyDown={onQtyKeyDown}
          aria-invalid={showErrorBanner ? true : undefined}
          aria-describedby={describedBy}
          className={qtyInputClass}
        />

        {maxAbsText ? <div className="text-xs text-muted-foreground">{maxAbsText}</div> : null}

        <div className="text-xs text-muted-foreground">
          Unidad fija: <span className="font-medium">{row.pricingUnit}</span>
          <span className="ml-2 opacity-70">· Enter = Preview · Ctrl/Cmd+Enter = Aplicar · Esc = Cerrar</span>
        </div>
      </div>

      <div className="grid gap-1">
        <div className="text-sm font-medium">Notas (opcional)</div>
        <Input value={notes} disabled={isBusy} onChange={(e) => setNotes(e.target.value)} placeholder="recount / shrink / damage…" />
      </div>

      <div className="grid gap-1">
        <div className="text-sm font-medium">Razón (opcional)</div>
        <Input value={reason} disabled={isBusy} onChange={(e) => setReason(e.target.value)} placeholder="Stock recount…" />
      </div>

      {negBlocked ? (
        <div className="text-sm text-destructive">No se puede dejar el stock en negativo. Ajusta la cantidad.</div>
      ) : null}
    </div>
  );
});