// src/core/paging/useInfinitePager.ts
"use client";

import * as React from "react";
import type { PageParams, PageResult } from "./paging.types";

export function useInfinitePager<T, TQuery extends object>(opts: {
  query: TQuery;
  queryKey: string; // estable: JSON.stringify(...)
  pageSize?: number;
  fetchPage: (query: TQuery, page: PageParams) => Promise<PageResult<T>>;
}) {
  const pageSize = opts.pageSize ?? 50;

  const [items, setItems] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);

  // ✅ refs = verdad absoluta (evita closures viejos)
  const loadingRef = React.useRef(false);
  const hasMoreRef = React.useRef(true);
  const skipRef = React.useRef(0);

  // para evitar aplicar respuestas viejas cuando cambia queryKey
  const requestIdRef = React.useRef(0);
  const lastQueryKeyRef = React.useRef(opts.queryKey);

  const syncLoading = (v: boolean) => {
    loadingRef.current = v;
    setLoading(v);
  };

  const reset = React.useCallback(() => {
    skipRef.current = 0;
    hasMoreRef.current = true;

    setItems([]);
    setHasMore(true);
    setError(null);
  }, []);

  const loadMore = React.useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    syncLoading(true);
    setError(null);

    const myRequestId = ++requestIdRef.current;
    const myQueryKey = opts.queryKey;
    lastQueryKeyRef.current = myQueryKey;

    try {
      const res = await opts.fetchPage(opts.query, { take: pageSize, skip: skipRef.current });

      // ✅ si cambió queryKey mientras esperabas, ignora
      if (lastQueryKeyRef.current !== myQueryKey) return;
      if (myRequestId !== requestIdRef.current) return;

      setItems((prev) => prev.concat(res.items));

      skipRef.current += res.items.length;
      hasMoreRef.current = res.hasMore;
      setHasMore(res.hasMore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando datos.");
    } finally {
      syncLoading(false);
    }
  }, [opts, pageSize]);

  const reload = React.useCallback(async () => {
    // ✅ una sola operación consistente
    reset();
    // importante: subir requestId para invalidar in-flight
    requestIdRef.current += 1;
    lastQueryKeyRef.current = opts.queryKey;

    await loadMore();
  }, [reset, loadMore, opts.queryKey]);

  // ✅ auto reload cuando cambia queryKey
  React.useEffect(() => {
    if (opts.queryKey === lastQueryKeyRef.current) return;
    lastQueryKeyRef.current = opts.queryKey;
    void reload();
  }, [opts.queryKey, reload]);

  return {
    items,
    loading,
    error,
    hasMore,
    reset,
    loadMore,
    reload,     // ✅ nuevo
    setError,
  };
}
