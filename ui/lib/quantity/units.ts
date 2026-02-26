export function toFactor(unitFactor: string | null | undefined): number | null {
  if (!unitFactor) return null;
  const n = Number(unitFactor.trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatQty(n: number): string {
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: isInt ? 0 : 2,
    maximumFractionDigits: isInt ? 0 : 2,
  }).format(n);
}

export function baseMinorToPricing(qtyBaseMinor: number, unitFactor: string | null | undefined): number | null {
  const f = toFactor(unitFactor);
  if (!f) return null;
  return qtyBaseMinor / f;
}