// src/modules/purchases/hooks/purchaseDetail.helpers.ts
import { isApiHttpError } from "@/lib/api/envelope";
import type { DraftLine } from "./purchaseDetail.types";
import type { PurchaseWithItemsDTO, SetPurchaseItemsInput } from "@/lib/modules/purchases/purchase.dto";
import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";
import { dtoToVariantMeta } from "./purchaseVariant.mappers";
import type { MoneyStr } from "@/lib/money/moneyStr";
import { sumMoney } from "@/lib/money/moneyStr";

/** ========= errors ========= */

export function errDesc(e: unknown): string {
  if (isApiHttpError(e)) return e.message ?? `${e.code}: ${e.reason}`;
  return e instanceof Error ? e.message : "Error desconocido";
}

export function friendlyReceiveError(e: unknown): string {
  if (!isApiHttpError(e)) return errDesc(e);

  if (e.reason === "TERMINAL_WAREHOUSE_MISMATCH") {
    const d = (e.cause ?? {}) as Record<string, unknown>;
    const purchaseWh = typeof d.purchaseWarehouseId === "string" ? d.purchaseWarehouseId : null;
    const terminalWh = typeof d.terminalWarehouseId === "string" ? d.terminalWarehouseId : null;

    if (purchaseWh && terminalWh) {
      return [
        "No se pudo recibir porque el almacén del terminal activo no coincide con el almacén de la compra.",
        "",
        `• Almacén de la compra: ${purchaseWh}`,
        `• Almacén del terminal: ${terminalWh}`,
        "",
        "Solución: cambia el terminal/almacén activo al mismo de la compra y vuelve a intentar.",
      ].join("\n");
    }

    return [
      "No se pudo recibir porque el almacén del terminal activo no coincide con el almacén de la compra.",
      "",
      "Solución: cambia el terminal/almacén activo al mismo de la compra y vuelve a intentar.",
    ].join("\n");
  }

  return e.message ?? `${e.code}: ${e.reason}`;
}

/** ========= normalization ========= */

function normalizeUnit(u: unknown): SellUnit {
  const s = String(u ?? "").trim().toUpperCase();
  const allowed: SellUnit[] = ["UNIT", "G", "KG", "LB", "ML", "L"];
  return allowed.includes(s as SellUnit) ? (s as SellUnit) : "UNIT";
}

function normalizeQtyInput(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "";
  return s.replace(",", ".");
}

export function normalizeId(v: string): string {
  return String(v ?? "").trim();
}

/** ========= MoneyStr helpers ========= */

export function moneyStrToMinorSafe(v: MoneyStr | null | undefined): number {
  if (v == null) return 0;
  const s = String(v).trim();
  if (!s) return 0;

  try {
    const bi = BigInt(s);
    const n = Number(bi);
    return Number.isFinite(n) ? n : 0;
  } catch {
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
}

/** ========= mapping ========= */

export function rehydrateLinesFromPrev(prev: DraftLine[], next: DraftLine[]): DraftLine[] {
  const map = new Map<string, DraftLine>();
  for (const l of prev) map.set(normalizeId(l.productVariantId), l);

  return next.map((l) => {
    const old = map.get(normalizeId(l.productVariantId));
    const variant = l.variant ?? old?.variant ?? null; // ✅ conserva local si backend no manda
    return { ...l, variant };
  });
}

export function itemsToDraftLinesRehydrated(p: PurchaseWithItemsDTO, prev: DraftLine[]): DraftLine[] {
  const next = itemsToDraftLines(p);
  return rehydrateLinesFromPrev(prev, next);
}

export function itemsToDraftLines(p: PurchaseWithItemsDTO): DraftLine[] {
  return (p.items ?? []).map((it) => ({
    productVariantId: it.productVariantId,

    qtyInput: normalizeQtyInput(it.qtyInput ?? "0") || "0",
    unitInput: normalizeUnit(it.unitInput),
    qtyBaseMinor: Number(it.qtyBaseMinor ?? 0),

    qtyDisplay: it.qtyDisplay ?? null,
    displayUnit: it.displayUnit ?? normalizeUnit(it.unitInput),

    // ✅ MoneyStr snapshot (backend)
    lineTotalBaseMinor: (it.lineTotalBaseMinor ?? "0") as MoneyStr,

    unitCostBaseMinor: Number(it.unitCostBaseMinor ?? 0),
    unitPriceBaseMinor: it.unitPriceBaseMinor == null ? null : Number(it.unitPriceBaseMinor),

    variant: it.variant ? dtoToVariantMeta(it.variant) : null,
  }));
}

/** ========= totals ========= */

export function purchaseItemsCount(p: PurchaseWithItemsDTO | null): number {
  return p?.items?.length ?? 0;
}

/**
 * BigInt-safe parse decimal qtyInput ("23.4", "1", "1.00") => {int, scale}
 * scale: 0 | 2 (para purchases UI)
 */
function parseDecimalToIntParts(raw: string): { int: bigint; scale: 0 | 2 } {
  const s0 = String(raw ?? "").trim().replace(",", ".");
  if (!s0) return { int: 0n, scale: 0 };

  const neg = s0.startsWith("-");
  const s = neg ? s0.slice(1) : s0;

  const [a, bRaw = ""] = s.split(".");
  const ai = a.replace(/[^\d]/g, "");
  const bi = bRaw.replace(/[^\d]/g, "");

  if (bi.length === 0) {
    const base = BigInt(ai || "0");
    return { int: neg ? -base : base, scale: 0 };
  }

  const frac2 = (bi + "00").slice(0, 2); // pad/truncate 2
  const n = BigInt(ai || "0") * 100n + BigInt(frac2 || "0");
  return { int: neg ? -n : n, scale: 2 };
}

function toSafeNumber(v: bigint): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** round half-up: (x/d) sin floats, x>=0 */
function divRoundHalfUp(x: bigint, d: bigint): bigint {
  if (d === 0n) return 0n;
  return (x + d / 2n) / d;
}

/**
 * ✅ lineTotalMinor (preview local):
 * - unitCostBaseMinor = minor por 1 unitInput
 * - qtyInput = decimal exacto (string)
 * - totalMinor = round_half_up(cost * qty)
 *
 * Esto evita los bugs típicos con floats.
 */
export function lineTotalMinor(l: DraftLine): number {
  const costMinor = BigInt(Math.max(0, Math.trunc(Number(l.unitCostBaseMinor ?? 0) || 0)));

  const qtyStr = String(l.qtyInput ?? "").trim();
  const { int: qtyInt, scale } = parseDecimalToIntParts(qtyStr);

  // purchases qty no debería ser negativa
  const q = qtyInt > 0n ? qtyInt : 0n;

  const denom = scale === 0 ? 1n : 100n;
  const numerator = costMinor * q;

  const total = divRoundHalfUp(numerator, denom);
  return toSafeNumber(total);
}

/**
 * Total por línea para UI:
 * - si backend trae lineTotalBaseMinor → úsalo
 * - si no, usa preview local (lineTotalMinor) SIEMPRE que qty/cost sean válidos
 * - si no, null (UI puede mostrar "—")
 */
export function lineTotalBaseMinorForUi(l: DraftLine): MoneyStr | null {
  if (l.lineTotalBaseMinor != null) return l.lineTotalBaseMinor;

  // validaciones mínimas para no inventar números
  const cost = Number(l.unitCostBaseMinor ?? 0);
  if (!Number.isFinite(cost) || cost < 0) return null;

  const qtyRaw = String(l.qtyInput ?? "").trim().replace(",", ".");
  if (!qtyRaw) return null;
  const qn = Number(qtyRaw);
  if (!Number.isFinite(qn) || qn <= 0) return null;

  const n = lineTotalMinor(l);
  if (!Number.isFinite(n) || n < 0) return null;

  return String(Math.trunc(n)) as MoneyStr;
}

/**
 * ✅ ÚNICO draftTotals:
 * - suma lineTotalBaseMinorForUi (snapshot si existe; si no, preview local)
 * - si una línea no se puede calcular, aporta "0"
 */
export function draftTotals(lines: DraftLine[]) {
  const items = lines.length;

  const subtotalBaseMinor = sumMoney(lines.map((l) => lineTotalBaseMinorForUi(l) ?? ("0" as MoneyStr)));

  return { items, subtotalBaseMinor, totalBaseMinor: subtotalBaseMinor };
}

/** ========= input building ========= */

function toInt(n: unknown): number {
  const v = typeof n === "string" ? Number(n) : (n as number);
  if (!Number.isFinite(v)) return Number.NaN;
  return Math.trunc(v);
}

export function draftLinesToSetItemsInput(lines: DraftLine[]): SetPurchaseItemsInput {
  const items = lines
    .map((l) => {
      const productVariantId = String(l.productVariantId ?? "").trim();

      const qtyInput = normalizeQtyInput(l.qtyInput);
      const unitInput = normalizeUnit(l.unitInput);

      const unitCostBaseMinor = toInt(l.unitCostBaseMinor);

      const rawUp = l.unitPriceBaseMinor;
      const unitPriceBaseMinor = rawUp === undefined ? undefined : rawUp === null ? null : toInt(rawUp);

      return { productVariantId, qtyInput, unitInput, unitCostBaseMinor, unitPriceBaseMinor };
    })
    .filter((x) => x.productVariantId !== "" && x.qtyInput !== "")
    .map((x) => {
      const base = {
        productVariantId: x.productVariantId,
        qtyInput: x.qtyInput,
        unitInput: x.unitInput,
        unitCostBaseMinor: x.unitCostBaseMinor,
      };
      return x.unitPriceBaseMinor === undefined ? base : { ...base, unitPriceBaseMinor: x.unitPriceBaseMinor };
    });

  return { items };
}

/** ========= merge ========= */

function parseQtyInputToNumber(raw: string): number | null {
  const t = raw.trim().replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function mergeByVariantId(lines: DraftLine[]): DraftLine[] {
  const m = new Map<string, DraftLine>();

  for (const l of lines) {
    const id = normalizeId(l.productVariantId);
    if (!id) continue;

    const cost = toInt(l.unitCostBaseMinor);
    const price = l.unitPriceBaseMinor == null ? null : toInt(l.unitPriceBaseMinor);

    const prev = m.get(id);
    if (!prev) {
      m.set(id, {
        productVariantId: id,
        qtyInput: normalizeQtyInput(l.qtyInput) || "0",
        unitInput: normalizeUnit(l.unitInput),
        qtyBaseMinor: Number.isFinite(Number(l.qtyBaseMinor)) ? Number(l.qtyBaseMinor) : 0,
        unitCostBaseMinor: Number.isFinite(cost) ? cost : 0,
        unitPriceBaseMinor: price == null ? null : Number.isFinite(price) ? price : null,
        variant: l.variant ?? null,

        qtyDisplay: l.qtyDisplay ?? null,
        displayUnit: l.displayUnit ?? null,
        lineTotalBaseMinor: null, // ✅ invalidamos snapshot al merge
      });
      continue;
    }

    const nextQtyBaseMinor =
      Number(prev.qtyBaseMinor ?? 0) + (Number.isFinite(Number(l.qtyBaseMinor)) ? Number(l.qtyBaseMinor) : 0);

    const nextUnitInput = prev.unitInput; // ✅ no mezclar

    const a = parseQtyInputToNumber(prev.qtyInput);
    const b = parseQtyInputToNumber(String(l.qtyInput ?? ""));
    const nextQtyInput = a != null && b != null ? String(a + b) : prev.qtyInput;

    const prevCost = toInt(prev.unitCostBaseMinor);
    const nextCost = Number.isFinite(cost) && cost > 0 ? cost : Number.isFinite(prevCost) ? prevCost : 0;

    const nextPrice =
      l.unitPriceBaseMinor === null
        ? null
        : l.unitPriceBaseMinor !== undefined
          ? Number.isFinite(price)
            ? price
            : null
          : prev.unitPriceBaseMinor;

    const nextVariant = prev.variant ?? l.variant ?? null;

    m.set(id, {
      productVariantId: id,
      qtyInput: nextQtyInput,
      unitInput: nextUnitInput,
      qtyBaseMinor: nextQtyBaseMinor,
      unitCostBaseMinor: nextCost,
      unitPriceBaseMinor: nextPrice,
      variant: nextVariant,

      qtyDisplay: null,
      displayUnit: null,
      lineTotalBaseMinor: null,
    });
  }

  return Array.from(m.values());
}