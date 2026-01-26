'use client'
import React from "react";

export function QuickAction(props: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const Icon = props.icon;
  return (
    <button
      onClick={props.onClick}
      className="w-full text-left rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors px-3 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl border border-border bg-background grid place-items-center">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{props.title}</div>
          <div className="text-xs text-muted-foreground truncate">{props.subtitle}</div>
        </div>
      </div>
    </button>
  );
}