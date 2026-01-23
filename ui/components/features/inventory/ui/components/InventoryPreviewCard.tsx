"use client";

import * as React from "react";
import type { InventoryPreviewRowDTO } from "@/lib/modules/inventory/inventory.dto";

export function InventoryPreviewCard(props: {
  rows: InventoryPreviewRowDTO[] | null;
  loading?: boolean;
  error?: string | null;
}) {
  if (props.loading) return <div className="text-sm text-muted-foreground">Calculando preview...</div>;
  if (props.error) return <div className="text-sm text-destructive">{props.error}</div>;
  if (!props.rows?.length) return null;

  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-sm font-medium mb-2">Preview</div>

      <div className="grid gap-2">
        {props.rows.map((l) => (
          <div key={l.variantId} className="flex items-center justify-between text-sm">
            <div className="min-w-0">
              <div className="font-medium truncate">{l.variantId}</div>
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
