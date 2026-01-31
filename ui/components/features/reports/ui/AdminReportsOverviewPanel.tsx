// src/modules/admin/reports/ui/AdminReportsOverviewPanel.tsx
"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ReportsDailyRowDTO, ReportsOverviewDTO } from "@/lib/modules/admin/reports";

import { buildReportsOverviewVM } from "./presenter/admin-reports.presenter";
import { makeMoneyFormatter } from "../../admin/dashboard/ui/presenter/admin-dashboard.presenter";
import { KpiCard } from "../../admin/dashboard/ui/KpiCard";
import { EmptyBlock } from "../../admin/dashboard/ui/EmptyBlock";
import { DashboardTrendChart } from "../../admin/dashboard/ui/charts/DashboardTrendChart";

export function AdminReportsOverviewPanel(props: {
  loading: boolean;
  overview: ReportsOverviewDTO | null;
  dailyRows: ReportsDailyRowDTO[];
}) {
  const money = React.useMemo(() => makeMoneyFormatter("es-CU", "CUP"), []);

  const vm = React.useMemo(() => {
    if (!props.overview) return null;
    return buildReportsOverviewVM({
      overview: props.overview,
      daily: props.dailyRows,
      money,
    });
  }, [props.overview, props.dailyRows, money]);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title={vm?.kpis[0]?.title ?? "Ventas netas"} value={vm?.kpis[0]?.value ?? "—"} hint={vm?.kpis[0]?.hint ?? ""} tone={vm?.kpis[0]?.tone} />
        <KpiCard title={vm?.kpis[1]?.title ?? "Tickets"} value={vm?.kpis[1]?.value ?? "—"} hint={vm?.kpis[1]?.hint ?? ""} tone={vm?.kpis[1]?.tone} />
        <KpiCard title={vm?.kpis[2]?.title ?? "Ticket promedio"} value={vm?.kpis[2]?.value ?? "—"} hint={vm?.kpis[2]?.hint ?? ""} tone={vm?.kpis[2]?.tone} />
        <KpiCard title="Devoluciones" value={vm?.kpis[3]?.value ?? "—"} hint={vm?.kpis[3]?.hint ?? ""} tone={vm?.kpis[3]?.tone} />
      </div>


      {/* Tendencia */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Tendencia diaria</CardTitle>
          <div className="text-sm text-muted-foreground">
            Actividad diaria del período seleccionado.
            <span className="ml-1">Barras: tickets · Línea: ventas netas</span>
          </div>

        </CardHeader>
        <CardContent>
          {!vm ? (
            <EmptyBlock loading={props.loading} label="Cargando resumen..." />
          ) : vm.trend.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay datos en el período seleccionado.</div>
          ) : (
            <DashboardTrendChart data={vm.trend} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
