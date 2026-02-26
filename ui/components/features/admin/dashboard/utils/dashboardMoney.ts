// src/modules/admin/dashboard/utils/dashboardMoney.ts
import type { MoneyStr } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

export function parseBigIntSafe(s: string): bigint {
  try {
    const t = String(s ?? "0").trim();
    if (t === "") return 0n;
    return BigInt(t);
  } catch {
    return 0n;
  }
}

/** MoneyStr (BigInt serialized) => safe number for charts (minor units) */
export function moneyStrToSafeIntLocal(v: MoneyStr): number {
  const bi = parseBigIntSafe(v);
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  const min = -max;
  const clamped = bi > max ? max : bi < min ? min : bi;
  return Number(clamped);
}

/**
 * Formato cubano solicitado:
 * - Sin separador de miles
 * - Punto SOLO para centavos
 * Ej: 1234567 -> "12345.67 CUP"
 */
export function formatMoneyFromBaseMinorStr(
  amountBaseMinor: string,
  _locale: string,
  currency: string
): string {
  const v = parseBigIntSafe(amountBaseMinor);
  const sign = v < 0n ? "-" : "";
  const abs = v < 0n ? -v : v;

  const scale = 2n; // centavos
  const div = 10n ** scale;

  const major = abs / div;
  const minor = abs % div;

  const majorStr = major.toString(); // sin separación
  const minorStr = minor.toString().padStart(Number(scale), "0");

  return `${sign}${majorStr}.${minorStr} ${currency}`;
}