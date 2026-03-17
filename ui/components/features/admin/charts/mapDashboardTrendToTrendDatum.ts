// src/modules/admin/dashboard/ui/charts/mapDashboardTrendToTrendDatum.ts
import type { DashboardTrendPointDTO } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { moneyStrToSafeIntLocal } from "../dashboard/utils/dashboardMoney";
import { TrendBucket, TrendDatum } from "./dashboard-trend.types";


function normalizeBucket(p: DashboardTrendPointDTO): TrendBucket {
  if (p.bucket === "hour" || p.bucket === "day") return p.bucket;
  return String(p.day).includes("T") ? "hour" : "day";
}

function toIntSafe(n: unknown): number {
  const x = typeof n === "number" ? n : Number(n);
  return Number.isFinite(x) ? Math.trunc(x) : 0;
}

export function mapDashboardTrendToTrendDatum(trend: DashboardTrendPointDTO[]): TrendDatum[] {
  return (trend ?? []).map((p): TrendDatum => ({
    date: String(p.day ?? ""),
    bucket: normalizeBucket(p),

    tickets: Math.max(0, toIntSafe(p.ticketsCount)),

    netBaseMinor: moneyStrToSafeIntLocal(p.netSalesBaseMinor),
    refundsBaseMinor: moneyStrToSafeIntLocal(p.refundsBaseMinor),
    discountsBaseMinor: moneyStrToSafeIntLocal(p.discountsBaseMinor),
    grossMarginBaseMinor: moneyStrToSafeIntLocal(p.grossMarginBaseMinor),
  }));
}