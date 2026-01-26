"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopProductVM } from "./presenter/admin-dashboard.presenter";

export type BuildVariantHref = (variantId: string) => string;

export function defaultBuildVariantHref(variantId: string): string {
  // ✅ Ajusta esto a tu routing real
  // Ejemplos posibles:
  // return `/admin/products/variants/${variantId}`;
  // return `/admin/catalog/variants/${variantId}`;
  return `/admin/products/variants/${variantId}`;
}

export function TopProductsList(props: {
  items: TopProductVM[];
  onNavigate: (href: string) => void;
  buildVariantHref?: BuildVariantHref;
  formatMoney: (v: number) => string;
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
              "w-full text-left flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2",
              "hover:bg-accent/20 transition-colors",
            )}
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{p.label}</div>
              <div className="text-xs text-muted-foreground">
                {p.qty} uds · {props.formatMoney(p.revenueBaseMinor)}
              </div>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        );
      })}
    </div>
  );
}
