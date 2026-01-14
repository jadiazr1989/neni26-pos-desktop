import type { LineItemOptionSnapshot, Product } from "../types";
import { usePosSaleStore } from "@/stores/posSale.store";

export function useTicket() {
  const items = usePosSaleStore((s) => s.items);
  const totals = usePosSaleStore((s) => s.totals);

  const addLine = usePosSaleStore((s) => s.addLine);
  const updateLine = usePosSaleStore((s) => s.updateLine);
  const changeQty = usePosSaleStore((s) => s.changeQty);
  const removeLine = usePosSaleStore((s) => s.removeLine);
  const clear = usePosSaleStore((s) => s.clear);

  const addItem = (p: Product, qty: number, optionsSnapshot: LineItemOptionSnapshot[]) => {
    addLine({
      productId: p.id,
      nameSnapshot: p.name,
      soldBy: p.soldBy,
      unitLabelSnapshot: p.unit,
      qty,
      pricePerUnitSnapshot: p.pricePerUnit,
      optionsSnapshot,
      skuSnapshot: null,
    });
  };

  // ✅ NUEVO: editar un item existente (qty y/o options)
  const updateItem = (lineId: string, qty: number, optionsSnapshot: LineItemOptionSnapshot[]) => {
    updateLine(lineId, { qty, optionsSnapshot });
  };

  return {
    items,
    totals,
    addItem,
    updateItem, // ✅
    changeQty,
    remove: removeLine,
    clear,
  };
}
