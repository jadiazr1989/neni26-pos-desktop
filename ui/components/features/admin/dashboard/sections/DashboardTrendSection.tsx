// src/modules/admin/dashboard/sections/DashboardTrendSection.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminDashboardDataV2, AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { EmptyBlock } from "../ui/EmptyBlock";
import { moneyStrToSafeIntLocal } from "../utils/dashboardMoney";
import { DashboardTrendChart } from "../../charts/DashboardTrendChart";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

type Mode = "net" | "margin" | "discounts" | "refunds";

type TrendVm = {
  date: string;
  bucket: "day" | "hour";
  tickets: number;
  valueBaseMinor: number;
};

function mapTrend(d: AdminDashboardDataV2["trend"], mode: Mode): TrendVm[] {
  return (d ?? []).map((p) => {
    const tickets = Math.max(0, Math.trunc(Number(p.ticketsCount ?? 0) || 0));

    let v: number;
    if (mode === "margin") v = moneyStrToSafeIntLocal(p.grossMarginBaseMinor);
    else if (mode === "discounts") v = moneyStrToSafeIntLocal(p.discountsBaseMinor);
    else if (mode === "refunds") v = moneyStrToSafeIntLocal(p.refundsBaseMinor);
    else v = moneyStrToSafeIntLocal(p.netSalesBaseMinor);

    return {
      date: String(p.day ?? ""),
      bucket: p.bucket,
      tickets,
      valueBaseMinor: v,
    };
  });
}

export function DashboardTrendSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  error: string | null;
  range: AdminDashboardRange;
  rangeLabelShort: string;
}) {
  const d = props.data;
  const [mode, setMode] = React.useState<Mode>("net");

  const vm = React.useMemo(() => (d ? mapTrend(d.trend, mode) : []), [d, mode]);

  const vmFixed = React.useMemo(() => {
    if (!d) return [];
    if (props.range !== "today") return vm;
    if (vm.length > 0) return vm;

    // fallback mínimo
    const now = new Date();
    const yyyyMmDd = now.toISOString().slice(0, 10);
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const key = `${yyyyMmDd}T${hh}:00`;

    const fallbackValue =
      mode === "margin"
        ? moneyStrToSafeIntLocal(d.kpis.grossMarginBaseMinor)
        : mode === "discounts"
        ? moneyStrToSafeIntLocal(d.kpis.discountsBaseMinor)
        : mode === "refunds"
        ? moneyStrToSafeIntLocal(d.kpis.refundsBaseMinor)
        : moneyStrToSafeIntLocal(d.kpis.netSalesBaseMinor);

    return [{ date: key, bucket: "hour", tickets: d.kpis.ticketsCount ?? 0, valueBaseMinor: fallbackValue }];
  }, [d, props.range, vm, mode]);

  const showNoData = !d && !props.loading && !!props.error;

  const modeLabel =
    mode === "net" ? "Ventas netas" : mode === "margin" ? "Margen bruto" : mode === "discounts" ? "Descuentos" : "Devoluciones";

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{`Tendencia · ${normalizeRangeLabelShort(props.rangeLabelShort)}`}</CardTitle>
            <div className="text-xs text-muted-foreground">
              Tickets (barras) · {modeLabel} (línea)
              {props.range === "today" ? " · Ideal: por horas" : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeBtn active={mode === "net"} onClick={() => setMode("net")}>Net</ModeBtn>
            <ModeBtn active={mode === "margin"} onClick={() => setMode("margin")}>Margin</ModeBtn>
            <ModeBtn active={mode === "discounts"} onClick={() => setMode("discounts")}>Disc</ModeBtn>
            <ModeBtn active={mode === "refunds"} onClick={() => setMode("refunds")}>Refund</ModeBtn>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {showNoData ? (
          <EmptyBlock loading={props.loading} label={`Error: ${props.error ?? "No se pudo cargar"}`} />
        ) : !d ? (
          <EmptyBlock loading={props.loading} label="Cargando tendencia..." />
        ) : vmFixed.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos en el período seleccionado.</div>
        ) : (
          <div className="space-y-2">
            {props.range === "today" && vmFixed.length <= 1 ? (
              <div className="text-xs text-muted-foreground">Se muestra el acumulado para evitar huecos.</div>
            ) : null}
            <DashboardTrendChart
              data={vmFixed.map((r) => ({ date: r.date, bucket: r.bucket, tickets: r.tickets, netBaseMinor: r.valueBaseMinor }))}
              heightClassName="h-72 w-full"
              labels={{ net: modeLabel, tickets: "Tickets", avg: "Prom/ticket" }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ModeBtn(props: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-md border px-2.5 py-1 text-[11px] ${
        props.active ? "bg-muted/50" : "hover:bg-accent/30"
      }`}
    >
      {props.children}
    </button>
  );
}