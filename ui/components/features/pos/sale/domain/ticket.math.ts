import type { LineItem } from "../types";

export function calcLineTotal(li: LineItem): number {
  const deltas = li.optionsSnapshot.reduce((a, o) => a + o.priceDelta, 0);
  return li.qty * (li.pricePerUnitSnapshot + deltas);
}

export function calcSubtotal(items: LineItem[]): number {
  return items.reduce((a, li) => a + calcLineTotal(li), 0);
}

export type TicketTotals = {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export function calcTotals(input: {
  items: LineItem[];
  tax?: number;
  discount?: number;
}): TicketTotals {
  const subtotal = calcSubtotal(input.items);
  const tax = input.tax ?? 0;
  const discount = input.discount ?? 0;
  const total = Math.max(0, subtotal + tax - discount);

  return { subtotal, tax, discount, total };
}

