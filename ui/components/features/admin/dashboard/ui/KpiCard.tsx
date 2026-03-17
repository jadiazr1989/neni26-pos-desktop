"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiTone = "default" | "neutral" | "success" | "warning" | "danger" | "info";

type ToneStyles = {
  card: string;
  ring: string;
  iconWrap: string;
  icon: string;
  badge: string;
};

function toneStyles(tone: KpiTone | undefined): ToneStyles {
  switch (tone) {
    case "success":
      return {
        card: "border-emerald-600/15 bg-emerald-500/5",
        ring: "ring-1 ring-emerald-500/20",
        iconWrap: "border-emerald-600/20 bg-emerald-500/10",
        icon: "text-emerald-700 dark:text-emerald-500",
        badge: "border-emerald-600/20 bg-emerald-300/10 text-emerald-700 dark:text-emerald-500",
      };
    case "warning":
      return {
        card: "border-amber-600/15 bg-amber-500/5",
        ring: "ring-1 ring-amber-500/20",
        iconWrap: "border-amber-600/20 bg-amber-500/10",
        icon: "text-amber-700 dark:text-amber-500",
        badge: "border-amber-600/20 bg-amber-300/10 text-amber-700 dark:text-amber-500",
      };
    case "danger":
      return {
        card: "border-rose-600/15 bg-rose-500/5",
        ring: "ring-1 ring-rose-500/18",
        iconWrap: "border-rose-600/20 bg-rose-500/10",
        icon: "text-rose-700 dark:text-rose-500",
        badge: "border-rose-600/20 bg-rose-300/10 text-rose-700 dark:text-rose-500",
      };
    case "info":
      return {
        card: "border-sky-600/15 bg-sky-500/5",
        ring: "ring-1 ring-sky-500/18",
        iconWrap: "border-sky-600/20 bg-sky-500/10",
        icon: "text-sky-700 dark:text-sky-500",
        badge: "border-sky-600/20 bg-sky-300/10 text-sky-700 dark:text-sky-500",
      };
    case "neutral":
      return {
        card: "border-border/60 bg-muted/20",
        ring: "ring-1 ring-border/60",
        iconWrap: "border-border bg-muted/30",
        icon: "text-muted-foreground",
        badge: "border-border bg-muted/40 text-muted-foreground",
      };
    default:
      return {
        card: "border-border/60 bg-background",
        ring: "ring-1 ring-border/60",
        iconWrap: "border-border bg-muted/30",
        icon: "text-muted-foreground",
        badge: "border-border bg-muted/40 text-muted-foreground",
      };
  }
}

function splitMoneyLabel(v: string): { amount: string; currency: string | null } {
  const s = String(v ?? "").trim();
  const m = /^(.+?)\s+([A-Z]{3})$/.exec(s);
  if (!m) return { amount: s, currency: null };
  return { amount: m[1], currency: m[2] };
}

export function KpiCard(props: {
  title: string;
  value: string;        // ej: "710.00 CUP"
  hint?: string;
  tone?: KpiTone;
  icon?: LucideIcon;
  badge?: string;        // ej: "Margin 12.7%"
  rightBadge?: string;   // extra (ej: "Cash share 100%")
}) {
  const t = toneStyles(props.tone);
  const Icon = props.icon;

  const { amount, currency } = React.useMemo(() => splitMoneyLabel(props.value), [props.value]);

  return (
    <Card className={cn("rounded-2xl min-w-0", t.ring, t.card)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="truncate text-xs font-medium tracking-wide text-muted-foreground">
                {props.title}
              </div>             
            </div>

            {/* ✅ value row: clamp + trunc */}
            <div className="mt-1 flex items-baseline gap-2 min-w-0">
              <div
                className={cn(
                  "min-w-0 truncate leading-none font-semibold tabular-nums",
                  "text-[26px] sm:text-[30px]"
                )}
                title={props.value}
              >
                {amount || "—"}
              </div>

              {currency && (
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", t.badge)}>
                  {currency}
                </span>
              )}
            </div>
          </div>

          {Icon ? (
            <span className={cn("grid size-10 place-items-center rounded-2xl border shrink-0", t.iconWrap)}>
              <Icon className={cn("size-4", t.icon)} />
            </span>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3">
        {/* Hint */}
        {props.hint ? (
          <div className="text-xs text-muted-foreground leading-snug line-clamp-2">
            {props.hint}
          </div>
        ) : (
          <div className="h-[32px]" />
        )}

        {/* Footer badges */}
        {(props.badge || props.rightBadge) && (
          <div className="flex items-center justify-between gap-2">
            {/* Left badge */}
            {props.badge ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px]",
                  t.badge
                )}
              >
                {props.badge}
              </span>
            ) : (
              <span />
            )}

            {/* Right badge */}
            {props.rightBadge ? (
              <span className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                {props.rightBadge}
              </span>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}