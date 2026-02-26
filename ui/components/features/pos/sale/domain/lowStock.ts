// domain/lowStock.ts
import type { StockPolicy } from "./stock.policy";

type StockUi =
  | { level: "OUT"; label: "Agotado"; className: string; ariaLabel: string }
  | { level: "CRITICAL"; label: string; className: string; ariaLabel: string }
  | { level: "LOW"; label: string; className: string; ariaLabel: string }
  | { level: "OK"; label: ""; className: ""; ariaLabel: string };

export function resolveStockUi(qty: number, policy: StockPolicy): StockUi {
  const q = Number.isFinite(qty) ? Math.max(0, Math.trunc(qty)) : 0;

  if (q <= 0) {
    return {
      level: "OUT",
      label: "Agotado",
      className: "bg-zinc-800 text-white",
      ariaLabel: "Agotado",
    };
  }

  if (q < policy.criticalBelow) {
    const label = policy.showExactQtyCritical ? String(q) : "Bajo";
    return {
      level: "CRITICAL",
      label,
      className: "bg-red-600 text-white",
      ariaLabel: `Stock crítico: ${q}`,
    };
  }

  if (q < policy.lowBelow) {
    const label = policy.showExactQtyLow ? String(q) : "Bajo";
    return {
      level: "LOW",
      label,
      className: "bg-amber-400 text-black font-semibold",
      ariaLabel: `Stock bajo: ${q}`,
    };
  }

  // OK = cero ruido (no badge)
  return {
    level: "OK",
    label: "",
    className: "",
    ariaLabel: `En stock (${q})`,
  };
}
