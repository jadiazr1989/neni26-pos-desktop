// src/lib/quantity/limits.ts
export const INT32_MAX = 2147483647;
export const MAX_QTY_BASE = 100_000_000;

// abs baseMinor limit (backend): min(int32Max, businessMax)
export function baseAbsLimit(): number {
  return Math.min(INT32_MAX, MAX_QTY_BASE);
}

/**
 * Exact for HALF_UP rounding:
 * We need round_half_up(qty * factor) <= baseAbsLimit
 * => qty <= (baseAbsLimit + 0.5) / factor
 */
export function maxAbsQtyInputExactFromUnitFactor(unitFactor: string | null | undefined): number | null {
  if (!unitFactor) return null;
  const f = Number(String(unitFactor).trim());
  if (!Number.isFinite(f) || f <= 0) return null;

  return (baseAbsLimit() + 0.5) / f;
}

export function formatMaxQty(n: number, decimals = 3): string {
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: decimals }).format(n);
}