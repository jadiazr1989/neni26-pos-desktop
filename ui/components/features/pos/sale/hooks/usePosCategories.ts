"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";
import type { PosCategoryDTO } from "@/lib/modules/catalog/categories/category.dto";

type State = {
  rows: PosCategoryDTO[];
  cursor: string | null;
  loading: boolean;
  error: string | null;
};

function mergeUniqueById(prev: PosCategoryDTO[], next: PosCategoryDTO[]): PosCategoryDTO[] {
  const m = new Map<string, PosCategoryDTO>();
  for (const r of prev) m.set(r.id, r);
  for (const r of next) m.set(r.id, r);
  return Array.from(m.values());
}

export function usePosCategories(params?: { pageSize?: number; inStock?: boolean }) {
  const pageSize = params?.pageSize ?? 8;
  const inStock = params?.inStock ?? true;

  const [state, setState] = React.useState<State>({
    rows: [],
    cursor: null,
    loading: false,
    error: null,
  });

  const loadFirst = React.useCallback(async () => {
    setState({ rows: [], cursor: null, loading: true, error: null });

    try {
      const res = await categoryService.listForPos({
        inStock,
        limit: pageSize,
        cursor: null,
      });

      setState({
        rows: res.rows,
        cursor: res.nextCursor,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo cargar categorías";
      setState((s) => ({ ...s, loading: false, error: msg }));

      notify.error({
        title: "Error cargando categorías",
        description: msg,
      });
    }
  }, [inStock, pageSize]);

  const loadMore = React.useCallback(async () => {
    let cursorToUse: string | null = null;

    // ✅ toma cursor del state en el mismo tick (evita race/stale)
    setState((s) => {
      if (s.loading) return s;
      if (!s.cursor) return s;
      cursorToUse = s.cursor;
      return { ...s, loading: true, error: null };
    });

    if (!cursorToUse) return;

    try {
      const res = await categoryService.listForPos({
        inStock,
        limit: pageSize,
        cursor: cursorToUse,
      });

      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        rows: mergeUniqueById(s.rows, res.rows),
        cursor: res.nextCursor,
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo cargar más";
      setState((s) => ({ ...s, loading: false, error: msg }));

      notify.error({
        title: "Error cargando más categorías",
        description: msg,
      });
    }
  }, [inStock, pageSize]);

  return {
    rows: state.rows,
    loading: state.loading,
    error: state.error,
    hasMore: Boolean(state.cursor),
    loadFirst,
    loadMore,
  };
}
