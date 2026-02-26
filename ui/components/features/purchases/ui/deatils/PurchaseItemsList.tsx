"use client";

import * as React from "react";
import { Pencil, Trash2, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { DraftLine } from "../../hooks/purchaseDetail.types";
import { minorToMoneyString } from "@/lib/money/money";
import { moneyStrToLabelCUP } from "@/lib/money/moneyStr";
import { lineTotalBaseMinorForUi } from "../../hooks/purchaseDetail.helpers";

function shortId(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-3)}`;
}

function clipMiddle(s: string, head = 10, tail = 6) {
  if (!s) return "—";
  if (s.length <= head + tail + 2) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function Stat({ value }: { value: React.ReactNode }) {
  return <div className="text-right font-semibold tabular-nums">{value}</div>;
}

function safeQtyText(l: DraftLine): string {
  if (l.qtyDisplay && l.displayUnit) return `${l.qtyDisplay} ${l.displayUnit}`;
  const q = String(l.qtyInput ?? "").trim();
  const unit = String(l.unitInput ?? "UNIT").trim();
  return `${q || "0"} ${unit}`;
}

export function PurchaseItemsList(props: {
  disabled: boolean;
  lines: DraftLine[];
  onEdit: (idx: number) => void;
  onRemove: (idx: number) => void;
}) {
  if (props.lines.length === 0) {
    return <div className="text-sm text-muted-foreground">Aún no hay productos agregados.</div>;
  }

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div
        className="grid items-center gap-3 border-b px-3 py-2 text-xs text-muted-foreground"
        style={{ gridTemplateColumns: "1fr 110px 110px 140px 88px" }}
      >
        <div>Item</div>
        <div className="text-right">Qty</div>
        <div className="text-right">Costo</div>
        <div className="text-right">Total</div>
        <div />
      </div>

      <div className="divide-y">
        {props.lines.map((l, idx) => {
          const v = l.variant ?? null;

          // ✅ Total para UI:
          // - si existe snapshot (backend) lo usa
          // - si no existe, calcula preview local (qtyInput * unitCostBaseMinor) BigInt-safe
          const totalStr = lineTotalBaseMinorForUi(l);

          const title = v?.title ?? "Variante";
          const productName = v?.productName ?? "—";
          const sku = v?.sku ?? "—";
          const bc = v?.barcode ?? "—";

          return (
            <div
              key={`${l.productVariantId}-${idx}`}
              className="grid items-center gap-3 px-3 py-2"
              style={{ gridTemplateColumns: "1fr 110px 110px 140px 88px" }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="truncate font-medium text-[15px] leading-5">{title}</div>
                  <Badge variant="secondary" className="rounded-md px-2 py-0.5 font-mono text-[10px] shrink-0">
                    <Hash className="mr-1 size-3" />
                    {shortId(l.productVariantId)}
                  </Badge>
                </div>

                <div className="truncate text-[12px] text-muted-foreground leading-4">{productName}</div>

                <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span title={sku} className="font-mono">
                    SKU: <span className="text-foreground">{clipMiddle(sku, 12, 6)}</span>
                  </span>
                  <span title={bc} className="font-mono">
                    BC: <span className="text-foreground">{clipMiddle(bc, 10, 4)}</span>
                  </span>
                </div>
              </div>

              <Stat value={safeQtyText(l)} />
              <Stat value={minorToMoneyString(l.unitCostBaseMinor ?? 0, { scale: 2 })} />
              <Stat value={totalStr == null ? "—" : moneyStrToLabelCUP(totalStr)} />

              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  disabled={props.disabled}
                  onClick={() => props.onEdit(idx)}
                  title="Editar"
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  disabled={props.disabled}
                  onClick={() => props.onRemove(idx)}
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}