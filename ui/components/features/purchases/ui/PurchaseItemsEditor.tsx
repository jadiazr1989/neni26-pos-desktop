"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PurchaseStatus } from "@/lib/modules/purchases/purchase.dto";

type Line = {
  productVariantId: string;
  quantity: number;
  unitCostBaseMinor: number;
  unitPriceBaseMinor: number | null | undefined;
};

function money(n: number) {
  return new Intl.NumberFormat().format(n);
}

function lineTotal(l: Line) {
  const qty = Number.isFinite(l.quantity) ? l.quantity : 0;
  const cost = Number.isFinite(l.unitCostBaseMinor) ? l.unitCostBaseMinor : 0;
  return qty * cost;
}

export function PurchaseItemsEditor(props: {
  disabled: boolean;
  lines: Line[];
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onChange: (idx: number, patch: Partial<Line>) => void;
  status: PurchaseStatus; canEdit: boolean
}) {
  return (
    <div className="space-y-3">
      {/* Header compacto */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">
          Editor de productos <span className="text-xs text-muted-foreground">(solo DRAFT)</span>
        </div>

        <Button size="sm" variant="outline" onClick={props.onAdd} disabled={props.disabled}>
          <Plus className="mr-2 size-4" />
          Agregar
        </Button>
      </div>


      {/* Table-ish */}
      {props.lines.length > 0 ? (
        <div className="space-y-2">
          {/* Head row */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-[11px] text-muted-foreground">
            <div className="col-span-5">Variante (ID por ahora)</div>
            <div className="col-span-2">Cantidad</div>
            <div className="col-span-2">Costo</div>
            <div className="col-span-2">Precio (opcional)</div>
            <div className="col-span-1 text-right">Total</div>
          </div>

          {props.lines.map((l, idx) => {
            const total = lineTotal(l);

            return (
              <div
                key={idx}
                className="rounded-xl border bg-background px-3 py-3 md:grid md:grid-cols-12 md:gap-2 md:items-center"
              >
                {/* Variante */}
                <div className="md:col-span-5">
                  <div className="md:hidden mb-1 text-[11px] text-muted-foreground">Variante</div>
                  <Input
                    value={l.productVariantId}
                    onChange={(e) => props.onChange(idx, { productVariantId: e.target.value })}
                    placeholder="productVariantId"
                    disabled={props.disabled}
                    className="h-10"
                  />
                </div>

                {/* Cantidad */}
                <div className="mt-2 md:mt-0 md:col-span-2">
                  <div className="md:hidden mb-1 text-[11px] text-muted-foreground">Cantidad</div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={Number.isFinite(l.quantity) ? String(l.quantity) : ""}
                    onChange={(e) => props.onChange(idx, { quantity: Number(e.target.value) })}
                    placeholder="0"
                    disabled={props.disabled}
                    className="h-10"
                  />
                </div>

                {/* Costo */}
                <div className="mt-2 md:mt-0 md:col-span-2">
                  <div className="md:hidden mb-1 text-[11px] text-muted-foreground">Costo</div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={Number.isFinite(l.unitCostBaseMinor) ? String(l.unitCostBaseMinor) : ""}
                    onChange={(e) => props.onChange(idx, { unitCostBaseMinor: Number(e.target.value) })}
                    placeholder="0"
                    disabled={props.disabled}
                    className="h-10"
                  />
                </div>

                {/* Precio */}
                <div className="mt-2 md:mt-0 md:col-span-2">
                  <div className="md:hidden mb-1 text-[11px] text-muted-foreground">Precio (opcional)</div>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={l.unitPriceBaseMinor == null ? "" : String(l.unitPriceBaseMinor)}
                    onChange={(e) =>
                      props.onChange(idx, { unitPriceBaseMinor: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder="—"
                    disabled={props.disabled}
                    className="h-10"
                  />
                </div>

                {/* Total + remove */}
                <div className="mt-3 md:mt-0 md:col-span-1 flex items-center justify-between md:justify-end gap-2">
                  <div className="md:text-right">
                    <div className="md:hidden text-[11px] text-muted-foreground">Total</div>
                    <div className="text-sm font-semibold">{money(total)}</div>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => props.onRemove(idx)}
                    disabled={props.disabled}
                    title="Eliminar"
                    className="shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
