// stores/posSale.store.ts
import { create } from "zustand";

export type SaleOptionSnapshot = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
};

export type SaleLine = {
  id: string; // lineId (uuid)
  productId: string;

  nameSnapshot: string;

  soldBy: "UNIT" | "MEASURE";
  unitLabelSnapshot: string; // "lb", "unit"
  qty: number;

  pricePerUnitSnapshot: number; // base price
  optionsSnapshot: SaleOptionSnapshot[]; // per unit

  // opcional: sku/code/etc
  skuSnapshot?: string | null;
};

export type TicketTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};



function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function calcLineTotal(li: SaleLine): number {
  const optionsDelta = li.optionsSnapshot.reduce((acc, o) => acc + (o.priceDelta ?? 0), 0);
  return (li.pricePerUnitSnapshot + optionsDelta) * li.qty;
}

function calcTotals(items: SaleLine[]): TicketTotals {
  const subtotal = items.reduce((acc, li) => acc + calcLineTotal(li), 0);
  const tax = 0;
  const discount = 0;
  const total = subtotal + tax - discount;
  return {
    subtotal: round2(subtotal),
    tax: round2(tax),
    discount: round2(discount),
    total: round2(total),
  };
}
function optionsSignature(options: Array<{ groupId: string; optionId: string }>): string {
  // orden estable para que A+B == B+A
  const sorted = [...options].sort((a, b) =>
    (a.groupId + ":" + a.optionId).localeCompare(b.groupId + ":" + b.optionId)
  );
  return sorted.map((o) => `${o.groupId}:${o.optionId}`).join("|");
}

function makeMergeKey(li: {
  productId: string;
  unitLabelSnapshot: string;
  pricePerUnitSnapshot: number;
  optionsSnapshot: Array<{ groupId: string; optionId: string }>;
}): string {
  return [
    li.productId,
    li.unitLabelSnapshot,
    li.pricePerUnitSnapshot.toFixed(6),
    optionsSignature(li.optionsSnapshot),
  ].join("::");
}

function mergeAll(lines: SaleLine[]): SaleLine[] {
  const map = new Map<string, SaleLine>();

  for (const li of lines) {
    const key = makeMergeKey(li);
    const prev = map.get(key);

    if (!prev) {
      map.set(key, li);
    } else {
      map.set(key, { ...prev, qty: Number((prev.qty + li.qty).toFixed(3)) });
    }
  }

  return Array.from(map.values());
}


type CheckoutArgs = {
  terminalId: string;
  cashSessionId: string;
};

type PosSaleState = {
  items: SaleLine[];
  totals: TicketTotals;
  status: "idle" | "checking_out";

  addLine: (line: Omit<SaleLine, "id">) => void;
  changeQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;

  canPay: () => boolean;
  // ✅ añade en el type PosSaleState:
  updateLine: (lineId: string, patch: { qty?: number; optionsSnapshot?: SaleOptionSnapshot[] }) => void;

  checkout: (args: CheckoutArgs) => Promise<void>;
};

export const usePosSaleStore = create<PosSaleState>((set, get) => ({
  items: [],
  totals: { subtotal: 0, tax: 0, discount: 0, total: 0 },
  status: "idle",

  addLine: (input) =>
    set((s) => {
      const key = makeMergeKey(input);

      const idx = s.items.findIndex((x) => makeMergeKey(x) === key);

      let items: SaleLine[];

      if (idx >= 0) {
        // ✅ merge: sumar qty
        items = s.items.map((x, i) =>
          i === idx ? { ...x, qty: Number((x.qty + input.qty).toFixed(3)) } : x
        );
      } else {
        // ✅ nueva línea
        items = [
          ...s.items,
          {
            id: crypto.randomUUID(),
            productId: input.productId,
            nameSnapshot: input.nameSnapshot,
            soldBy: input.soldBy,
            unitLabelSnapshot: input.unitLabelSnapshot,
            qty: input.qty,
            pricePerUnitSnapshot: input.pricePerUnitSnapshot,
            optionsSnapshot: input.optionsSnapshot,
            skuSnapshot: input.skuSnapshot ?? null,
          },
        ];
      }

      return { items, totals: calcTotals(items) };
    }),


  changeQty: (lineId, qty) =>
    set((s) => {
      const items = s.items
        .map((li) => (li.id === lineId ? { ...li, qty } : li))
        .filter((li) => li.qty > 0);
      return { items, totals: calcTotals(items) };
    }),

  removeLine: (lineId) =>
    set((s) => {
      const items = s.items.filter((li) => li.id !== lineId);
      return { items, totals: calcTotals(items) };
    }),

  clear: () => set({ items: [], totals: { subtotal: 0, tax: 0, discount: 0, total: 0 }, status: "idle" }),

  canPay: () => get().items.length > 0 && get().status !== "checking_out",

  // ✅ implementación dentro de create():
  updateLine: (lineId, patch) =>
    set((s) => {
      const updated = s.items
        .map((li) => (li.id === lineId ? { ...li, ...patch } : li))
        .filter((li) => li.qty > 0);

      const items = mergeAll(updated); // ✅ evita duplicados tras editar
      return { items, totals: calcTotals(items) };
    }),



  checkout: async ({ terminalId, cashSessionId }) => {
    const { items } = get();
    if (items.length === 0) return;

    set({ status: "checking_out" });
    try {
      /**
       * TODO: integra tu API aquí.
       * EJEMPLO:
       * await createSaleOrThrow({ terminalId, cashSessionId, items })
       * await paySaleOrThrow(...)
       */

      // Por ahora: simular éxito rápido (quita esto cuando conectes API)
      await new Promise((r) => setTimeout(r, 250));

      // después de pagar -> limpiar ticket
      set({ items: [], totals: { subtotal: 0, tax: 0, discount: 0, total: 0 }, status: "idle" });
    } catch (e) {
      set({ status: "idle" });
      throw e;
    }
  },
}));
