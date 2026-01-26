// src/modules/admin/dashboard/ui/charts/dashboard-trend.types.ts
export type TrendDatum = {
  date: string;        // YYYY-MM-DD
  netBaseMinor: number;
  tickets: number;
};

export type TrendKey = keyof Omit<TrendDatum, "date">; // "netBaseMinor" | "tickets"
