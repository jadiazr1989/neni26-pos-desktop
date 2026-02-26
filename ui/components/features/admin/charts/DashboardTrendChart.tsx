"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  LabelList,
  type TooltipProps as RechartsTooltipProps,
  LabelProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

import type { TrendDatum } from "./dashboard-trend.types";
import { DashboardTrendTooltip } from "./DashboardTrendTooltip";

export type MoneyLabelFn = (minor: number) => string;

export const defaultMoneyLabelCUP: MoneyLabelFn = (minor) => {
  const n0 = Number(minor ?? 0);
  const n = Number.isFinite(n0) ? Math.trunc(n0) : 0;

  const neg = n < 0;
  const x = Math.abs(n);

  const major = Math.trunc(x / 100).toString();
  const cents = (x % 100).toString().padStart(2, "0");
  return `${neg ? "-" : ""}${major}.${cents} CUP`;
};

function fmtDateCuba(value: string): string {
  const s = String(value ?? "").trim();

  // hourly: YYYY-MM-DDTHH:00
  const mh = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):00$/.exec(s);
  if (mh) {
    const hh = Number(mh[4]);
    if (!Number.isFinite(hh)) return `${mh[4]}:00`;

    const isPM = hh >= 12;
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    return `${h12}${isPM ? "pm" : "am"}`;
  }

  // daily: YYYY-MM-DD
  const md = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (md) return `${md[3]}/${md[2]}/${md[1]}`;

  return s;
}

function toNumSafe(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function maxNetMinor(data: TrendDatum[]): number {
  let m = 0;
  for (const r of data) m = Math.max(m, toNumSafe(r.netBaseMinor));
  return m;
}

function roundUpNiceMaxMinor(maxMinor: number): number {
  if (maxMinor <= 0) return 100 * 100;

  const headroom = Math.max(Math.ceil(maxMinor * 0.12), 5000);
  const target = maxMinor + headroom;

  const major = Math.ceil(target / 100);

  const step = major <= 500 ? 50 : major <= 2000 ? 100 : 250;

  const roundedMajor = Math.ceil(major / step) * step;
  return roundedMajor * 100;
}

function sumNetMinor(data: TrendDatum[]): number {
  let acc = 0;
  for (const r of data) acc += toNumSafe(r.netBaseMinor);
  return acc;
}

function sumTickets(data: TrendDatum[]): number {
  let acc = 0;
  for (const r of data) acc += Math.max(0, Math.trunc(toNumSafe(r.tickets)));
  return acc;
}

/* =========================
   ✅ 24 buckets helpers
   ========================= */

function isHourlyKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:00$/.test(String(s ?? ""));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Recibe data hourly parcial (solo horas con ventas) y devuelve 24 puntos 00..23
 * usando la fecha del primer punto.
 */
function fill24Hours(data: TrendDatum[]): TrendDatum[] {
  if (!data || data.length === 0) return [];

  const firstKey = String(data[0].date);
  if (!isHourlyKey(firstKey)) return data;

  const day = firstKey.slice(0, 10); // YYYY-MM-DD

  const map = new Map<string, TrendDatum>();
  for (const r of data) map.set(String(r.date), r);

  const out: TrendDatum[] = [];
  for (let h = 0; h < 24; h++) {
    const key = `${day}T${pad2(h)}:00`;
    const row = map.get(key);
    out.push(
      row ?? {
        date: key,
        tickets: 0,
        netBaseMinor: 0,
      }
    );
  }
  return out;
}

type Props = {
  data: TrendDatum[];
  moneyLabel?: MoneyLabelFn;
  heightClassName?: string;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  showSummaryBadges?: boolean;

  labels?: {
    net?: string;
    tickets?: string;
    avg?: string;
  };
};

// ✅ cap arriba de cada barra (puntito + mini línea)
function BarCap(props: LabelProps) {
  const { x, y, width, value } = props;

  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") {
    return null;
  }

  const numericValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;

  if (!Number.isFinite(numericValue) || numericValue <= 0) return null;

  const cx = x + width / 2;

  return (
    <g>
      <line
        x1={cx - 10}
        x2={cx + 10}
        y1={y}
        y2={y}
        stroke="hsl(var(--primary))"
        strokeOpacity={0.35}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={y} r={3} fill="hsl(var(--primary))" fillOpacity={0.9} />
    </g>
  );
}

export function DashboardTrendChart(props: Props) {
  const moneyLabel = props.moneyLabel ?? defaultMoneyLabelCUP;

  const showHeader = props.title !== undefined || props.subtitle !== undefined;
  const showBadges = props.showSummaryBadges ?? (showHeader ? true : false);

  const labels = props.labels ?? {
    net: "Ventas netas",
    tickets: "Tickets",
    avg: "Prom/ticket",
  };

  function formatMoneyTick(v: string | number) {
    const n = typeof v === "number" ? v : Number(v);
    const major = Math.trunc(toNumSafe(n) / 100);
    return major.toString();
  }

  const formatDateTick = React.useCallback((v: string | number) => fmtDateCuba(String(v)), []);

  // ✅ Detect hourly mode by the key format
  const isHourly = React.useMemo(() => {
    const first = props.data?.[0]?.date ?? "";
    return isHourlyKey(String(first));
  }, [props.data]);

  // ✅ For hourly: force 24 points
  const chartData = React.useMemo(() => {
    if (!isHourly) return props.data ?? [];
    return fill24Hours(props.data ?? []);
  }, [isHourly, props.data]);

  const nPoints = chartData.length;

  // ✅ For hourly: show 12 visible labels (each 2 hours), but keep 24 buckets spacing
  const xTicks = React.useMemo(() => {
    if (!isHourly) return undefined as string[] | undefined;
    const day = String(chartData?.[0]?.date ?? "").slice(0, 10);
    if (!day) return undefined;
    const ticks: string[] = [];
    for (let h = 0; h < 24; h += 2) ticks.push(`${day}T${pad2(h)}:00`);
    return ticks;
  }, [isHourly, chartData]);

  const barMax = nPoints <= 1 ? 28 : 48;
  const barCategoryGap = nPoints <= 1 ? "70%" : nPoints <= 3 ? "55%" : "30%";
  const barGap = nPoints <= 1 ? 12 : 6;

  const yMax = React.useMemo(() => roundUpNiceMaxMinor(maxNetMinor(chartData)), [chartData]);

  const totalNetMinor = React.useMemo(() => sumNetMinor(chartData), [chartData]);
  const totalTickets = React.useMemo(() => sumTickets(chartData), [chartData]);

  const renderTooltip = React.useCallback(
    (tp: RechartsTooltipProps<ValueType, NameType>) => (
      <DashboardTrendTooltip {...tp} moneyLabel={moneyLabel} />
    ),
    [moneyLabel]
  );

  return (
    <div className="space-y-3">
      {showHeader ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {props.title !== undefined ? (
              <div className="text-base font-semibold tracking-tight">{props.title}</div>
            ) : null}
            {props.subtitle !== undefined ? (
              <div className="text-xs text-muted-foreground">{props.subtitle}</div>
            ) : null}
          </div>

          {showBadges ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border bg-background px-3 py-1 text-xs tabular-nums">
                {labels.net}: <span className="font-semibold">{moneyLabel(totalNetMinor)}</span>
              </span>
              <span className="rounded-full border bg-background px-3 py-1 text-xs tabular-nums">
                {labels.tickets}: <span className="font-semibold">{totalTickets}</span>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={props.heightClassName ?? "h-64 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData} // ✅ was props.data
            margin={{ top: 10, right: 14, bottom: 10, left: 10 }}
            barCategoryGap={barCategoryGap}
            barGap={barGap}
          >
            <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" opacity={0.22} />

            <XAxis
              dataKey="date"
              tickMargin={10}
              tickFormatter={formatDateTick}
              ticks={xTicks} // ✅ was props.data.map(...)
              interval={isHourly ? "preserveStartEnd" : undefined}
              minTickGap={isHourly ? 6 : 18}
              allowDuplicatedCategory={false}
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />

            <YAxis
              yAxisId="money"
              tickMargin={12}
              tickFormatter={formatMoneyTick}
              width={64}
              domain={[0, yMax]}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
              tick={{ fontSize: 13 }}
              style={{ fontVariantNumeric: "tabular-nums" }}
            />

            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
              content={renderTooltip}
            />

            <Bar
              yAxisId="money"
              dataKey="netBaseMinor"
              fill="hsl(var(--primary) / 0.65)"
              radius={[8, 8, 4, 4]}
              maxBarSize={barMax}
              isAnimationActive={false}
            >
              <LabelList content={<BarCap />} />
            </Bar>

            <Line
              yAxisId="money"
              type="monotone"
              dataKey="netBaseMinor"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={nPoints <= 1 ? { r: 3 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}