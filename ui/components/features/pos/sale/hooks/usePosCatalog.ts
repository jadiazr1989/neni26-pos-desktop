// hooks/usePosCatalog.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import type {
  ListPosCatalogQuery,
  ListPosCatalogResponse,
  PosCatalogRowDTO,
} from "@/lib/modules/catalog/products/product.dto";

export interface PosCatalogPort {
  listPosCatalog(q: ListPosCatalogQuery): Promise<ListPosCatalogResponse>;
}

type State<T> = {
  rows: T[];
  cursor: string | null;
  loading: boolean;
  error: string | null;
};

function mergeUniqueByKey<T>(prev: T[], next: T[], keyOf: (row: T) => string): T[] {
  const m = new Map<string, T>();
  for (const r of prev) m.set(keyOf(r), r);
  for (const r of next) m.set(keyOf(r), r);
  return Array.from(m.values());
}

type Params<T> = {
  categoryId?: string; // "all" | uuid
  q?: string;
  pageSize?: number;
  inStock?: boolean;
  rev?: number; // ✅

  mapRow?: (row: PosCatalogRowDTO) => T;
  keyOfRow?: (row: T) => string;
};

function stableKey(p: {
  categoryId: string;
  q: string;
  inStock: boolean;
  pageSize: number;
  rev: number;
}): string {
  return `${p.categoryId}::${p.q}::${p.inStock ? 1 : 0}::${p.pageSize}::${p.rev}`;
}

export function usePosCatalog<T = PosCatalogRowDTO>(port: PosCatalogPort, params?: Params<T>) {
  const categoryId = (params?.categoryId ?? "all").trim() || "all";
  const q = (params?.q ?? "").trim();
  const pageSize = Math.max(1, Math.min(Number(params?.pageSize ?? 24), 50));
  const inStock = params?.inStock ?? true;
  const rev = Math.max(0, Number(params?.rev ?? 0)); // ✅

  const key = React.useMemo(
    () => stableKey({ categoryId, q, inStock, pageSize, rev }),
    [categoryId, q, inStock, pageSize, rev]
  );

  const [state, setState] = React.useState<State<T>>({
    rows: [],
    cursor: null,
    loading: false,
    error: null,
  });

  // ✅ keyRef para cancelar respuestas viejas
  const keyRef = React.useRef(key);
  React.useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // ✅ refs para estabilidad
  const mapRowRef = React.useRef<((row: PosCatalogRowDTO) => T) | undefined>(params?.mapRow);
  const keyOfRowRef = React.useRef<(row: T) => string>(
    params?.keyOfRow ??
      ((row: T) => {
        const asDto = row as unknown as PosCatalogRowDTO;
        return asDto.variantId;
      })
  );

  React.useEffect(() => {
    mapRowRef.current = params?.mapRow;
  }, [params?.mapRow]);

  React.useEffect(() => {
    keyOfRowRef.current =
      params?.keyOfRow ??
      ((row: T) => {
        const asDto = row as unknown as PosCatalogRowDTO;
        return asDto.variantId;
      });
  }, [params?.keyOfRow]);

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

      const mapper = mapRowRef.current;
      const mapped = mapper ? res.rows.map(mapper) : (res.rows as unknown as T[]);

      setState({
        rows: mapped,
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
  }, [port, categoryId, q, pageSize, inStock, rev]); // ✅ incluye rev

  const loadMore = React.useCallback(async () => {
    let cursorToUse: string | null = null;
    const myKey = keyRef.current;

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

      const mapper = mapRowRef.current;
      const mapped = mapper ? res.rows.map(mapper) : (res.rows as unknown as T[]);

      setState((s) => ({
        ...s,
        loading: false,
        error: null,
        rows: mergeUniqueByKey(s.rows, mapped, keyOfRowRef.current),
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

  // ✅ IMPORTANTE: refresca cuando cambie key (incluye rev)
  React.useEffect(() => {
    void loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return {
    rows: state.rows,
    loading: state.loading,
    error: state.error,
    cursor: state.cursor,
    hasMore: Boolean(state.cursor),
    loadFirst,
    loadMore,
  };
}
