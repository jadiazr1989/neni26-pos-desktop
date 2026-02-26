// stores/posSale.store.utils.ts
import type { SaleDTO, MoneyStr, ValidateInsufficientItem, ValidateSaleResult } from "@/lib/modules/sales/sale.dto";
import type { QtyScale, SoldBy } from "./posSale.helpers";
import {
  clampQtyBaseMinor,
  fromQtyBaseMinor,
  maxQtyBaseMinorForScale,
  money,
  makeMergeKey,
} from "./posSale.helpers";

import type { SaleLine, TicketTotals, SaleItemsPayload, ServerSnapshot } from "./posSale.store.types";

// -----------------------------
// Guards: validateStock result
// -----------------------------
export function isValidateInsufficientItem(v: unknown): v is ValidateInsufficientItem {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r["variantId"] === "string" &&
    typeof r["label"] === "string" &&
    typeof r["requested"] === "number" &&
    typeof r["available"] === "number" &&
    (r["action"] === "REMOVE" || r["action"] === "CLAMP") &&
    typeof r["newQty"] === "number" &&
    typeof r["unit"] === "string" &&
    typeof r["requestedDisplay"] === "string" &&
    typeof r["availableDisplay"] === "string" &&
    typeof r["newQtyDisplay"] === "string"
  );
}

export function isValidateSaleInsufficient(
  v: unknown
): v is Extract<ValidateSaleResult, { status: "INSUFFICIENT_STOCK" }> {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r["status"] !== "INSUFFICIENT_STOCK") return false;
  if (typeof r["saleId"] !== "string") return false;
  const insufficient = r["insufficient"];
  if (!Array.isArray(insufficient)) return false;
  return insufficient.every(isValidateInsufficientItem);
}

// -----------------------------
// Money helpers (BigInt-safe)
// -----------------------------
function toSafeNumber(v: bigint): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parse decimal string qtyInput (e.g. "23.4", "1", "1.00") into:
 *   numerator / 10^scale
 * without floats.
 */
function parseDecimalToIntParts(raw: string): { int: bigint; scale: 0 | 2 } {
  const s0 = String(raw ?? "").trim().replace(",", ".");
  if (!s0) return { int: 0n, scale: 0 };

  // keep only leading sign + digits + optional dot
  const neg = s0.startsWith("-");
  const s = neg ? s0.slice(1) : s0;

  const [a, bRaw = ""] = s.split(".");
  const ai = a.replace(/[^\d]/g, "");
  const bi = bRaw.replace(/[^\d]/g, "");

  // We support QtyScale = 0 | 2 in UI.
  // If decimals exist => scale=2 and we pad/truncate to 2 digits.
  if (bi.length === 0) {
    const base = BigInt(ai || "0");
    return { int: neg ? -base : base, scale: 0 };
  }

  const frac2 = (bi + "00").slice(0, 2); // pad / truncate to 2
  const n = BigInt(ai || "0") * 100n + BigInt(frac2 || "0");
  return { int: neg ? -n : n, scale: 2 };
}

/**
 * Round half-up: (x / d) rounded to nearest integer, without floats.
 * Assumes x>=0.
 */
function divRoundHalfUp(x: bigint, d: bigint): bigint {
  if (d === 0n) return 0n;
  return (x + d / 2n) / d;
}

/**
 * ✅ Correct checkout math:
 * - pricePerUnitMinor is "minor per 1 unitInput" (e.g. CUP cents per LB, per UNIT, etc.)
 * - qtyInput is exact decimal (string) entered by user (or derived)
 * - totalMinor = round_half_up( unitMinor * qty )
 *
 * Using qtyInput avoids losing 23.4 -> 23, etc.
 */
export function calcLineTotalMinor(li: SaleLine): number {
  const optionsDeltaMinor = li.optionsSnapshot.reduce((acc, o) => acc + (o.priceDeltaMinor ?? 0), 0);
  const unitMinor = BigInt((li.pricePerUnitMinor ?? 0) + optionsDeltaMinor);

  // qtyInput is source of truth. If missing, fallback to qty (number).
  const qtyStr = String(li.qtyInput ?? "").trim() || String(li.qty ?? 0);

  const { int: qtyInt, scale } = parseDecimalToIntParts(qtyStr);

  // POS quantities should be >=0; clamp negatives to 0
  const q = qtyInt > 0n ? qtyInt : 0n;

  // qInt means:
  // - scale 0: q is integer units
  // - scale 2: q is "hundredths" of unitInput
  const denom = scale === 0 ? 1n : 100n;

  const numerator = unitMinor * q; // minor * scaledQtyInt
  const totalMinor = divRoundHalfUp(numerator, denom);

  return toSafeNumber(totalMinor);
}

export function calcTotals(items: SaleLine[]): TicketTotals {
  let subtotal = 0n;

  for (const li of items) {
    subtotal += BigInt(calcLineTotalMinor(li));
  }

  const tax = 0n;
  const discount = 0n;
  const total = subtotal + tax - discount;

  return {
    subtotalMinor: toSafeNumber(subtotal),
    taxMinor: toSafeNumber(tax),
    discountMinor: toSafeNumber(discount),
    totalMinor: toSafeNumber(total),
  };
}

// -----------------------------
// Merge / payload
// -----------------------------
export function mergeAll(lines: SaleLine[]): SaleLine[] {
  const map = new Map<string, SaleLine>();

  for (const li of lines) {
    const key = makeMergeKey(li);
    const prev = map.get(key);

    if (!prev) {
      map.set(key, li);
      continue;
    }

    const sumBase = prev.qtyBaseMinor + li.qtyBaseMinor;
    const max = maxQtyBaseMinorForScale(prev.qtyScale);
    const clampedBase = clampQtyBaseMinor(sumBase, 0, max);

    const display = fromQtyBaseMinor(clampedBase, prev.qtyScale);
    const qty = prev.qtyScale === 0 ? Math.trunc(display) : Number(display.toFixed(prev.qtyScale));

    map.set(key, {
      ...prev,
      qtyBaseMinor: clampedBase,
      qty,
      qtyInput: formatQtyInput(qty, prev.qtyScale),
    });
  }

  return Array.from(map.values());
}

export function toSaleItemsPayload(lines: SaleLine[]): SaleItemsPayload {
  return {
    items: lines.map((li) => ({
      variantId: li.variantId,
      // ✅ qtyInput is the truth for money + backend setItems
      qtyInput: String(li.qtyInput ?? formatQtyInput(li.qty ?? 0, li.qtyScale)),
      unitInput: li.unitInput,
      // ✅ unitPriceBaseMinor = price per 1 unitInput (already in base minor)
      unitPriceBaseMinor: li.pricePerUnitMinor,
    })),
  };
}

// -----------------------------
// Formatting / snapshots
// -----------------------------
export function formatMoneyMinorCUP(minor: number): string {
  const x = Number(minor ?? 0);
  const v = Number.isFinite(x) ? x : 0;
  return `${money(v)} CUP`;
}

export function emptyServer(): ServerSnapshot {
  return {
    status: null,
    subtotalBaseMinor: null,
    taxBaseMinor: null,
    discountBaseMinor: null,
    totalBaseMinor: null,
    paidBaseMinor: null,
  };
}

export function applySaleSnapshotToServer(
  sale: Pick<
    SaleDTO,
    "status" | "subtotalBaseMinor" | "taxBaseMinor" | "discountBaseMinor" | "totalBaseMinor" | "paidBaseMinor"
  >
): ServerSnapshot {
  return {
    status: sale.status,
    subtotalBaseMinor: sale.subtotalBaseMinor,
    taxBaseMinor: sale.taxBaseMinor,
    discountBaseMinor: sale.discountBaseMinor,
    totalBaseMinor: sale.totalBaseMinor,
    paidBaseMinor: sale.paidBaseMinor,
  };
}

// -----------------------------
// Qty display helpers
// -----------------------------
export function parseQtyDisplayToNumber(qtyDisplay: string): number {
  const s = String(qtyDisplay ?? "").trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function inferScaleFromQtyDisplay(qtyDisplay: string): QtyScale {
  const s = String(qtyDisplay ?? "").trim();
  const dot = s.indexOf(".");
  if (dot < 0) return 0;
  const decimals = s.slice(dot + 1).replace(/[^\d]/g, "");
  return decimals.length > 0 ? 2 : 0;
}

export function formatQtyInput(qty: number, scale: QtyScale): string {
  const n = Number(qty);
  if (!Number.isFinite(n)) return "0";
  if (scale === 0) return String(Math.trunc(n));
  const fixed = n.toFixed(scale);
  return fixed.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/g, ".0");
}

export function normalizeUnitLabel(label: string): string {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .replace(/\./g, "");
}

export function inferUnitInputFromLabel(soldBy: SoldBy, unitLabelSnapshot: string) {
  if (soldBy === "UNIT") return "UNIT";
  const u = normalizeUnitLabel(unitLabelSnapshot);
  if (u === "lb" || u === "lbs" || u === "libra" || u === "libras") return "LB";
  if (u === "kg" || u === "kilo" || u === "kilos") return "KG";
  if (u === "g" || u === "gr" || u === "gramo" || u === "gramos") return "G";
  if (u === "l" || u === "lt" || u === "litro" || u === "litros") return "L";
  if (u === "ml" || u === "mililitro" || u === "mililitros") return "ML";
  return "UNIT";
}

// -----------------------------
// MoneyStr helpers (BigInt-safe)
// -----------------------------
export function moneyStrToIntSafe(v: MoneyStr | null | undefined): number {
  const n = Number(String(v ?? "0"));
  return Number.isFinite(n) ? n : 0;
}

export function bigIntMoneyToLabelCUP(minorStr: MoneyStr): string {
  try {
    const v = BigInt(minorStr);
    const major = (v / 100n).toString();
    const cents = (v % 100n).toString().padStart(2, "0");
    return `${major}.${cents} CUP`;
  } catch {
    return formatMoneyMinorCUP(moneyStrToIntSafe(minorStr));
  }
}