// src/lib/quantity/sellUnit.ts
export type Unit = "UNIT" | "G" | "ML"; // baseUnit (inventario)
export type SellUnit = "UNIT" | "G" | "KG" | "LB" | "ML" | "L"; // pricingUnit (humano)

const LB_TO_G = 453.59237;

export function isMeasureUnit(u: SellUnit): boolean {
  return u !== "UNIT";
}

/**
 * Convierte qtyInput (humano, en pricingUnit) -> qtyBaseMinor (int, en baseUnit)
 * baseUnit solo puede ser UNIT/G/ML (tu regla).
 */
export function toQtyBaseMinor(params: {
  qtyInput: number;
  pricingUnit: SellUnit;
  baseUnit: Unit;
}): number {
  const qty = Number(params.qtyInput);
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("QTY_INVALID");

  const { pricingUnit, baseUnit } = params;

  if (baseUnit === "UNIT") {
    if (pricingUnit !== "UNIT") throw new Error("UNIT_BASE_REQUIRES_UNIT_PRICING");
    if (Math.trunc(qty) !== qty) throw new Error("QTY_UNIT_MUST_BE_INTEGER");
    return Math.trunc(qty);
  }

  if (baseUnit === "G") {
    if (pricingUnit === "G") return Math.round(qty);
    if (pricingUnit === "KG") return Math.round(qty * 1000);
    if (pricingUnit === "LB") return Math.round(qty * LB_TO_G);
    throw new Error("G_BASE_INVALID_PRICING_UNIT");
  }

  // baseUnit === "ML"
  if (pricingUnit === "ML") return Math.round(qty);
  if (pricingUnit === "L") return Math.round(qty * 1000);
  throw new Error("ML_BASE_INVALID_PRICING_UNIT");
}

/**
 * Convierte baseMinor -> qty visible en pricingUnit (para mostrar stock disponible)
 */
export function fromBaseMinorToPricingQty(params: {
  baseMinor: number;
  pricingUnit: SellUnit;
  baseUnit: Unit;
}): number {
  const baseMinor = Math.max(0, Number(params.baseMinor) || 0);

  const { pricingUnit, baseUnit } = params;

  if (baseUnit === "UNIT") {
    if (pricingUnit !== "UNIT") throw new Error("UNIT_BASE_REQUIRES_UNIT_PRICING");
    return baseMinor;
  }

  if (baseUnit === "G") {
    if (pricingUnit === "G") return baseMinor;
    if (pricingUnit === "KG") return baseMinor / 1000;
    if (pricingUnit === "LB") return baseMinor / LB_TO_G;
    throw new Error("G_BASE_INVALID_PRICING_UNIT");
  }

  // baseUnit === "ML"
  if (pricingUnit === "ML") return baseMinor;
  if (pricingUnit === "L") return baseMinor / 1000;
  throw new Error("ML_BASE_INVALID_PRICING_UNIT");
}

// src/lib/modules/inventory/utils/stockDisplay.ts

function toFactor(unitFactor: string | null | undefined): number | null {
  if (!unitFactor) return null;
  const n = Number(unitFactor.trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function formatQty(n: number): string {
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

export function formatStockDisplay(params: {
  qtyBaseMinor: number;
  baseUnit: string;
  pricingUnit: SellUnit;
  unitFactor: string | null;
}): string {
  const pricing = baseMinorToPricing(params.qtyBaseMinor, params.unitFactor);
  if (pricing != null) return `${formatQty(pricing)} ${params.pricingUnit}`;
  return `${params.qtyBaseMinor} ${params.baseUnit}`;
}
