import { isApiHttpError } from "@/lib/api/envelope";
import type { DraftLine } from "./purchaseDetail.types";
import type { PurchaseWithItemsDTO, SetPurchaseItemsInput } from "@/lib/modules/purchases/purchase.dto";

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



export function itemsToDraftLines(p: PurchaseWithItemsDTO): DraftLine[] {
  return (p.items ?? []).map((it) => ({
    productVariantId: it.productVariantId,
    quantity: it.quantity,
    unitCostBaseMinor: it.unitCostBaseMinor,
    unitPriceBaseMinor: it.unitPriceBaseMinor,

    // ✅ NO perder meta
    variant: it.variant
      ? {
          id: it.variant.id,
          sku: it.variant.sku ?? "—",
          barcode: it.variant.barcode ?? null,
          title: it.variant.title ?? null,
          imageUrl: it.variant.imageUrl ?? null,
          isActive: it.variant.isActive ?? true,
          productName: it.variant.product?.name ?? null,
        }
      : null,
  }));
}


function toInt(n: unknown): number {
  const v = typeof n === "string" ? Number(n) : (n as number);
  if (!Number.isFinite(v)) return NaN;
  return Math.trunc(v);
}

export function draftLinesToSetItemsInput(lines: DraftLine[]): SetPurchaseItemsInput {
  const items = lines
    .map((l) => {
      const productVariantId = String(l.productVariantId ?? "").trim();
      const quantity = toInt(l.quantity);
      const unitCostBaseMinor = toInt(l.unitCostBaseMinor);

      // unitPrice: undefined (omit), null (send null), number (send int)
      const rawUp = l.unitPriceBaseMinor;
      const unitPriceBaseMinor =
        rawUp === undefined ? undefined : rawUp === null ? null : toInt(rawUp);

      return { productVariantId, quantity, unitCostBaseMinor, unitPriceBaseMinor };
    })
    .filter((x) => x.productVariantId !== "")
    .map((x) => {
      const base = {
        productVariantId: x.productVariantId,
        quantity: x.quantity,
        unitCostBaseMinor: x.unitCostBaseMinor,
      };

      // ✅ omitimos undefined; mantenemos null explícito
      return x.unitPriceBaseMinor === undefined ? base : { ...base, unitPriceBaseMinor: x.unitPriceBaseMinor };
    });

  return { items };
}

export function normalizeId(v: string): string {
  return String(v ?? "").trim();
}

export function money(n: number): string {
  return new Intl.NumberFormat().format(n);
}

export function lineTotalMinor(l: DraftLine): number {
  const qty = Number.isFinite(l.quantity) ? l.quantity : 0;
  const cost = Number.isFinite(l.unitCostBaseMinor) ? l.unitCostBaseMinor : 0;
  return qty * cost;
}

export function purchaseItemsCount(p: PurchaseWithItemsDTO | null): number {
  return p?.items?.length ?? 0;
}

export function draftTotals(lines: DraftLine[]) {
  const items = lines.length;
  const subtotalMinor = lines.reduce(
    (acc, l) => acc + (Number(l.quantity ?? 0) * Number(l.unitCostBaseMinor ?? 0)),
    0
  );
  return { items, subtotalMinor, totalMinor: subtotalMinor };
}



function asInt(n: unknown): number {
  const v = typeof n === "string" ? Number(n) : (n as number);
  if (!Number.isFinite(v)) return NaN;
  return Math.trunc(v);
}

export function mergeByVariantId(lines: DraftLine[]): DraftLine[] {
  const m = new Map<string, DraftLine>();

  for (const l of lines) {
    const id = normalizeId(l.productVariantId);
    if (!id) continue;

    const qty = asInt(l.quantity);
    const cost = asInt(l.unitCostBaseMinor);
    const price = l.unitPriceBaseMinor == null ? null : asInt(l.unitPriceBaseMinor);

    const prev = m.get(id);
    if (!prev) {
      m.set(id, {
        productVariantId: id,
        quantity: Number.isFinite(qty) ? qty : 0,
        unitCostBaseMinor: Number.isFinite(cost) ? cost : 0,
        unitPriceBaseMinor: price == null ? null : (Number.isFinite(price) ? price : null),

        // ✅ conserva meta si existe
        variant: l.variant ?? null,
      });
      continue;
    }

    const nextQty = asInt(prev.quantity) + (Number.isFinite(qty) ? qty : 0);

    const prevCost = asInt(prev.unitCostBaseMinor);
    const nextCost = Number.isFinite(cost) && cost > 0 ? cost : (Number.isFinite(prevCost) ? prevCost : 0);

    const nextPrice =
      l.unitPriceBaseMinor === null ? null
      : l.unitPriceBaseMinor !== undefined ? (Number.isFinite(price) ? price : null)
      : prev.unitPriceBaseMinor;

    // ✅ meta: si prev no tiene, toma la nueva; si ya tiene, conserva
    const nextVariant = prev.variant ?? l.variant ?? null;

    m.set(id, {
      productVariantId: id,
      quantity: nextQty,
      unitCostBaseMinor: nextCost,
      unitPriceBaseMinor: nextPrice,
      variant: nextVariant,
    });
  }

  return Array.from(m.values());
}

