import type { CurrencyCode } from "@/lib/cash.types";

export type Counted = Partial<Record<CurrencyCode, number>>;

export function parseAmount(raw: string): number | null {
  const s = raw.trim().replace(",", ".");
  if (s === "") return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return n;
}

export function parseMoneyToMinor(input: string): number {
  const s = input.trim();
  if (!s) return 0;

  const normalized = s.replace(",", ".");
  const n = Number(normalized);

  if (!Number.isFinite(n) || n < 0) return 0;

  return Math.round(n * 100);
}

export function formatMinor(minor: number): string {
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  const whole = Math.floor(abs / 100);
  const cents = abs % 100;
  return `${sign}${whole}.${String(cents).padStart(2, "0")}`;
}

export function buildCounted(
  cup: string,
  usd: string
): { counted: Partial<Record<CurrencyCode, number>>; error: string | null } {
  const cupMinor = parseMoneyToMinor(cup);
  const usdMinor = parseMoneyToMinor(usd);

  return { counted: { CUP: cupMinor, USD: usdMinor }, error: null };
}
