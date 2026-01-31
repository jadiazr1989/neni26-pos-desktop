"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import type { ListPosCatalogQuery, ListPosCatalogResponse, PosCatalogRowDTO } from "@/lib/modules/catalog/products/product.dto";

/**
 * ✅ DIP (Dependency Inversion):
 * - El hook depende de un "port" (interfaz), NO de productService directamente.
 * - Puedes testearlo inyectando un fake.
 */
export interface PosCatalogPort {
  listPosCatalog(q: ListPosCatalogQuery): Promise<ListPosCatalogResponse>;
}

type State = {
  rows: PosCatalogRowDTO[];
  cursor: string | null;
  loading: boolean;
  error: string | null;
};

function mergeUniqueByVariantId(prev: PosCatalogRowDTO[], next: PosCatalogRowDTO[]): PosCatalogRowDTO[] {
  const m = new Map<string, PosCatalogRowDTO>();
  for (const r of prev) m.set(r.variantId, r);
  for (const r of next) m.set(r.variantId, r);
  return Array.from(m.values());
}

function stableKey(params: {
  categoryId: string;
  q: string;
  inStock: boolean;
  pageSize: number;
}): string {
  return JSON.stringify(params);
}

export function usePosCatalog(
  port: PosCatalogPort,
  params?: {
    categoryId?: string; // "all" | uuid
    q?: string;
    pageSize?: number;
    inStock?: boolean;

    /**
     * ✅ opcional: transforma rows → cualquier VM.
     * Mantiene UI tonta y sin casts.
     */
    mapRow?: (row: PosCatalogRowDTO) => unknown;
  }
) {
  const categoryId = (params?.categoryId ?? "all").trim() || "all";
  const q = (params?.q ?? "").trim();
  const pageSize = Math.max(1, Math.min(Number(params?.pageSize ?? 24), 50));
  const inStock = params?.inStock ?? true;

  const key = React.useMemo(
    () => stableKey({ categoryId, q, inStock, pageSize }),
    [categoryId, q, inStock, pageSize]
  );

  const [state, setState] = React.useState<State>({
    rows: [],
    cursor: null,
    loading: false,
    error: null,
  });

  // ✅ evita actualizar state si cambia el "key" mientras una request está en vuelo
  const keyRef = React.useRef(key);
  React.useEffect(() => {
    keyRef.current = key;
  }, [key]);

  const loadFirst = React.useCallback(async () => {
    const myKey = keyRef.current;

    setState({ rows: [], cursor: null, loading: true, error: null });

    try {
      const res = await port.listPosCatalog({
        categoryId,
        q,
        limit: pageSize,
        cursor: null,
        inStock,
      });

      if (keyRef.current !== myKey) return;

      setState({
        rows: res.rows,
        cursor: res.nextCursor,
        loading: false,
        error: null,
      });
    } catch (e: unknown) {
      if (keyRef.current !== myKey) return;

      const msg = e instanceof Error ? e.message : "No se pudo cargar el catálogo";
      setState((s) => ({ ...s, loading: false, error: msg }));

      notify.error({
        title: "Error cargando catálogo",
        description: msg,
      });
    }
  }, [port, categoryId, q, pageSize, inStock]);

  const loadMore = React.useCallback(async () => {
    let cursorToUse: string | null = null;
    const myKey = keyRef.current;

    // ✅ tomar cursor del mismo tick + evitar double fetch
    setState((s) => {
      if (s.loading) return s;
      if (!s.cursor) return s;
      cursorToUse = s.cursor;
      return { ...s, loading: true, error: null };
    });

    if (!cursorToUse) return;

    try {
      const res = await port.listPosCatalog({
        categoryId,
        q,
        limit: pageSize,
        cursor: cursorToUse,
        inStock,
      });

      if (keyRef.current !== myKey) return;

      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        rows: mergeUniqueByVariantId(s.rows, res.rows),
        cursor: res.nextCursor,
      }));
    } catch (e: unknown) {
      if (keyRef.current !== myKey) return;

      const msg = e instanceof Error ? e.message : "No se pudo cargar más";
      setState((s) => ({ ...s, loading: false, error: msg }));

      notify.error({
        title: "Error cargando más",
        description: msg,
      });
    }
  }, [port, categoryId, q, pageSize, inStock]);

  // ✅ Auto-load cuando cambia el key
  React.useEffect(() => {
    loadFirst();
  }, [loadFirst, key]);

  const rows = state.rows;


  return {
    // raw
    rows,
    loading: state.loading,
    error: state.error,
    cursor: state.cursor,
    hasMore: Boolean(state.cursor),
    loadFirst,
    loadMore,
  };
}
