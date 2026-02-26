// src/modules/purchases/ui/hooks/useMyWarehouseVariantIndex.ts
"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";

// ✅ OJO: usamos UI row (lo que devuelve inventoryService.getMyWarehouseStock)
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

// units
import type { Unit, SellUnit } from "@/lib/modules/catalog/products/product.dto";

export type VariantPick = {
  id: string;
  label: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productName: string | null;

  // ✅ units model
  baseUnit: Unit; // UNIT | G | ML
  pricingUnit: SellUnit; // UNIT | G | KG | LB | ML | L
  unitFactor: string | null;

  // ✅ money per pricingUnit
  priceBaseMinor: number;
  costBaseMinor: number;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function normalizeCode(s: string): string {
  return String(s ?? "").trim().toLowerCase();
}

function buildLabel(r: WarehouseStockRowUI): string {
  const sku = r?.sku ?? "—";
  const title = r?.title ?? "";
  const productName = r?.productName ?? null;
  return [sku, title, productName ? `(${productName})` : ""].filter(Boolean).join(" · ").trim();
}

function mapPick(r: WarehouseStockRowUI): VariantPick {

  // si por alguna razón viene null (no debería), protegemos:
  const safeSku = r?.sku ?? "—";
  const safeBaseUnit = (r?.baseUnit ?? "UNIT") as Unit;
  const safePricingUnit = (r?.pricingUnit ?? "UNIT") as SellUnit;

  return {
    id: r.variantId,
    label: buildLabel(r),

    sku: safeSku,
    barcode: r?.barcode ?? null,
    title: r?.title ?? null,
    imageUrl: r?.imageUrl ?? null,
    isActive: Boolean(r?.isActive ?? true),
    productName: r?.productName ?? null,

    baseUnit: safeBaseUnit,
    pricingUnit: safePricingUnit,
    unitFactor: r?.unitFactor ?? null,
    priceBaseMinor: Number(r?.priceBaseMinor ?? 0),
    costBaseMinor: Number(r?.costBaseMinor ?? 0),
  };
}

export function useMyWarehouseVariantIndex(params?: { maxItems?: number; pageSize?: number }) {
  const maxItems = params?.maxItems ?? 800;
  const pageSize = params?.pageSize ?? 150;

  const [loadState, setLoadState] = React.useState<LoadState>("idle");
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [items, setItems] = React.useState<VariantPick[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const byId = React.useMemo(() => {
    const m = new Map<string, VariantPick>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  const bySku = React.useMemo(() => {
    const m = new Map<string, VariantPick>();
    for (const it of items) m.set(normalizeCode(it.sku), it);
    return m;
  }, [items]);

  const byBarcode = React.useMemo(() => {
    const m = new Map<string, VariantPick>();
    for (const it of items) {
      if (it.barcode) m.set(normalizeCode(it.barcode), it);
    }
    return m;
  }, [items]);

  const ensureLoaded = React.useCallback(async () => {
    if (loadState === "loading") return;
    if (loadState === "ready" && items.length > 0) return;

    setLoadState("loading");
    setLoadError(null);

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: null });
      // ✅ res.rows ya viene UI (WarehouseStockRowUI[])
      const picks = res.rows.map(mapPick);

      setItems(picks);
      setNextCursor(res.nextCursor ?? null);
      setLoadState("ready");
    } catch (e: unknown) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar inventario.");
    }
  }, [items.length, loadState, pageSize]);

  const loadMore = React.useCallback(async () => {
    if (loadState === "loading") return;
    if (!nextCursor) return;
    if (items.length >= maxItems) return;

    setLoadState("loading");
    setLoadError(null);

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: nextCursor });
      const picks = res.rows.map(mapPick);

      const m = new Map<string, VariantPick>();
      for (const it of items) m.set(it.id, it);
      for (const it of picks) m.set(it.id, it);

      setItems(Array.from(m.values()));
      setNextCursor(res.nextCursor ?? null);
      setLoadState("ready");
    } catch (e: unknown) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar más.");
    }
  }, [items, loadState, maxItems, nextCursor, pageSize]);

  const searchLocal = React.useCallback(
    (q: string) => {
      const t = q.trim().toLowerCase();
      if (!t) return items.slice(0, 50);

      const res = items.filter((it) => {
        const hay = `${it.sku} ${it.title ?? ""} ${it.productName ?? ""}`.toLowerCase();
        return hay.includes(t);
      });

      return res.slice(0, 50);
    },
    [items],
  );

  const findByCode = React.useCallback(
    (codeRaw: string, mode: "sku" | "barcode") => {
      const c = normalizeCode(codeRaw);
      if (!c) return null;
      return mode === "sku" ? (bySku.get(c) ?? null) : (byBarcode.get(c) ?? null);
    },
    [bySku, byBarcode],
  );

  return {
    loadState,
    loadError,
    items,
    hasMore: Boolean(nextCursor) && items.length < maxItems,
    ensureLoaded,
    loadMore,
    searchLocal,
    byId,
    findByCode,
  };
}
