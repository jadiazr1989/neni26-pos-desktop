// src/lib/money/money.ts
export type MoneyParse =
  | { ok: true; minor: number }
  | { ok: false; error: string };

export function parseMoneyToMinor(input: string, opts?: { scale?: number }): MoneyParse {
  const scale = opts?.scale ?? 2;
  const raw = String(input ?? "").trim();
  if (!raw) return { ok: false, error: "Valor requerido" };

  // Normaliza coma a punto
  const normalized = raw.replace(",", ".");

  // Permite: 12 | 12.3 | 12.34
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, error: "Formato inválido. Ej: 12.34" };
  }

  const [intPart, decPart = ""] = normalized.split(".");
  if (decPart.length > scale) {
    return { ok: false, error: `Máximo ${scale} decimales` };
  }

  const padded = (decPart + "0".repeat(scale)).slice(0, scale);
  const minorStr = `${intPart}${padded}`;
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
