'use client'
import React from "react";

export function MiniAlert(props: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number;
  hint: string;
  onClick: () => void;
}) {
  const Icon = props.icon;
  return (
    <button
      onClick={props.onClick}
      className="w-full text-left rounded-2xl border border-border bg-card hover:bg-accent/30 transition-colors px-4 py-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{props.title}</div>
          <div className="text-lg font-semibold tabular-nums">{props.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{props.hint}</div>
        </div>
        <div className="h-9 w-9 rounded-xl border border-border bg-accent/25 grid place-items-center">
          <Icon className="size-4" />
        </div>
      </div>
    </button>
  );
}