"use client";

import * as React from "react";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrendDatum } from "./dashboard-trend.types";
import type { MoneyLabelFn } from "./DashboardTrendChart";

type TooltipPayload = Payload<number, string> & { payload?: unknown };

type Props = {
  active?: boolean;
  payload?: readonly TooltipPayload[];
  moneyLabel: MoneyLabelFn;
};

function fmtDateOrHourCuba(value: string): string {
  const s = String(value ?? "").trim();

  // hourly: YYYY-MM-DDTHH:00
  const mh = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):00$/.exec(s);
  if (mh) {
    const hh = Number(mh[4]);
    if (!Number.isFinite(hh)) return `${mh[4]}:00`;
    const isPM = hh >= 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}${isPM ? "pm" : "am"}`; // Cuba casual
  }

  // daily: YYYY-MM-DD
  const md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (md) return `${md[3]}/${md[2]}/${md[1]}`; // DD/MM/YYYY

  return s;
}

function isTrendDatum(v: unknown): v is TrendDatum {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r["date"] === "string" && typeof r["tickets"] === "number" && typeof r["netBaseMinor"] === "number";
}

export function DashboardTrendTooltip(props: Props) {
  const { active, payload, moneyLabel } = props;

  if (!active || !payload || payload.length === 0) return null;

  const rowRaw = payload[0]?.payload;
  if (!isTrendDatum(rowRaw)) return null;

  const row = rowRaw;

  return (
    <Card className={cn("rounded-xl border bg-background px-4 py-3 shadow-sm backdrop-blur")}>
      <div className="text-xs font-medium text-muted-foreground">
        {fmtDateOrHourCuba(row.date)}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-10 gap-y-2">
        <div className="text-xs text-muted-foreground">Ventas netas</div>
        <div className="text-sm font-semibold tabular-nums text-right">
          {moneyLabel(row.netBaseMinor)}
        </div>

        <div className="text-xs text-muted-foreground">Tickets</div>
        <div className="text-sm font-semibold tabular-nums text-right">
          {row.tickets}
        </div>
      </div>
    </Card>
  );
}