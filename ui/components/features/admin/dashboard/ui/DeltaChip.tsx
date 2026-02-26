// src/modules/admin/dashboard/ui/DeltaChip.tsx
"use client";
import * as React from "react";
import type { DeltaTone } from "../utils/dashboardDeltas";

export function DeltaChip(props: { label: string; tone: DeltaTone; icon?: React.ReactNode }) {
  const toneClass =
    props.tone === "good"
      ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : props.tone === "bad"
      ? "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-border bg-muted/40 text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${toneClass}`}>
      {props.icon ? <span className="inline-flex">{props.icon}</span> : null}
      <span className="tabular-nums">{props.label}</span>
    </span>
  );
}