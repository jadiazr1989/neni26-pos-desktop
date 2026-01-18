// src/modules/catalog/products/ui/variants/variant.parsers.ts
export function normalizeBarcode(s: string): string | null {
  const t = s.trim();
  if (t === "") return null;
  if (!/^\d+$/.test(t)) return null;
  return t;
}

export function parseNonNegInt(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  if (!/^\d+$/.test(t)) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}
