// src/modules/admin/dashboard/ui/RowKV2.tsx
"use client";
import * as React from "react";

export function RowKV2(props: { left: React.ReactNode; right: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 ${props.last ? "" : "border-b border-border/60"}`}>
      <div className="min-w-0 text-sm text-muted-foreground">{props.left}</div>
      <div className="text-sm font-semibold tabular-nums">{props.right}</div>
    </div>
  );
}