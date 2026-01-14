"use client";

import type { JSX } from "react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function SaleSummary(props: {
  className?: string;
  itemsCount: number;
  total: number;
  tone?: "amber" | "emerald";
}): JSX.Element {
  const totalKey = useMemo(() => String(props.total), [props.total]);

  const toneCls =
    props.tone === "emerald"
      ? "bg-emerald-500/12 ring-1 ring-emerald-500/15"
      : "bg-amber-400/18 ring-1 ring-amber-500/15";

  return (
    <div
      key={totalKey}
      className={cn(
        "h-12 w-[188px] rounded-xl px-4",
        "flex items-center gap-4",
        "pos-pulse",
        toneCls,
        props.className
      )}
    >
      <div className="text-[11px] text-muted-foreground leading-tight">
        Items
        <div className="text-sm font-semibold text-foreground tabular-nums">
          {props.itemsCount}
        </div>
      </div>

      <div className="h-6 w-px bg-foreground/10" />

      <div className="text-[11px] text-muted-foreground leading-tight">
        Total
        <div className="text-sm font-bold text-foreground tabular-nums">
          ${props.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
