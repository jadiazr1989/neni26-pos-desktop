// src/modules/catalog/categories/ui/hooks/useCategoryParentOptions.ts
"use client";

import * as React from "react";
import type { CategoryDTO } from "@/lib/modules/catalog/categories/category.dto";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";

export type LoadState = "idle" | "loading" | "ready" | "error";

function uniqById(items: CategoryDTO[]): CategoryDTO[] {
  const seen = new Set<string>();
  const out: CategoryDTO[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

function toMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
  return fallback;
}

export function useCategoryParentOptions(opts: { excludeId?: string; take?: number }) {
  const take = opts.take ?? 50;

  const [enabled, setEnabled] = React.useState(false); // ✅ solo true cuando abres
  const [search, setSearch] = React.useState("");

  const [items, setItems] = React.useState<CategoryDTO[]>([]);
  const [state, setState] = React.useState<LoadState>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchNow = React.useCallback(
    async (q: string) => {
      setState("loading");
      setError(null);

      try {
        const res = await categoryService.list({
          search: q.trim() || undefined,
          take,
          skip: 0,
        });

        const filtered = opts.excludeId ? res.filter((c) => c.id !== opts.excludeId) : res;
        setItems(uniqById(filtered));
        setState("ready");
      } catch (e) {
        setState("error");
        setError(toMessage(e, "Error cargando categorías."));
      }
    },
    [opts.excludeId, take]
  );

  // ✅ se llama cuando abres el dropdown
  const onOpenLoad = React.useCallback(() => {
    if (!enabled) setEnabled(true); // habilita modo async
  }, [enabled]);

  // ✅ cuando enabled, hacemos fetch inmediato (con search actual)
  React.useEffect(() => {
    if (!enabled) return;
    void fetchNow(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // ✅ cuando cambia search y enabled, debounce + fetch
  React.useEffect(() => {
    if (!enabled) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      void fetchNow(search);
    }, 250);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, search, fetchNow]);

  return {
    search,
    setSearch,
    items,
    loadState: state,
    loadError: error,
    onOpenLoad, // ✅ úsalo directo en el combobox
    refresh: () => fetchNow(search),
  };
}
