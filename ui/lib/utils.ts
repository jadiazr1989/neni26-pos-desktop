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

// helper (puede ir en InventoryWarehouseStockTable.tsx o en un ui/utils)
export function displayVariantTitle(title?: string | null, sku?: string | null) {
  const t = (title ?? "").trim();
  if (!t) return sku ?? "—";
  if (t.toLowerCase() === "default") return "Variante base";
  return t;
}


export function displayVariantTitle2(title: string | null, sku: string) {
  const t = (title ?? "").trim();
  if (!t) return sku;
  if (t.toLowerCase() === "default") return "Variante base";
  return t;
}

export function isNonZeroIntString(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  const n = Number(t);
  return Number.isFinite(n) && Number.isInteger(n) && n !== 0;
}

// src/lib/ui/minDelay.ts
export async function minDelay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}


