// src/modules/admin/dashboard/sections/DashboardTrendSection.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminDashboardDataV2,
  AdminDashboardRange,
  DashboardTrendPointDTO,
} from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { EmptyBlock } from "../ui/EmptyBlock";
import { moneyStrToSafeIntLocal } from "../utils/dashboardMoney";
import { DashboardTrendChart } from "../../charts/DashboardTrendChart";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

type Mode = "net" | "margin" | "discounts" | "refunds";

function normalizeBucket(p: DashboardTrendPointDTO): "day" | "hour" {
  if (p.bucket === "hour" || p.bucket === "day") return p.bucket;
  return String(p.day ?? "").includes("T") ? "hour" : "day";
}

function toTickets(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

export function DashboardTrendSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  error: string | null;
  range: AdminDashboardRange;
  rangeLabelShort: string;
}) {
  const d = props.data;

  // ✅ Cuba now: solo net/margin (si luego quieres, vuelve a habilitar)
  const [mode, setMode] = React.useState<Mode>("net");

  // ✅ Fuente única: el trend completo (con todas las métricas)
  const trendData = React.useMemo(() => {
    if (!d) return [];
    return (d.trend ?? []).map((p) => ({
      date: String(p.day ?? ""),
      bucket: normalizeBucket(p),
      tickets: toTickets(p.ticketsCount),

      netBaseMinor: moneyStrToSafeIntLocal(p.netSalesBaseMinor),
      refundsBaseMinor: moneyStrToSafeIntLocal(p.refundsBaseMinor),
      discountsBaseMinor: moneyStrToSafeIntLocal(p.discountsBaseMinor),
      grossMarginBaseMinor: moneyStrToSafeIntLocal(p.grossMarginBaseMinor),
    }));
  }, [d]);

  // ✅ Fallback solo para "today" cuando no vienen puntos
  const chartData = React.useMemo(() => {
    if (!d) return [];
    if (props.range !== "today") return trendData;
    if (trendData.length > 0) return trendData;

    const now = new Date();
    const yyyyMmDd = now.toISOString().slice(0, 10);
    const hh = String(now.getUTCHours()).padStart(2, "0");
    const key = `${yyyyMmDd}T${hh}:00`;

    return [
      {
        date: key,
        bucket: "hour" as const,
        tickets: toTickets(d.kpis.ticketsCount),

        netBaseMinor: moneyStrToSafeIntLocal(d.kpis.netSalesBaseMinor),
        refundsBaseMinor: moneyStrToSafeIntLocal(d.kpis.refundsBaseMinor),
        discountsBaseMinor: moneyStrToSafeIntLocal(d.kpis.discountsBaseMinor),
        grossMarginBaseMinor: moneyStrToSafeIntLocal(d.kpis.grossMarginBaseMinor),
      },
    ];
  }, [d, props.range, trendData]);

  const showNoData = !d && !props.loading && !!props.error;

  const modeLabel =
    mode === "net"
      ? "Ventas netas"
      : mode === "margin"
      ? "Margen bruto"
      : mode === "discounts"
      ? "Descuentos"
      : "Devoluciones";

  // ✅ title/subtitle que se pasan al Chart (y el Chart NO tiene que inventarlos)
  const title = modeLabel;

  // Si tu chart ya no usa tickets como barras, ajusta el texto:
  // - si barras = métrica: "Barras + línea + promedio móvil"
  // - si solo línea + MA: quita "barras"
  const subtitle =
    props.range === "today"
      ? `${modeLabel} · Hoy (por horas) · Promedio móvil`
      : `${modeLabel} · Promedio móvil`;

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">{`Tendencia · ${normalizeRangeLabelShort(
              props.rangeLabelShort
            )}`}</CardTitle>
            <div className="text-xs text-muted-foreground">
              {subtitle}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeBtn active={mode === "net"} onClick={() => setMode("net")}>
              Ventas Netas
            </ModeBtn>
            <ModeBtn active={mode === "margin"} onClick={() => setMode("margin")}>
              Margen Bruto
            </ModeBtn>

            {/*
            <ModeBtn active={mode === "discounts"} onClick={() => setMode("discounts")}>
              Disc
            </ModeBtn>
            <ModeBtn active={mode === "refunds"} onClick={() => setMode("refunds")}>
              Refund
            </ModeBtn>
            */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {showNoData ? (
          <EmptyBlock loading={props.loading} label={`Error: ${props.error ?? "No se pudo cargar"}`} />
        ) : !d ? (
          <EmptyBlock loading={props.loading} label="Cargando tendencia..." />
        ) : chartData.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay datos en el período seleccionado.</div>
        ) : (
          <DashboardTrendChart
            data={chartData}
            periodFrom={d.period.from}
            periodTo={d.period.to}
            metric={mode}
            heightClassName="h-72 w-full"
          />
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