// src/modules/admin/dashboard/ui/charts/mapDashboardTrendToTrendDatum.ts
import type { DashboardTrendPointDTO, MoneyStr } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

export type TrendDatum = {
  date: string; // YYYY-MM-DD o YYYY-MM-DDTHH:00
  tickets: number;
  netBaseMinor: number;
  bucket: "day" | "hour";
};

function moneyStrToSafeInt(v: MoneyStr): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  const max = Number.MAX_SAFE_INTEGER;
  const min = -Number.MAX_SAFE_INTEGER;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function normalizeBucket(p: DashboardTrendPointDTO): "day" | "hour" {
  // ✅ compat: si un payload viejo no trae bucket, lo inferimos
  if (p.bucket === "hour" || p.bucket === "day") return p.bucket;
  return String(p.day).includes("T") ? "hour" : "day";
}

export function mapDashboardTrendToTrendDatum(points: DashboardTrendPointDTO[]): TrendDatum[] {
  return points.map((p) => ({
    date: p.day,
    tickets: Number.isFinite(p.ticketsCount) ? p.ticketsCount : 0,
    netBaseMinor: moneyStrToSafeInt(p.netSalesBaseMinor),
    bucket: normalizeBucket(p),
  }));
}