import type { Product, LineItemOptionSnapshot } from "../types";
import { usePosSaleStore } from "@/stores/posSale.store";

// clamp numérico sin truncar
function clampNumber(n: number, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function clampPriceMinor(n: unknown): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1_000_000_000, Math.trunc(x)));
}

export function useTicket() {
  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);

  const addLine = usePosSaleStore((s) => s.addLine);
  const updateLine = usePosSaleStore((s) => s.updateLine);
  const changeQty = usePosSaleStore((s) => s.changeQty);
  const removeLine = usePosSaleStore((s) => s.removeLine);
  const clear = usePosSaleStore((s) => s.clear);

  const addItem = (p: Product, qty: number, optionsSnapshot: LineItemOptionSnapshot[]) => {
    const variantId = String(p.variantId ?? "").trim();
    const productId = String(p.productId ?? "").trim();
    if (!variantId || !productId) return;

    const soldBy = p.soldBy;

    // ✅ NO truncar: si es UNIT -> mínimo 1 entero; si es medida -> mínimo 0.01 (o 0.1 si tú quieres)
    const safeQty =
      soldBy === "UNIT"
        ? Math.max(1, Math.trunc(clampNumber(qty, 1, 999_999)))
        : clampNumber(qty, 0.01, 999_999.99);

    addLine({
      productId,
      variantId,

      nameSnapshot: p.name,
      soldBy,
      unitLabelSnapshot: String(p.pricingUnit ?? ""),

      // ✅ decimal permitido
      qty: safeQty,

      pricePerUnitMinor: clampPriceMinor(p.pricePerUnitMinor),

      optionsSnapshot: (optionsSnapshot ?? []).map((o) => ({
        groupId: o.groupId,
        groupName: o.groupName,
        optionId: o.optionId,
        optionName: o.optionName,
        priceDeltaMinor: clampPriceMinor(o.priceDeltaMinor),
      })),

      skuSnapshot: null,
      // ✅ NO forzamos unitInput/qtyInput aquí; store lo infiere.
      // Si tu modal ya lo tiene, luego lo pasamos también.
    });
  };

  const updateItem = (lineId: string, qty: number, optionsSnapshot: LineItemOptionSnapshot[]) => {
    // ✅ idem: mantener decimales si measure
    const li = items.find((x) => x.id === lineId);
    const soldBy = li?.soldBy ?? "UNIT";

    const safeQty =
      soldBy === "UNIT"
        ? Math.max(0, Math.trunc(clampNumber(qty, 0, 999_999)))
        : clampNumber(qty, 0, 999_999.99);

    updateLine(lineId, {
      qty: safeQty,
      optionsSnapshot: (optionsSnapshot ?? []).map((o) => ({
        groupId: o.groupId,
        groupName: o.groupName,
        optionId: o.optionId,
        optionName: o.optionName,
        priceDeltaMinor: clampPriceMinor(o.priceDeltaMinor),
      })),
    });
  };

  return {
    items,
    totals,
    addItem,
    updateItem,
    changeQty,
    remove: removeLine,
    clear,
  };
}
