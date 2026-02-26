import type { MoneyStr } from "@/lib/money/moneyStr";
import { moneyStrToLabelCUP } from "@/lib/money/moneyStr";

// Para ahora: baseCurrency=CUP en Store, así que render como CUP.
// Si luego haces baseCurrency dinámico, aquí lo cambias.
export function formatBaseMinorCUP(v: MoneyStr | null | undefined): string {
  return moneyStrToLabelCUP(v ?? "0");
}