// src/modules/admin/reports/ui/presenter/admin-reports.presenter.ts
import { TrendDatum } from "@/components/features/admin/dashboard/ui/charts/dashboard-trend.types";
import { KpiTone } from "@/components/features/admin/dashboard/ui/KpiCard";
import type { ReportsDailyRowDTO, ReportsOverviewDTO } from "@/lib/modules/admin/reports";

export type ReportsKpiVM = {
  title: string;
  value: string;
  hint: string;
  tone?: KpiTone;
};

export type ReportsOverviewVM = {
  kpis: ReportsKpiVM[];
  trend: TrendDatum[];
};

type MoneyFormatter = (minor: number) => string;

function avgMinor(totalMinor: number, count: number): number {
  if (count <= 0) return 0;
  return Math.round(totalMinor / count);
}

export function buildReportsOverviewVM(params: {
  overview: ReportsOverviewDTO;
  daily: ReportsDailyRowDTO[];
  money: MoneyFormatter;
}): ReportsOverviewVM {
  const { overview, daily, money } = params;

  const ticketPromedioMinor = avgMinor(overview.grossSalesMinor, overview.ticketsCount);

  const kpis: ReportsKpiVM[] = [
    {
      title: "Ventas netas",
      value: money(overview.netMinor),
      hint: "Ventas netas del período seleccionado (ventas - devoluciones - gastos).",
      tone: "success",
    },
    {
      title: "Tickets",
      value: String(overview.ticketsCount),
      hint: "Cantidad total de tickets en el período.",
    },
    {
      title: "Ticket promedio",
      value: money(ticketPromedioMinor),
      hint: "Promedio por ticket (basado en ventas brutas / tickets).",
    },
    {
      title: "Devoluciones",
      value: money(overview.refundsMinor),
      hint: "Total devuelto en el período seleccionado.",
      tone: overview.refundsMinor > 0 ? "warning" : "neutral",
    },
  ];

  // ✅ Compatible con DashboardTrendChart:
  // XAxis: date
  // Bar: tickets
  // Line: netBaseMinor
  const trend: TrendDatum[] = daily.map((r) => ({
    date: r.day,               // YYYY-MM-DD (ok para XAxis)
    tickets: r.ticketsCount,   // Bar
    netBaseMinor: r.netMinor,  // Line
  }));

  return { kpis, trend };
}
