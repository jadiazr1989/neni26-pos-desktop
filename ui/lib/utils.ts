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


export function formatMoneyBaseMinor(v: number) {
  // asumiendo CUP minor = CUP entero (según tu comentario: 1 = 1 CUP)
  return new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "CUP",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatIsoShort(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-ES", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function isHttpUrl(u: string | null): u is string {
  console.log(u)
  if (!u) return false;
  return u.startsWith("http://") || u.startsWith("https://");
}

export function normalizeSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  const s = src.trim();
  if (!s) return null;

  // ✅ rutas locales (Next public o rutas servidas por tu app)
  if (s.startsWith("/")) return s;

  // ✅ previews / base64
  if (s.startsWith("blob:") || s.startsWith("data:")) return s;

  // ✅ http/https
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  // //cdn...
  if (s.startsWith("//")) return `https:${s}`;

  return null;
}
