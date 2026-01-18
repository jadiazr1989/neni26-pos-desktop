// src/modules/catalog/brands/ui/hooks/useBrandOptions.ts
"use client";

import * as React from "react";
import { brandService } from "@/lib/modules/catalog/brands/brand.service";

type LoadState = "idle" | "loading" | "ready" | "error";
type BrandDTO = { id: string; name: string; slug: string };

function uniqById(items: BrandDTO[]): BrandDTO[] {
  const seen = new Set<string>();
  const out: BrandDTO[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

export function useBrandOptions(opts?: { take?: number }) {
  const take = opts?.take ?? 50;

  const [search, setSearch] = React.useState("");
  const [items, setItems] = React.useState<BrandDTO[]>([]);
  const [state, setState] = React.useState<LoadState>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const loadedOnceRef = React.useRef(false);
  const debounceRef = React.useRef<number | null>(null);

  const fetchNow = React.useCallback(
    async (q: string) => {
      setState("loading");
      setError(null);
      try {
        const list = await brandService.list({
          search: q.trim() || undefined,
          take,
          skip: 0,
        });
        setItems(uniqById(list));
        setState("ready");
        loadedOnceRef.current = true;
      } catch (e) {
        setState("error");
        setError(e instanceof Error ? e.message : "Error cargando marcas.");
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
