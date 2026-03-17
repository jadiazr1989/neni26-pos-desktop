"use client";

import * as React from "react";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MoneyLabelFn } from "./DashboardTrendChart";

// 👇 mismo Payload helper
type TooltipPayload = Payload<number, string> & { payload?: unknown };

type MetricKey = "net" | "margin" | "discounts" | "refunds";

type RowLike = {
  date: string;
  tickets: number;

  netBaseMinor: number;
  refundsBaseMinor?: number;
  discountsBaseMinor?: number;
  grossMarginBaseMinor?: number;

  // ✅ si viene del chart (movingAvgWithMetric)
  metricMinor?: number;
};

type Props = {
  active?: boolean;
  payload?: readonly TooltipPayload[];
  moneyLabel: MoneyLabelFn;

  // ✅ nuevo
  metric: MetricKey;
};

function fmtDateOrHourCuba(value: string): string {
  const s = String(value ?? "").trim();

  const mh = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):00$/.exec(s);
  if (mh) {
    const hh = Number(mh[4]);
    if (!Number.isFinite(hh)) return `${mh[4]}:00`;
    const isPM = hh >= 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}${isPM ? "pm" : "am"}`;
  }

  const md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (md) return `${md[3]}/${md[2]}/${md[1]}`;

  return s;
}

function isRowLike(v: unknown): v is RowLike {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;

  return (
    typeof r["date"] === "string" &&
    typeof r["tickets"] === "number" &&
    typeof r["netBaseMinor"] === "number"
  );
}

function metricLabel(metric: MetricKey): string {
  if (metric === "net") return "Ventas netas";
  if (metric === "margin") return "Margen bruto";
  if (metric === "discounts") return "Descuentos";
  return "Devoluciones";
}

function pickMetricMinor(row: RowLike, metric: MetricKey): number {
  // ✅ prioridad: lo que calcula el chart (movingAvgWithMetric)
  if (typeof row.metricMinor === "number" && Number.isFinite(row.metricMinor)) return row.metricMinor;

  // fallback por si el chart no lo agrega aún
  if (metric === "margin") return Number(row.grossMarginBaseMinor ?? 0) || 0;
  if (metric === "discounts") return Number(row.discountsBaseMinor ?? 0) || 0;
  if (metric === "refunds") return Number(row.refundsBaseMinor ?? 0) || 0;
  return Number(row.netBaseMinor ?? 0) || 0;
}

export function DashboardTrendTooltip(props: Props) {
  const { active, payload, moneyLabel, metric } = props;

  if (!active || !payload || payload.length === 0) return null;

  const rowRaw = payload[0]?.payload;
  if (!isRowLike(rowRaw)) return null;

  const row = rowRaw;
  const label = metricLabel(metric);
  const valueMinor = pickMetricMinor(row, metric);

  return (
    <Card className={cn("rounded-xl border bg-background px-4 py-3 shadow-sm backdrop-blur")}>
      <div className="text-xs font-medium text-muted-foreground">
        {fmtDateOrHourCuba(row.date)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-10 gap-y-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold tabular-nums text-right">
          {moneyLabel(valueMinor)}
        </div>

        <div className="text-xs text-muted-foreground">Tickets</div>
        <div className="text-sm font-semibold tabular-nums text-right">{row.tickets}</div>
      </div>
    </Card>
  );
}