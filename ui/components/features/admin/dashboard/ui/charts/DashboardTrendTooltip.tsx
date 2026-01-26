// src/modules/admin/dashboard/ui/charts/DashboardTrendTooltip.tsx
"use client";

import * as React from "react";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrendDatum } from "./dashboard-trend.types";

function moneyCUP(minor: number): string {
  return `${new Intl.NumberFormat("es-CU", { maximumFractionDigits: 0 }).format(minor)} CUP`;
}

type TooltipProps = {
  active?: boolean;
  label?: string;
  payload?: Array<Payload<ValueType, NameType> & { payload?: TrendDatum }>;
};

export function DashboardTrendTooltip(props: TooltipProps) {
  if (!props.active || !props.payload || props.payload.length === 0) return null;

  const row = props.payload[0]?.payload;
  if (!row) return null;

  return (
    <Card className={cn("rounded-xl px-3 py-2 shadow-sm")}>
      <div className="text-xs text-muted-foreground">{props.label ?? row.date}</div>

      <div className="mt-1 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-muted-foreground">Ventas netas</span>
          <span className="text-sm font-medium tabular-nums">{moneyCUP(row.netBaseMinor)}</span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="text-xs text-muted-foreground">Tickets</span>
          <span className="text-sm font-medium tabular-nums">{row.tickets}</span>
        </div>
      </div>
    </Card>
  );
}
