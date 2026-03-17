// src/modules/admin/reports/ui/AdminReportsOverviewPanel.tsx
"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type {
  PaymentMethodCode,
  ReportsAlertsDTO,
  ReportsDailyRowDTO,
  ReportsOverviewDTO,
} from "@/lib/modules/admin/reports";

import { moneyStrToLabelCUP_NoGrouping } from "@/lib/money/formatCUP";
import { DashboardTrendChart } from "../../admin/charts/DashboardTrendChart";
import { EmptyBlock } from "../../admin/dashboard/ui/EmptyBlock";
import { KpiCard } from "../../admin/dashboard/ui/KpiCard";

// ---------- helpers ----------
type MixRow = {
  method: PaymentMethodCode;
  label: string;
  pctBps: number; // 0..10000
  totalBaseMinor: string; // MoneyStr
};

function clampBps(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10000, Math.floor(n)));
}

function fmtPctFromBps(bps: number): string {
  const x = clampBps(bps);
  const whole = Math.floor(x / 100);
  const frac = String(x % 100).padStart(2, "0");
  return `${whole}.${frac}%`;
}

export function labelForMethod(m: PaymentMethodCode): string {
  switch (m) {
    case "CASH":
      return "Efectivo";
    case "CARD":
      return "Tarjeta";
    case "TRANSFER":
      return "Transferencia";
    case "OTHER":
      return "Otros";
    default:
      return m;
  }
}

function buildMixRowsFromSummary(overview: ReportsOverviewDTO): MixRow[] {
  const pct = overview.paymentsMixSummary?.pctBps;
  const totals = overview.paymentsMixSummary?.totalsBaseMinor;

  const methods: PaymentMethodCode[] = ["CASH", "CARD", "TRANSFER", "OTHER"];

  const rows = methods.map((m) => ({
    method: m,
    label: labelForMethod(m),
    pctBps: clampBps(pct?.[m] ?? 0),
    totalBaseMinor: String(totals?.[m] ?? "0"),
  }));

  rows.sort((a, b) => b.pctBps - a.pctBps);
  return rows;
}

function MixChartCard(props: { rows: MixRow[] }) {
  if (props.rows.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Mix de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Sin pagos en el período.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mix de pagos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {props.rows.map((r) => (
          <div key={r.method} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="font-medium">{r.label}</div>
              <div className="text-muted-foreground">{fmtPctFromBps(r.pctBps)}</div>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-foreground/70"
                style={{ width: `${Math.max(0, Math.min(100, r.pctBps / 100))}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// MoneyStr = string BigInt serialized. For charts we need number -> clamp.
function moneyStrToSafeInt(v: string): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const max = Number.MAX_SAFE_INTEGER;
  const min = -Number.MAX_SAFE_INTEGER;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

// ---------- main ----------
export function AdminReportsOverviewPanel(props: {
  loading: boolean;
  overview: ReportsOverviewDTO | null;
  dailyRows: ReportsDailyRowDTO[];
  alerts: ReportsAlertsDTO | null; // kept to avoid breaking callers; not rendered anymore
}) {
  const moneyLabel = React.useCallback((minor: number) => moneyStrToLabelCUP_NoGrouping(String(minor)), []);

  const vm = React.useMemo(() => {
    if (!props.overview) return null;

    const ov = props.overview;

    const grossLabel = moneyStrToLabelCUP_NoGrouping(ov.grossSalesBaseMinor);
    const refundsLabel = moneyStrToLabelCUP_NoGrouping(ov.refundsBaseMinor);
    const netLabel = moneyStrToLabelCUP_NoGrouping(ov.netBaseMinor);
    const avgTicketLabel = moneyStrToLabelCUP_NoGrouping(ov.avgTicketBaseMinor);
    const ticketsLabel = String(ov.ticketsCount ?? 0);

    const mixRows = buildMixRowsFromSummary(ov);

    const trend = props.dailyRows.map((r) => ({
      date: r.day,
      bucket: "day" as const,
      tickets: Number(r.ticketsCount ?? 0),
      netBaseMinor: moneyStrToSafeInt(String(r.netBaseMinor ?? "0")),
      refundsBaseMinor: moneyStrToSafeInt(String(r.refundsBaseMinor ?? "0")),
    }));

    return {
      kpis: { grossLabel, refundsLabel, netLabel, ticketsLabel, avgTicketLabel },
      mixRows,
      trend,
    };
  }, [props.overview, props.dailyRows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard title="Ventas brutas" value={vm?.kpis.grossLabel ?? "—"} hint="" tone="success" />
        <KpiCard title="Devoluciones" value={vm?.kpis.refundsLabel ?? "—"} hint="" tone="danger" />
        <KpiCard title="Ventas netas" value={vm?.kpis.netLabel ?? "—"} hint="Brutas - devoluciones" tone="default" />
        <KpiCard title="Tickets" value={vm?.kpis.ticketsLabel ?? "—"} hint="" tone="warning" />
        <KpiCard title="Ticket promedio" value={vm?.kpis.avgTicketLabel ?? "—"} hint="Netas / tickets" tone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MixChartCard rows={vm?.mixRows ?? []} />

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            {!vm ? (
              <EmptyBlock loading={props.loading} label="Cargando resumen..." />
            ) : vm.trend.length === 0 ? (
              <div className="text-sm text-muted-foreground">No hay datos en el período seleccionado.</div>
            ) : (
              <DashboardTrendChart
                data={vm.trend}
                title="Tendencia diaria"
                subtitle="Pasa el mouse para ver tickets"
                moneyLabel={moneyLabel}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}