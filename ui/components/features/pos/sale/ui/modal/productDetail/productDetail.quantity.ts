// ui/components/features/pos/sale/ui/modal/productDetail.quantity.ts
import type { SoldBy } from "../../../types";
import type { SellUnit, Unit } from "@/lib/quantity/sellUnit";

export type QtyScale = 0 | 2;

export function clampInt(n: number, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.trunc(x)));
}

export function money(minor: number): string {
  const v = Number(minor ?? 0);
  const safe = Number.isFinite(v) ? v : 0;
  return (safe / 100).toFixed(2);
}

/**
 * Escala basada en unidad HUMANA (pricingUnit) y soldBy
 * - UNIT => 0
 * - MEASURE:
 *   - G/ML => 0
 *   - KG/LB/L => 2
 *
 * baseUnit no cambia la escala, solo el “inventario”.
 */
export function resolveScaleFromUnits(baseUnit: Unit, pricingUnit: SellUnit, soldBy: SoldBy): QtyScale {
  void baseUnit; // se queda por claridad; no lo usamos para decidir escala

  if (soldBy === "UNIT") return 0;

  if (pricingUnit === "G" || pricingUnit === "ML") return 0;
  return 2;
}

export function stepMinor(scale: QtyScale): number {
  return scale === 0 ? 1 : 1; // 0.01
}

export function toQtyMinor(qty: number, scale: QtyScale): number {
  const f = Number(qty);
  if (!Number.isFinite(f)) return 0;
  const m = Math.round(f * 10 ** scale);
  return Math.max(0, m);
}

export function fromQtyMinor(qtyMinor: number, scale: QtyScale): number {
  return qtyMinor / 10 ** scale;
}

export function formatQty(qtyMinor: number, scale: QtyScale): string {
  const v = fromQtyMinor(qtyMinor, scale);
  return scale === 0 ? String(Math.trunc(v)) : v.toFixed(scale);
}

export function minQtyMinor(scale: QtyScale): number {
  return scale === 0 ? 1 : stepMinor(scale);
}

export function maxQtyMinor(scale: QtyScale): number {
  return scale === 0 ? 999_999 : 99_999_999;
}

export function normalizeQtyForConfirm(scale: QtyScale, qtyMinor: number): number {
  const q = fromQtyMinor(qtyMinor, scale);
  if (scale === 0) return Math.max(1, Math.trunc(q));
  return Number(q.toFixed(scale));
}

export function helperText(scale: QtyScale): string {
  const step = stepMinor(scale);
  return scale === 0 ? "Solo enteros" : `Decimales (${scale}) · step ${(step / 10 ** scale).toFixed(scale)}`;
}
