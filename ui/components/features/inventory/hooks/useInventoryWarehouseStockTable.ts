// src/modules/inventory/ui/hooks/useInventoryWarehouseStockTable.ts
"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

type State = {
  rows: WarehouseStockRowUI[];
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
};

function mergeUnique(prev: WarehouseStockRowUI[], next: WarehouseStockRowUI[]): WarehouseStockRowUI[] {
  const m = new Map<string, WarehouseStockRowUI>();
  for (const r of prev) m.set(r.variantId, r);
  for (const r of next) m.set(r.variantId, r);
  return Array.from(m.values());
}

export function useInventoryWarehouseStockTable(params: { pageSize?: number }) {
  const pageSize = params.pageSize ?? 50;

  const [state, setState] = React.useState<State>({
    rows: [],
    loading: false,
    error: null,
    nextCursor: null,
  });

  const loadFirst = React.useCallback(async () => {
    setState({ rows: [], loading: true, error: null, nextCursor: null });

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: null });
      setState({ rows: res.rows, loading: false, error: null, nextCursor: res.nextCursor });
    } catch (e: unknown) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "No se pudo cargar inventario." }));
    }
  }, [pageSize]);

  const loadMore = React.useCallback(async () => {
    let cursorToUse: string | null = null;

    setState((s) => {
      if (s.loading) return s;
      if (!s.nextCursor) return s;
      cursorToUse = s.nextCursor;
      return { ...s, loading: true, error: null };
    });

    if (!cursorToUse) return;

    try {
      const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: cursorToUse });
      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        rows: mergeUnique(s.rows, res.rows),
        nextCursor: res.nextCursor,
      }));
    } catch (e: unknown) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "No se pudo cargar más." }));
    }
  }, [pageSize]);

  return {
    rows: state.rows,
    loading: state.loading,
    error: state.error,
    hasMore: Boolean(state.nextCursor),
    loadFirst,
    loadMore,
  };
}
