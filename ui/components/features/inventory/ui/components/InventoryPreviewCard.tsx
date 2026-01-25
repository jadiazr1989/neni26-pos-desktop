"use client";

import * as React from "react";
import type { InventoryPreviewLineDTO } from "@/lib/modules/inventory/inventory.dto";

export function InventoryPreviewCard(props: {
  title?: string;
  lines: InventoryPreviewLineDTO[] | null;
  loading?: boolean;
  error?: string | null;
}) {
  if (props.loading) return <div className="text-sm text-muted-foreground">Calculando preview...</div>;
  if (!props.lines?.length) return null;

  // ✅ si hay negativo, no mostrar nada
  const hasNegative = props.lines.some((l) => l.afterQty < 0);
  if (hasNegative) return null;

  return (
    <div className="rounded-xl border border-border p-3">
      {props.title ? <div className="text-sm font-medium mb-2">{props.title}</div> : null}

      <div className="grid gap-2">
        {props.lines.map((l) => (
          <div key={l.variantId} className="flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground truncate">
                before: {l.beforeQty} | delta: {l.qtyDelta} | after: {l.afterQty}
              </div>
              {l.notes ? <div className="text-xs text-muted-foreground truncate">notes: {l.notes}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
