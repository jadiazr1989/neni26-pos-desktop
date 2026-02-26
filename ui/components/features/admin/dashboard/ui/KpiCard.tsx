// src/modules/admin/dashboard/ui/KpiCard.tsx
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
        icon: "text-emerald-700 dark:text-emerald-300",
        badge: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
      };
    case "warning":
      return {
        card: "border-amber-600/15 bg-amber-500/5",
        ring: "ring-1 ring-amber-500/20",
        iconWrap: "border-amber-600/20 bg-amber-500/10",
        icon: "text-amber-700 dark:text-amber-300",
        badge: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
      };
    case "danger":
      return {
        card: "border-rose-600/15 bg-rose-500/5",
        ring: "ring-1 ring-rose-500/18",
        iconWrap: "border-rose-600/20 bg-rose-500/10",
        icon: "text-rose-700 dark:text-rose-300",
        badge: "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
      };
    case "info":
      return {
        card: "border-sky-600/15 bg-sky-500/5",
        ring: "ring-1 ring-sky-500/18",
        iconWrap: "border-sky-600/20 bg-sky-500/10",
        icon: "text-sky-700 dark:text-sky-300",
        badge: "border-sky-600/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
      };
    case "neutral":
      return {
        card: "border-border/60 bg-muted/20",
        ring: "ring-1 ring-border/60",
        iconWrap: "border-border bg-muted/30",
        icon: "text-muted-foreground",
        badge: "border-border bg-muted/40 text-muted-foreground",
      };
    case "default":
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

function Chip(props: { tone?: KpiTone; children: React.ReactNode; title?: string }) {
  const t = toneStyles(props.tone);
  return (
    <span
      title={props.title}
      className={cn(
        "shrink-0 rounded-full border px-2 py-0.5 text-[11px] tabular-nums",
        "bg-muted/30 text-muted-foreground",
        t.badge
      )}
    >
      {props.children}
    </span>
  );
}

/** ✅ Value stable: single line + ellipsis + responsive font */
function KpiValue(props: { value: string }) {
  return (
    <div
      className={cn(
        "tabular-nums font-semibold tracking-tight leading-none",
        "max-w-full truncate",
        "text-[1.6rem] sm:text-[1.75rem] xl:text-[1.9rem]"
      )}
      title={props.value}
    >
      {props.value}
    </div>
  );
}

export function KpiCard(props: {
  title: string;
  value: string;
  hint: string;

  tone?: KpiTone;
  icon?: LucideIcon;

  /** left small chip near title */
  badge?: string;

  /** right chip (NOT next to the big value) */
  rightMeta?: string;

  clampHint?: boolean;
}) {
  const t = toneStyles(props.tone);
  const Icon = props.icon;

  return (
    <Card className={cn("rounded-2xl overflow-hidden", t.ring, t.card)}>
      <CardHeader className="pb-2">
        {/* Top row: title + chips + icon */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="truncate text-xs font-medium tracking-wide text-muted-foreground">
                {props.title}
              </div>

              {props.badge ? <Chip tone={props.tone}>{props.badge}</Chip> : null}
            </div>

            {/* Value row: BIG value alone */}
            <div className="mt-2">
              <KpiValue value={props.value} />
            </div>
          </div>

          <div className="flex items-start gap-2 shrink-0">
            {props.rightMeta ? (
              <Chip tone={props.tone} title={props.rightMeta}>
                {props.rightMeta}
              </Chip>
            ) : null}

            {Icon ? (
              <span className={cn("grid size-10 place-items-center rounded-2xl border", t.iconWrap)}>
                <Icon className={cn("size-4", t.icon)} />
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div
          className={cn(
            "text-xs text-muted-foreground",
            props.clampHint ? "line-clamp-2" : "truncate"
          )}
          title={props.hint}
        >
          {props.hint}
        </div>
      </CardContent>
    </Card>
  );
}