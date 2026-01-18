import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNonNegInt(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  if (!/^\d+$/.test(t)) return null; // solo dígitos
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function normalizeBarcode(s: string): string | null {
  const t = s.trim();
  if (t === "") return null;
  // opcional: exigir solo dígitos
  if (!/^\d+$/.test(t)) return null;
  return t;
}