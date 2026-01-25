// src/modules/iam/users/ui/hooks/useInfiniteUsers.ts
"use client";

import * as React from "react";
import type { UserDTO } from "@/lib/modules/users/user.dto";
import { userService } from "@/lib/modules/users/user.service";

export type UsersQuery = { search: string };

export function useInfiniteUsers(query: UsersQuery) {
  const [items, setItems] = React.useState<UserDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(true);

  // ✅ refs para evitar stale closures + StrictMode double call
  const inFlightRef = React.useRef(false);
  const cursorRef = React.useRef<string | null>(null);
  const hasMoreRef = React.useRef(true);

  const queryKey = React.useMemo(() => JSON.stringify(query), [query]);

  const reset = React.useCallback(() => {
    cursorRef.current = null;
    hasMoreRef.current = true;
    inFlightRef.current = false;

    setItems([]);
    setHasMore(true);
    setError(null);
  }, []);

  const loadMore = React.useCallback(async () => {
    if (inFlightRef.current) return;
    if (!hasMoreRef.current) return;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await userService.list({
        search: query.search.trim() || undefined,
        take: 50,
        cursor: cursorRef.current ?? undefined,
      });

      // ✅ dedupe por id (por si acaso)
      setItems((prev) => {
        const map = new Map<string, UserDTO>();
        for (const u of prev) map.set(u.id, u);
        for (const u of res.items) map.set(u.id, u);
        return Array.from(map.values());
      });

      cursorRef.current = res.nextCursor;
      hasMoreRef.current = Boolean(res.nextCursor);
      setHasMore(Boolean(res.nextCursor));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
      hasMoreRef.current = false;
      setHasMore(false);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [query.search]);

  const resetAndLoadFirst = React.useCallback(async () => {
    reset();
    // ✅ importante: el cursorRef ya está limpio (sync), loadMore usará cursor null
    await loadMore();
  }, [reset, loadMore]);

  // ✅ cuando cambia búsqueda, reinicia y carga primera página
  React.useEffect(() => {
    void resetAndLoadFirst();
  }, [queryKey, resetAndLoadFirst]);

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    resetAndLoadFirst,
    setError,
  };
}
