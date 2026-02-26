"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import type { PurchaseDetailVm } from "../../hooks/purchaseDetail.types";
import { moneyStrToLabelCUP, type MoneyStr } from "@/lib/money/moneyStr";
import { draftTotals } from "../../hooks/purchaseDetail.helpers";

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

/** Acepta MoneyStr o number y siempre devuelve etiqueta CUP */
function toCupLabel(v: MoneyStr | number | null | undefined) {
  if (v == null) return "—";
  if (typeof v === "string") return moneyStrToLabelCUP(v);
  return moneyStrToLabelCUP(String(Math.trunc(v)));
}

export function PurchaseSummaryInline({ vm }: { vm: PurchaseDetailVm }) {
  const p = vm.purchase;

  // Live totals: usa draftTotals, que ahora mezcla snapshot + preview local
  const live = React.useMemo(() => draftTotals(vm.editor.lines), [vm.editor.lines]);

  const showLive = vm.flags.status === "DRAFT" && vm.editor.dirty;

  const items = showLive ? live.items : vm.flags.itemsCount;

  const subtotalAny = showLive ? live.subtotalBaseMinor : (p?.subtotalBaseMinor ?? null);
  const totalAny = showLive ? live.totalBaseMinor : (p?.totalBaseMinor ?? null);

  return (
    <div
      className={[
        "rounded-2xl border px-4 py-3",
        vm.flags.status === "CANCELLED"
          ? "border-zinc-300 bg-muted/30"
          : vm.flags.status === "RECEIVED"
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-muted bg-background",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-muted-foreground">Almacén</span>
            <span className="font-mono text-sm truncate">{shortId(p?.warehouseId ?? null)}</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-sm font-medium">{vm.flags.status}</span>

            {showLive ? (
              <span className="ml-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Preview
              </span>
            ) : null}
          </div>

          {vm.flags.showEmptyItemsWarning ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="size-4" />
              <span>Agrega al menos 1 producto para continuar.</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right">
            <div className="text-[11px] text-muted-foreground leading-4">Items</div>
            <div className="font-semibold leading-5">{items}</div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-muted-foreground leading-4">Subtotal</div>
            <div className="font-semibold leading-5">{toCupLabel(subtotalAny)}</div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-muted-foreground leading-4">Total</div>
            <div className="font-semibold leading-5">{toCupLabel(totalAny)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}