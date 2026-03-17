export type TrendBucket = "day" | "hour";

export type TrendDatum = {
  date: string; // YYYY-MM-DD o YYYY-MM-DDTHH:00
  bucket: TrendBucket;

  tickets: number;

  netBaseMinor: number;
  refundsBaseMinor?: number;
  discountsBaseMinor?: number;
  grossMarginBaseMinor?: number;
};

export type TrendKey = keyof Omit<TrendDatum, "date">; // "netBaseMinor" | "tickets"
