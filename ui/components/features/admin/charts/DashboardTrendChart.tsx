"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  type TooltipProps as RechartsTooltipProps,
  LabelProps,
  Bar,
  LabelList,
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

type MetricKey = "net" | "margin" | "discounts" | "refunds";

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

function maxAbsMinor(data: Array<{ metricMinor: number }>): number {
  let m = 0;
  for (const r of data) m = Math.max(m, Math.abs(toNumSafe(r.metricMinor)));
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


// ✅ cap arriba de cada barra (igual que antes)
function BarCap(props: LabelProps) {
  const { x, y, width, value } = props;
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number") return null;

  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  if (!Number.isFinite(n) || n === 0) return null;

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

/* =========================
   ✅ 24 buckets helpers
   ========================= */

function isHourlyKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:00$/.test(String(s ?? ""));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

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
        bucket: "hour",
        tickets: 0,
        netBaseMinor: 0,
        refundsBaseMinor: 0,
        discountsBaseMinor: 0,
        grossMarginBaseMinor: 0,
      }
    );
  }
  return out;
}

// ---- MA helper ----
type ChartDatum = TrendDatum & { metricMinor: number; ma: number };

function movingAvgWithMetric(
  data: TrendDatum[],
  getMetric: (r: TrendDatum) => number,
  window: number
): ChartDatum[] {
  const w = Math.max(2, Math.trunc(window));
  const out: ChartDatum[] = [];
  const buf: number[] = [];

  for (const r of data) {
    const metricMinor = toNumSafe(getMetric(r));
    buf.push(metricMinor);
    if (buf.length > w) buf.shift();

    const sum = buf.reduce((a, b) => a + b, 0);
    const ma = buf.length ? sum / buf.length : 0;

    out.push({ ...r, metricMinor, ma });
  }
  return out;
}

type Props = {
  data: TrendDatum[];
  moneyLabel?: MoneyLabelFn;
  heightClassName?: string;

  // (no rellenamos daily en front; backend ya da el rango)
  periodFrom?: string;
  periodTo?: string;

  metric?: MetricKey;

  title?: React.ReactNode;
  subtitle?: React.ReactNode;
};

export function DashboardTrendChart(props: Props) {
  const moneyLabel = props.moneyLabel ?? defaultMoneyLabelCUP;
  const metric: MetricKey = props.metric ?? "net";

  const getMetricMinor = React.useCallback(
    (r: TrendDatum): number => {
      if (metric === "net") return toNumSafe(r.netBaseMinor);
      if (metric === "margin") return toNumSafe(r.grossMarginBaseMinor ?? 0);
      if (metric === "discounts") return toNumSafe(r.discountsBaseMinor ?? 0);
      return toNumSafe(r.refundsBaseMinor ?? 0);
    },
    [metric]
  );

  // ✅ Detect hourly by key format
  const isHourly = React.useMemo(() => {
    const first = props.data?.[0]?.date ?? "";
    return isHourlyKey(String(first));
  }, [props.data]);

  // ✅ Keep your proven hourly behavior; DO NOT fill daily here
  const chartDataBase = React.useMemo(() => {
    const base = props.data ?? [];
    if (isHourly) return fill24Hours(base);

    // daily: backend ya trae todos los días en tz correcto
    // orden estable por string
    const sorted = base.slice();
    sorted.sort((a, b) => String(a.date).localeCompare(String(b.date)));
    return sorted;
  }, [props.data, isHourly]);

  // ✅ add MA + metricMinor
  const withMa = React.useMemo(() => {
    return movingAvgWithMetric(chartDataBase, getMetricMinor, 3);
  }, [chartDataBase, getMetricMinor]);

  const nPoints = withMa.length;

  // ✅ hourly ticks: 12 labels (2h) but 24 spacing
  const xTicks = React.useMemo(() => {
    if (!isHourly) return undefined as string[] | undefined;
    const day = String(withMa?.[0]?.date ?? "").slice(0, 10);
    if (!day) return undefined;
    const ticks: string[] = [];
    for (let h = 0; h < 24; h += 2) ticks.push(`${day}T${pad2(h)}:00`);
    return ticks;
  }, [isHourly, withMa]);

  const dailyInterval = React.useMemo(() => {
    if (isHourly) return "preserveStartEnd" as const;
    if (nPoints <= 8) return 0;
    if (nPoints <= 16) return 1;
    return 2;
  }, [isHourly, nPoints]);

  function formatMoneyTick(v: string | number) {
    const n = typeof v === "number" ? v : Number(v);
    const major = Math.trunc(toNumSafe(n) / 100);
    return major.toString();
  }

  const formatDateTick = React.useCallback((v: string | number) => fmtDateCuba(String(v)), []);

  const yMax = React.useMemo(() => {
    const m = maxAbsMinor(withMa);
    return roundUpNiceMaxMinor(m);
  }, [withMa]);

  const renderTooltip = React.useCallback(
    (tp: RechartsTooltipProps<ValueType, NameType>) => (
      <DashboardTrendTooltip {...tp} moneyLabel={moneyLabel} metric={metric} />
    ),
    [moneyLabel, metric]
  );

  const barMax = nPoints <= 1 ? 28 : 48;
  const barCategoryGap = nPoints <= 1 ? "70%" : nPoints <= 3 ? "55%" : "30%";
  const barGap = nPoints <= 1 ? 12 : 6;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold tracking-tight">{props.title}</div>
          <div className="text-xs text-muted-foreground">{props.subtitle}</div>
        </div>
      </div>

      <div className={props.heightClassName ?? "h-64 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={withMa}
            margin={{ top: 10, right: 14, bottom: 10, left: 10 }}
            barCategoryGap={barCategoryGap}
            barGap={barGap}
          >
            <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" opacity={0.22} />

            <XAxis
              dataKey="date"
              tickMargin={10}
              tickFormatter={formatDateTick}
              ticks={xTicks}
              interval={dailyInterval}
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

            <Tooltip cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }} content={renderTooltip} />

            <Bar
              yAxisId="money"
              dataKey="metricMinor"
              fill="hsl(var(--primary) / 0.35)"
              radius={[8, 8, 4, 4]}
              maxBarSize={barMax}
              minPointSize={2}
              isAnimationActive={false}
            >
              <LabelList content={<BarCap />} />
            </Bar>
            {/* ✅ main metric */}
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="metricMinor"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={nPoints <= 1 ? { r: 3 } : false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />

            {/* ✅ moving average */}
            <Line
              yAxisId="money"
              type="monotone"
              dataKey="ma"
              stroke="hsl(var(--primary))"
              strokeWidth={1}
              strokeOpacity={0.35}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}