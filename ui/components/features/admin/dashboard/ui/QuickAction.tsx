// src/modules/admin/dashboard/ui/QuickAction.tsx
"use client";

import * as React from "react";
import { ArrowRight, AlertTriangle, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickActionTone = "neutral" | "info" | "warning" | "critical" | "success";

export function QuickAction(props: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick: () => void;

  meta?: string; // ej: "Nuevo", "Atención"
  rightMeta?: string; // ej: "Impacto 123.45 CUP" (alineado a la derecha)
  tone?: QuickActionTone; // para enterprise severity styling

  disabled?: boolean;
}) {
  const Icon = props.icon;
  const tone: QuickActionTone = props.tone ?? "neutral";

  const toneBorder =
    tone === "critical"
      ? "border-destructive/35"
      : tone === "warning"
      ? "border-amber-600/30"
      : tone === "success"
      ? "border-emerald-600/30"
      : tone === "info"
      ? "border-sky-600/25"
      : "border-border/60";

  const toneBg =
    tone === "critical"
      ? "bg-destructive/5"
      : tone === "warning"
      ? "bg-amber-600/10"
      : tone === "success"
      ? "bg-emerald-600/10"
      : tone === "info"
      ? "bg-sky-600/10"
      : "bg-card";

  const iconRing =
    tone === "critical"
      ? "border-destructive/25"
      : tone === "warning"
      ? "border-amber-600/25"
      : tone === "success"
      ? "border-emerald-600/25"
      : tone === "info"
      ? "border-sky-600/20"
      : "border-border/60";

  const iconBg =
    tone === "critical"
      ? "bg-destructive/10"
      : tone === "warning"
      ? "bg-amber-600/10"
      : tone === "success"
      ? "bg-emerald-600/10"
      : tone === "info"
      ? "bg-sky-600/10"
      : "bg-background";

  const metaCls =
    tone === "critical"
      ? "border-destructive/25 bg-destructive/10 text-destructive"
      : tone === "warning"
      ? "border-amber-600/25 bg-amber-600/10 text-amber-700"
      : tone === "success"
      ? "border-emerald-600/25 bg-emerald-600/10 text-emerald-700"
      : tone === "info"
      ? "border-sky-600/20 bg-sky-600/10 text-sky-700"
      : "border-border bg-muted/40 text-muted-foreground";

  const SeverityIcon =
    tone === "critical" ? ShieldAlert : tone === "warning" ? AlertTriangle : tone === "info" ? Sparkles : null;

  return (
    <button
      type="button"
      onClick={props.onClick}
      disabled={props.disabled}
      className={cn(
        "group w-full text-left rounded-2xl border px-4 py-3 transition-colors",
        toneBorder,
        toneBg,
        "hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring/40",
        props.disabled ? "opacity-60 cursor-not-allowed" : ""
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("h-10 w-10 rounded-2xl border grid place-items-center shrink-0", iconRing, iconBg)}>
            <Icon className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-sm font-semibold truncate">{props.title}</div>

              {props.meta ? (
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] inline-flex items-center gap-1", metaCls)}>
                  {SeverityIcon ? <SeverityIcon className="size-3" /> : null}
                  {props.meta}
                </span>
              ) : null}
            </div>

            <div className="text-xs text-muted-foreground truncate">{props.subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {props.rightMeta ? (
            <div className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
              {props.rightMeta}
            </div>
          ) : null}
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}