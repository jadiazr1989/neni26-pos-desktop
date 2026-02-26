// src/lib/money/money.ts
export type MoneyParse =
  | { ok: true; minor: number }
  | { ok: false; error: string };

export function parseMoneyToMinor(input: string, opts?: { scale?: number }): MoneyParse {
  const scale = opts?.scale ?? 2;
  const raw0 = String(input ?? "").trim();
  if (!raw0) return { ok: false, error: "Valor requerido" };

  // 1) quita espacios y separadores de miles comunes
  // permite dígitos, coma, punto
  let raw = raw0.replace(/\s+/g, "").replace(/'/g, "").replace(/_/g, "");
  if (!raw) return { ok: false, error: "Valor requerido" };

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  // 2) determina separador decimal (si ambos existen, el último manda)
  let decimalSep: "," | "." | null = null;
  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    decimalSep = lastComma > lastDot ? "," : ".";
  } else if (hasComma) {
    decimalSep = ",";
  } else if (hasDot) {
    decimalSep = ".";
  }

  // 3) elimina separadores de miles y normaliza a "."
  if (decimalSep) {
    const thouSep = decimalSep === "," ? "." : ",";
    raw = raw.split(thouSep).join("");      // quita miles
    if (decimalSep === ",") raw = raw.replace(",", "."); // decimal a punto
  }

  // 4) valida: 123 o 123.4 o 123.45
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    return { ok: false, error: "Formato inválido. Ej: 1234,56" };
  }

  const [intPart, decPart = ""] = raw.split(".");
  if (decPart.length > scale) return { ok: false, error: `Máximo ${scale} decimales` };

  const padded = (decPart + "0".repeat(scale)).slice(0, scale);
  const minorStr = `${intPart}${padded}`;

  // evita overflow raro (para POS normal no pasa, pero igual)
  const minor = Number(minorStr);
  if (!Number.isFinite(minor) || minor < 0) return { ok: false, error: "Número inválido" };

  return { ok: true, minor: Math.trunc(minor) };
}

export function minorToMoneyString(minor: number, opts?: { scale?: number }): string {
  const scale = opts?.scale ?? 2;
  const n = Math.max(0, Math.trunc(Number(minor ?? 0)));

  const s = String(n).padStart(scale + 1, "0");
  const intPart = s.slice(0, -scale);
  const decPart = s.slice(-scale);
  return scale > 0 ? `${intPart}.${decPart}` : intPart;
}
// ui/lib/money.ts
export function majorToMinor(input: string): number {
  const res = parseMoneyToMinor(input, { scale: 2 });
  return res.ok ? res.minor : 0;
}

export function minorToMajor(minor: number): string {
  const n = Number(minor ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  return (v / 100).toFixed(2);
}

export function formatMoney(minor: number, currency: string = "CUP"): string {
  return `${minorToMajor(minor)} ${currency}`;
}

export function moneyInputToMinorOr0(input: string, opts?: { scale?: number }): number {
  const res = parseMoneyToMinor(input, opts);
  return res.ok ? res.minor : 0;
}

// Variante que retorna null para distinguir error:
export function moneyInputToMinorOrNull(input: string, opts?: { scale?: number }): number | null {
  const res = parseMoneyToMinor(input, opts);
  return res.ok ? res.minor : null;
}

