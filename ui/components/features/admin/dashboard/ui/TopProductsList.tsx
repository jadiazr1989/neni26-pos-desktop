"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardTopProductDTO } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

export type BuildVariantHref = (variantId: string) => string;

export function defaultBuildVariantHref(variantId: string): string {
  return `/admin/products/variants/${variantId}`;
}

export function buildTopProductLabel(item: DashboardTopProductDTO): string {
  return item.title?.trim() || item.productName?.trim() || item.sku?.trim() || item.variantId;
}

export function TopProductsList(props: {
  items: DashboardTopProductDTO[];
  onNavigate: (href: string) => void;
  buildVariantHref?: BuildVariantHref;
  formatMoney: (v: string) => string;
}) {
  const buildHref = props.buildVariantHref ?? defaultBuildVariantHref;

  if (props.items.length === 0) {
    return <div className="text-sm text-muted-foreground">Sin datos en este rango.</div>;
  }

  return (
    <div className="space-y-2">
      {props.items.map((p) => {
        const href = buildHref(p.variantId);

        return (
          <button
            key={p.variantId}
            onClick={() => props.onNavigate(href)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left",
              "transition-colors hover:bg-accent/20"
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {buildTopProductLabel(p)}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.qtyDisplay} {p.displayUnit} · {props.formatMoney(p.revenueBaseMinor)}
              </div>
            </div>

            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}