// stores/posSale.helpers.ts
import { isApiHttpError } from "@/lib/api/envelope";

export type QtyScale = 0 | 2;

export type SoldBy = "UNIT" | "MEASURE";

export type ErrorInfo = {
  code: string;
  reason?: string;
  requestId?: string;
  message: string;
  details?: unknown;
};

export function getErrorInfo(e: unknown): ErrorInfo {
  if (isApiHttpError(e)) {
    return {
      code: e.code ?? "HTTP_ERROR",
      reason: e.reason,
      requestId: e.requestId,
      message: e.message || "Ocurrió un error.",
      details: e.details,
    };
  }
  if (e instanceof Error) return { code: "ERROR", message: e.message || "Ocurrió un error." };
  return { code: "ERROR", message: "Ocurrió un error." };
}

export function uuid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isInt(n: number): boolean {
  return Number.isFinite(n) && Math.trunc(n) === n;
}

export function clampInt(n: number, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

/** ===== Money ===== */
export function money(minor: number): string {
  const v = Number(minor ?? 0);
  const safe = Number.isFinite(v) ? v : 0;
  return (safe / 100).toFixed(2);
}

/** ===== Qty minor (sin floats) ===== */
export function qtyScaleFromSoldBy(soldBy: SoldBy): QtyScale {
  return soldBy === "UNIT" ? 0 : 2;
}

export function toQtyBaseMinor(qty: number, scale: QtyScale): number {
  const n = Number(qty);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 10 ** scale);
}

export function fromQtyBaseMinor(qtyBaseMinor: number, scale: QtyScale): number {
  return qtyBaseMinor / 10 ** scale;
}

export function clampQtyBaseMinor(qtyBaseMinor: number, min: number, max: number): number {
  const x = Number(qtyBaseMinor);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

export function maxQtyBaseMinorForScale(scale: QtyScale): number {
  return scale === 0 ? 999_999 : 99_999_999; // 999,999.99 (scale=2)
}

/**
 * Normaliza qty según soldBy:
 * - permite 0 (para eliminar línea)
 * - UNIT: qty entero
 * - MEASURE: qty con 2 decimales
 */
export function normalizeQty(soldBy: SoldBy, qty: number): { qtyBaseMinor: number; qtyScale: QtyScale; qty: number } {
  const scale = qtyScaleFromSoldBy(soldBy);
  const base = toQtyBaseMinor(qty, scale);
  const clampedBase = clampQtyBaseMinor(base, 0, maxQtyBaseMinorForScale(scale));

  const display = fromQtyBaseMinor(clampedBase, scale);
  const normalizedQty = scale === 0 ? Math.trunc(display) : Number(display.toFixed(scale));

  return { qtyBaseMinor: clampedBase, qtyScale: scale, qty: normalizedQty };
}

/** ===== Merge key ===== */
export function optionsSignature(options: Array<{ groupId: string; optionId: string }>): string {
  const sorted = [...options].sort((a, b) => (a.groupId + ":" + a.optionId).localeCompare(b.groupId + ":" + b.optionId));
  return sorted.map((o) => `${o.groupId}:${o.optionId}`).join("|");
}

export function makeMergeKey(li: {
  variantId: string;
  unitLabelSnapshot: string;
  pricePerUnitMinor: number;
  optionsSnapshot: Array<{ groupId: string; optionId: string }>;
}): string {
  return [li.variantId, li.unitLabelSnapshot, String(li.pricePerUnitMinor), optionsSignature(li.optionsSnapshot)].join("::");
}
