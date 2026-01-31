"use client";

import { Badge } from "@/components/ui/badge";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import * as React from "react";

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function money(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat().format(n);
}

function toneFor(status?: string | null) {
  switch (status) {
    case "DRAFT":
      return { wrap: "bg-amber-50/60 border-amber-200", badge: "bg-amber-200 text-amber-900" };
    case "ORDERED":
      return { wrap: "bg-sky-50/60 border-sky-200", badge: "bg-sky-200 text-sky-900" };
    case "RECEIVED":
      return { wrap: "bg-emerald-50/60 border-emerald-200", badge: "bg-emerald-200 text-emerald-900" };
    case "CANCELLED":
      return { wrap: "bg-red-50/60 border-red-200", badge: "bg-red-200 text-red-900" };
    default:
      return { wrap: "bg-muted/20 border-border", badge: "bg-muted text-foreground" };
  }
}

function Stat(props: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-right leading-tight">
      <div className="text-[11px] text-muted-foreground">{props.label}</div>
      <div className=" font-semibold">{props.value}</div>
    </div>
  );
}

export function PurchaseSummaryBar({
  purchase,
  sticky = true,
}: {
  purchase: PurchaseWithItemsDTO | null;
  sticky?: boolean;
}) {
  if (!purchase) return null;

  const itemsCount = purchase.items?.length ?? 0;
  const status = purchase.status ?? null;

  const t = toneFor(status);


  return (
    <div
      className={[
        "rounded-xl border px-3 py-2",
        t.wrap,
        sticky ? "sticky top-3 z-20 backdrop-blur supports-[backdrop-filter]:bg-opacity-80" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {/* Left info (compact) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm text-muted-foreground shrink-0">Almacén:</span>
            <span className="font-mono text-sm truncate">{shortId(purchase.warehouseId)}</span>

            <div className="ml-2 flex justify-center shrink-0">
              <Badge className={["h-7 px-3 text-sm", t.badge].join(" ")}>{purchase.status}</Badge>
            </div>
          </div>
        </div>

        {/* Right stats (very compact) */}
        <div className="flex items-center gap-4 shrink-0">
          <Stat label="Productos" value={itemsCount} />
          <Stat label="Subtotal" value={money(purchase.subtotalBaseMinor)} />
          <Stat label="Total" value={money(purchase.totalBaseMinor)} />
        </div>
      </div>
    </div>
  );
}
