"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

export type VariantPick = {
  id: string;
  label: string;
  sku?: string | null;
  title?: string | null;
  productName?: string | null;

  defaultUnitCostBaseMinor?: number | null;
  defaultUnitPriceBaseMinor?: number | null;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function mapPick(r: WarehouseStockRowUI): VariantPick {
  const sku = r.sku ?? null;
  const title = r.title ?? null;
  const productName = r.productName ?? null;

  const label = [sku ? sku : "—", title ? title : "", productName ? `(${productName})` : ""]
    .filter(Boolean)
    .join(" · ")
    .trim();

  return {
    id: r.variantId,
    label,
    sku,
    title,
    productName,

    // ✅ defaults desde UI row (ya viene mapeado desde DTO)
    defaultUnitCostBaseMinor: typeof r.costBaseMinor === "number" ? r.costBaseMinor : null,
    defaultUnitPriceBaseMinor: typeof r.priceBaseMinor === "number" ? r.priceBaseMinor : null,
  };
}

function includesQ(p: VariantPick, q: string) {
  if (!q) return true;
  const hay = `${p.sku ?? ""} ${p.title ?? ""} ${p.productName ?? ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function useMyWarehouseVariantOptions(params?: { maxItems?: number; pageSize?: number }) {
  const maxItems = params?.maxItems ?? 400;
  const pageSize = params?.pageSize ?? 100;

  const [loadState, setLoadState] = React.useState<LoadState>("idle");
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [all, setAll] = React.useState<VariantPick[]>([]);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);

  const ensureLoaded = React.useCallback(async () => {
    if (loadState === "loading") return;
    if (loadState === "ready" && all.length > 0) return;

    setLoadState("loading");
    setLoadError(null);

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: null });
      const picks = res.rows.map(mapPick);
      setAll(picks);
      setNextCursor(res.nextCursor ?? null);
      setLoadState("ready");
    } catch (e: unknown) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar inventario.");
    }
  }, [all.length, loadState, pageSize]);

  const loadMore = React.useCallback(async () => {
    if (loadState === "loading") return;
    if (!nextCursor) return;
    if (all.length >= maxItems) return;

    setLoadState("loading");
    setLoadError(null);

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: nextCursor });
      const picks = res.rows.map(mapPick);

      const m = new Map<string, VariantPick>();
      for (const p of all) m.set(p.id, p);
      for (const p of picks) m.set(p.id, p);

      const merged = Array.from(m.values());
      setAll(merged);
      setNextCursor(res.nextCursor ?? null);
      setLoadState("ready");
    } catch (e: unknown) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar más.");
    }
  }, [all, loadState, maxItems, nextCursor, pageSize]);

  const searchLocal = React.useCallback(
    (q: string) => {
      const t = q.trim();
      if (!t) return all.slice(0, 50);
      return all.filter((x) => includesQ(x, t)).slice(0, 50);
    },
    [all],
  );

  return {
    loadState,
    loadError,
    all,
    hasMore: Boolean(nextCursor) && all.length < maxItems,
    ensureLoaded,
    loadMore,
    searchLocal,
  };
}
