"use client";

import * as React from "react";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";
import { displayVariantTitle } from "@/lib/utils";
import { baseMinorToPricing, formatQty } from "@/lib/quantity/units";

export function VariantHeaderCard(props: { row: WarehouseStockRowUI }) {
  const row = props.row;
  const titleText = displayVariantTitle(row.title, row.sku);

  const availableBase = row.availableBaseMinor ?? row.qtyBaseMinor ?? 0;

  const stockText = React.useMemo(() => {
    const pricing = baseMinorToPricing(availableBase, row.unitFactor);
    if (pricing != null) return `${formatQty(pricing)} ${row.pricingUnit}`;
    return `${availableBase} ${row.baseUnit}`;
  }, [availableBase, row.unitFactor, row.pricingUnit, row.baseUnit]);

  return (
    <div className="rounded-2xl border border-border p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <EntityAvatar src={row.imageUrl ?? undefined} alt={titleText} size={44} />
        <div className="min-w-0">
          <div className="font-medium truncate">{titleText}</div>
          <div className="text-xs text-muted-foreground truncate">SKU: {row.sku}</div>
          <div className="text-xs text-muted-foreground truncate">
            {row.productName ?? "—"} · unidad: {row.pricingUnit}
            {row.unitFactor ? <span className="opacity-70"> · factor: {row.unitFactor}</span> : null}
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-muted-foreground">Stock actual</div>
        <div className="text-lg font-semibold tabular-nums">{row.availableDisplay ?? row.qtyDisplay ?? "—"}</div>
        <div className="text-xs text-muted-foreground opacity-70">
          base: {availableBase} {row.baseUnit}
        </div>
        <div className="text-[11px] text-muted-foreground opacity-70">calc: {stockText}</div>
      </div>
    </div>
  );
}