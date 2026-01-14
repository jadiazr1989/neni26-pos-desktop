// ui/components/features/pos/sales/ui/TicketListPanel.tsx
"use client";

import type { JSX } from "react";
import { cn } from "@/lib/utils";
import type { SaleLine, TicketTotals } from "@/stores/posSale.store";

function calcLineTotal(li: SaleLine): number {
  const delta = li.optionsSnapshot.reduce((acc, o) => acc + (o.priceDelta ?? 0), 0);
  return (li.pricePerUnitSnapshot + delta) * li.qty;
}

type Props = {
  className?: string;
  items: SaleLine[];
  totals: TicketTotals;
  onEdit: (lineId: string) => void;
};

export function TicketListPanel(props: Props): JSX.Element {
  return (
    <div className={cn("h-full min-h-0 flex flex-col", props.className)}>
      {/* Header fijo (sin Card) */}
      
      {/* Body scrolleable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {props.items.length === 0 ? (
          <div className="p-5">
            <div className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4">
              Agrega productos para empezar.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {props.items.map((li) => (
              <li key={li.id}>
                <button
                  type="button"
                  onClick={() => props.onEdit(li.id)}
                  className={cn(
                    "w-full text-left px-5 py-4",
                    "hover:bg-accent/10 active:bg-accent/20 transition",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{li.nameSnapshot}</div>

                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Qty: {li.qty} {li.unitLabelSnapshot} · ${li.pricePerUnitSnapshot.toFixed(2)}/{li.unitLabelSnapshot}
                      </div>

                      {li.optionsSnapshot.length > 0 && (
                        <div className="mt-1 text-[11px] text-muted-foreground space-y-0.5">
                          {li.optionsSnapshot.map((o, idx) => (
                            <div key={`${li.id}:opt:${idx}`}>
                              {o.groupName}: {o.optionName}
                              {o.priceDelta ? ` (+$${o.priceDelta.toFixed(2)})` : ""}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-sm font-semibold tabular-nums">
                      ${calcLineTotal(li).toFixed(2)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
