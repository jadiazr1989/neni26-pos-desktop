"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import type { WarehouseStockRowDTO } from "@/lib/modules/inventory/inventory.dto";

export type VariantPick = {
  id: string;     // variantId
  label: string;  // "SKU · Title · Product"
  sku?: string | null;
  title?: string | null;
  productName?: string | null;
  // defaults opcionales si existieran en DTO (si no, déjalos null)
  defaultUnitCostBaseMinor?: number | null;
  defaultUnitPriceBaseMinor?: number | null;
};

type LoadState = "idle" | "loading" | "ready" | "error";

function mapPick(dto: WarehouseStockRowDTO): VariantPick {
  const sku = dto.variant?.sku ?? null;
  const title = dto.variant?.title ?? null;
  const productName = dto.variant?.product?.name ?? null;

  const label = [
    sku ? sku : "—",
    title ? title : "",
    productName ? `(${productName})` : "",
  ].filter(Boolean).join(" · ").trim();

  return {
    id: dto.variantId,
    label,
    sku,
    title,
    productName,
    defaultUnitCostBaseMinor: null,
    defaultUnitPriceBaseMinor: null,
  };
}

function includesQ(p: VariantPick, q: string) {
  if (!q) return true;
  const hay = `${p.sku ?? ""} ${p.title ?? ""} ${p.productName ?? ""}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function useMyWarehouseVariantOptions(params?: { maxItems?: number }) {
  const maxItems = params?.maxItems ?? 400;

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
      const res = await inventoryService.getMyWarehouseStock({ limit: 100, cursor: null });
      const picks = (res.rows as WarehouseStockRowDTO[]).map(mapPick);
      setAll(picks);
      setNextCursor(res.nextCursor ?? null);
      setLoadState("ready");
    } catch (e: unknown) {
      setLoadState("error");
      setLoadError(e instanceof Error ? e.message : "No se pudo cargar inventario.");
    }
  }, [all.length, loadState]);

  const loadMore = React.useCallback(async () => {
    if (loadState === "loading") return;
    if (!nextCursor) return;
    if (all.length >= maxItems) return;

    setLoadState("loading");
    setLoadError(null);

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: 100, cursor: nextCursor });
      const picks = (res.rows as WarehouseStockRowDTO[]).map(mapPick);

      // merge unique por id
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
  }, [all, loadState, maxItems, nextCursor]);

  const searchLocal = React.useCallback((q: string) => {
    const t = q.trim();
    if (!t) return all.slice(0, 50);
    return all.filter((x) => includesQ(x, t)).slice(0, 50);
  }, [all]);

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
