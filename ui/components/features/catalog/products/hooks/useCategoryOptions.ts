// src/modules/catalog/categories/ui/hooks/useCategoryOptions.ts
"use client";

import * as React from "react";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";
import type { CategoryDTO } from "@/lib/modules/catalog/categories/category.dto";

type LoadState = "idle" | "loading" | "ready" | "error";

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

export function useCategoryOptions(opts?: { take?: number }) {
  const take = opts?.take ?? 50;

  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<CategoryDTO[]>([]);
  const [state, setState] = React.useState<LoadState>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const loadedOnceRef = React.useRef(false);
  const debounceRef = React.useRef<number | null>(null);

  const fetchNow = React.useCallback(
    async (q: string) => {
      setState("loading");
      setError(null);
      try {
        const res = await categoryService.list({
          search: q.trim() || undefined,
          take,
          skip: 0,
          // parentId: undefined -> trae todo lo que tu API decida (si filtras root por default, quítalo)
        });

        setItems(uniqById(res));
        setState("ready");
        loadedOnceRef.current = true;
      } catch (e) {
        setState("error");
        setError(e instanceof Error ? e.message : "Error cargando categorías.");
      }
    },
    [take]
  );

  const ensureLoaded = React.useCallback(() => {
    if (loadedOnceRef.current) return;
    void fetchNow(search);
  }, [fetchNow, search]);

  React.useEffect(() => {
    if (!loadedOnceRef.current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => void fetchNow(search), 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, fetchNow]);

  return {
    search,
    setSearch,
    items,
    loadState: state,
    loadError: error,
    ensureLoaded,
  };
}
