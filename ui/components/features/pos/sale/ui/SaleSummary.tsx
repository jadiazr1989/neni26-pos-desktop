// SaleSummary.tsx (ejemplo mínimo)
"use client";

import type { JSX } from "react";
import { cn } from "@/lib/utils";

function formatCUP(minor: number): string {
  // Si tu minor son centavos:
  return `${(minor / 100).toFixed(2)} CUP`;
}

export function SaleSummary(props: {
  itemsCount: number;
  totalMinor: number;
  tone?: "emerald" | "amber";
}): JSX.Element {
  return (
    <div
      className={cn(
        "h-12 min-w-[170px] rounded-xl px-3 flex items-center justify-between border bg-white/70",
        props.tone === "emerald" ? "border-emerald-200" : "border-amber-200"
      )}
    >
      <div className="text-sm">
        <div className="font-semibold">{props.itemsCount} items</div>
        <div className="text-muted-foreground">Total</div>
      </div>
      <div className="text-base font-bold tabular-nums">
        {formatCUP(props.totalMinor)}
      </div>
    </div>
  );
}
