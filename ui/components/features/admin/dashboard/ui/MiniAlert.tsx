// src/modules/admin/dashboard/ui/MiniAlert.tsx
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Severity = "neutral" | "warning" | "critical";

function severityStyles(sev: Severity): {
  card: string;
  iconWrap: string;
  icon: string;
  badge: string;
} {
  switch (sev) {
    case "critical":
      return {
        card: "border-rose-600/20 bg-background",
        iconWrap: "border-rose-600/25 bg-rose-500/10",
        icon: "text-rose-700 dark:text-rose-300",
        badge: "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      };
    case "warning":
      return {
        card: "border-amber-600/20 bg-background",
        iconWrap: "border-amber-600/25 bg-amber-500/10",
        icon: "text-amber-700 dark:text-amber-300",
        badge: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      };
    case "neutral":
    default:
      return {
        card: "border-border/60 bg-background",
        iconWrap: "border-border bg-muted/30",
        icon: "text-muted-foreground",
        badge: "border-border bg-muted/40 text-muted-foreground",
      };
  }
}

export function MiniAlert(props: {
  icon: LucideIcon;
  title: string;
  value: number;
  hint?: string;
  onClick?: () => void;

  /** POS real: severidad define solo borde + icon (no fondos agresivos) */
  severity?: Severity;

  /** si quieres “chip” tipo CRÍTICO/ADVERTENCIA */
  badge?: string;
}) {
  const Icon = props.icon;

  const sev: Severity =
    props.severity ??
    (props.value > 0 ? "warning" : "neutral"); // default razonable

  const s = severityStyles(sev);
  const clickable = typeof props.onClick === "function";

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={!clickable}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-colors",
        s.card,
        clickable ? "hover:bg-accent/30" : "cursor-default opacity-90"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("grid size-10 place-items-center rounded-xl border", s.iconWrap)}>
              <Icon className={cn("size-5", s.icon)} />
            </span>

            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{props.title}</div>
              {props.hint ? <div className="text-xs text-muted-foreground">{props.hint}</div> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {props.badge ? (
            <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", s.badge)}>
              {props.badge}
            </span>
          ) : null}

          <div className="text-2xl font-semibold tabular-nums">{props.value}</div>
        </div>
      </div>
    </button>
  );
}