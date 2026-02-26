// src/lib/money/formatCUP.ts
import type { MoneyStr } from "@/lib/money/moneyStr";
import { bi } from "@/lib/money/moneyStr";

export function moneyStrToLabelCUP_NoGrouping(minorStr: MoneyStr | null | undefined): string {
  const v = bi(minorStr);
  const neg = v < 0n;
  const x = neg ? -v : v;

  const major = (x / 100n).toString();
  const cents = (x % 100n).toString().padStart(2, "0");

  // sin separador de miles, estilo simple
  return `${neg ? "-" : ""}${major}.${cents} CUP`;
}