// src/modules/admin/reports/ui/presenter/admin-reports.presenter.ts
import type { TrendDatum } from "@/components/features/admin/charts/dashboard-trend.types";
import type { KpiTone } from "@/components/features/admin/dashboard/ui/KpiCard";

import type { ReportsDailyRowDTO, ReportsOverviewDTO } from "@/lib/modules/admin/reports";
import type { MoneyStr } from "@/lib/money/moneyStr";
import { bi } from "@/lib/money/moneyStr";

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

type MoneyFormatter = (minorStr: MoneyStr | null | undefined) => string;

function divRoundHalfUp(n: bigint, d: bigint): bigint {
  if (d <= 0n) return 0n;
  return (n + d / 2n) / d;
}

function avgMoneyStr(total: MoneyStr, count: number): MoneyStr {
  if (count <= 0) return "0";
  return divRoundHalfUp(bi(total), BigInt(count)).toString();
}

function moneyStrToNumberSafe(v: MoneyStr): number {
  const n = Number(bi(v));
  return Number.isFinite(n) ? n : 0;
}

export function buildReportsOverviewVM(params: {
  overview: ReportsOverviewDTO;
  daily: ReportsDailyRowDTO[];
  money: MoneyFormatter;
}): ReportsOverviewVM {
  const { overview, daily, money } = params;

  const ticketPromedioBaseMinor = avgMoneyStr(overview.grossSalesBaseMinor, overview.ticketsCount);
  const refundsBase = bi(overview.refundsBaseMinor);

  const kpis: ReportsKpiVM[] = [
    {
      title: "Ventas netas",
      value: money(overview.netBaseMinor),
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
      value: money(ticketPromedioBaseMinor),
      hint: "Promedio por ticket (basado en ventas brutas / tickets).",
    },
    {
      title: "Devoluciones",
      value: money(overview.refundsBaseMinor),
      hint: "Total devuelto en el período seleccionado.",
      tone: refundsBase > 0n ? "warning" : "neutral",
    },
  ];

  const trend: TrendDatum[] = daily.map((r) => ({
    date: r.day,
    tickets: r.ticketsCount,
    netBaseMinor: moneyStrToNumberSafe(r.netBaseMinor),
  }));

  return { kpis, trend };
}