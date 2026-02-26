"use client";

import * as React from "react";
import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";
import type { InventoryPreviewLineDTO } from "@/lib/modules/inventory/inventory.dto";
import { baseMinorToPricing } from "@/lib/quantity/sellUnit";

function formatQty(n: number): string {
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: isInt ? 0 : 2,
  }).format(n);
}

function hasDisplayFields(l: InventoryPreviewLineDTO): l is InventoryPreviewLineDTO & {
  displayUnit: SellUnit;
  beforeDisplay: string;
  afterDisplay: string;
  deltaDisplay: string;
} {
  return (
    typeof (l as { beforeDisplay?: unknown }).beforeDisplay === "string" &&
    typeof (l as { afterDisplay?: unknown }).afterDisplay === "string" &&
    typeof (l as { deltaDisplay?: unknown }).deltaDisplay === "string" &&
    typeof (l as { displayUnit?: unknown }).displayUnit === "string"
  );
}

export function InventoryPreviewCard(props: {
  title?: string;
  lines: InventoryPreviewLineDTO[] | null;
  loading?: boolean;
  error?: string | null;

  // ✅ para calcular display cuando API no lo trae
  pricingUnit: SellUnit;
  unitFactor: string | null;
}) {
  if (props.loading) return <div className="text-sm text-muted-foreground">Calculando preview...</div>;
  //if (props.error) return <div className="text-sm text-destructive">{props.error}</div>;
  if (!props.lines?.length) return null;

  if (props.lines.some((l) => l.afterQty < 0)) return null;

  const unit = props.pricingUnit;

  return (
    <div className="rounded-xl border border-border p-3">
      {props.title ? <div className="text-sm font-medium mb-2">{props.title}</div> : null}

      <div className="grid gap-2">
        {props.lines.map((l) => {
          // 1) si API trae display, úsalo
          if (hasDisplayFields(l)) {
            return (
              <div key={l.variantId} className="text-xs text-muted-foreground truncate">
                before: {l.beforeDisplay} {l.displayUnit} | delta: {l.deltaDisplay} {l.displayUnit} | after: {l.afterDisplay} {l.displayUnit}
                <span className="ml-2 opacity-70">(base: {l.beforeQty} → {l.afterQty}, Δ {l.qtyDelta})</span>
              </div>
            );
          }

          // 2) si no, calcula display aquí con unitFactor
          const b = baseMinorToPricing(l.beforeQty, props.unitFactor);
          const a = baseMinorToPricing(l.afterQty, props.unitFactor);
          const d = baseMinorToPricing(l.qtyDelta, props.unitFactor);

          const before = b == null ? String(l.beforeQty) : formatQty(b);
          const after = a == null ? String(l.afterQty) : formatQty(a);
          const delta = d == null ? String(l.qtyDelta) : `${l.qtyDelta >= 0 ? "+" : "-"}${formatQty(Math.abs(d))}`;

          return (
            <div key={l.variantId} className="text-xs text-muted-foreground truncate">
              before: {before} {unit} | delta: {delta} {unit} | after: {after} {unit}
              <span className="ml-2 opacity-70">(base: {l.beforeQty} → {l.afterQty}, Δ {l.qtyDelta})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
