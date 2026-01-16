// src/modules/catalog/categories/ui/tree/useCategoryTree.ts
"use client";

import * as React from "react";
import { useInfinitePager } from "@/core/paging/useInfinitePager";
import type { PageResult } from "@/core/paging/paging.types";

import type { Breadcrumb, CategoryDTO, CategoryTreeState } from "@/lib/modules/catalog/categories/category.dto";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";
import { useDebouncedValue } from "@/components/shared/hooks/useDebouncedValue";

type TreeQuery = { search: string; parentId?: string | null }; // ✅ allow undefined

function rootCrumbs(): Breadcrumb[] {
  return [{ id: null, label: "Raíz" }];
}

export function useCategoryTree(opts?: { initialParentId?: string | null; debounceMs?: number }): CategoryTreeState {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, opts?.debounceMs ?? 300);

  const [parentId, setParentId] = React.useState<string | null>(opts?.initialParentId ?? null);
  const [breadcrumbs, setBreadcrumbs] = React.useState<Breadcrumb[]>(rootCrumbs());

  // ✅ key: si hay búsqueda -> global (no filtrar por parentId)
  const effectiveParentId: string | null | undefined =
    debouncedSearch.trim() !== "" ? undefined : parentId;

  const query = React.useMemo<TreeQuery>(
    () => ({ search: debouncedSearch, parentId: effectiveParentId }),
    [debouncedSearch, effectiveParentId]
  );

  const queryKey = React.useMemo(() => JSON.stringify(query), [query]);

  const pager = useInfinitePager<CategoryDTO, TreeQuery>({
    query,
    queryKey,
    pageSize: 50,
    fetchPage: async (q, page): Promise<PageResult<CategoryDTO>> => {
      const items = await categoryService.list({
        search: q.search.trim() || undefined,
        parentId: q.parentId, // ✅ undefined => no param => global
        take: page.take,
        skip: page.skip,
      });

      return { items, hasMore: items.length === page.take };
    },
  });

  // Carga inicial por queryKey
  React.useEffect(() => {
    void pager.loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const openRoot = React.useCallback(() => {
    setParentId(null);
    setBreadcrumbs(rootCrumbs());
  }, []);

  // src/modules/catalog/categories/ui/tree/useCategoryTree.ts
// ... dentro del hook

const openChild = React.useCallback((c: CategoryDTO) => {
  setParentId((prev) => (prev === c.id ? prev : c.id));

  setBreadcrumbs((prev) => {
    const last = prev[prev.length - 1];
    if (last?.id === c.id) return prev;

    const idx = prev.findIndex((b) => b.id === c.id);
    if (idx >= 0) return prev.slice(0, idx + 1);

    return prev.concat({ id: c.id, label: c.name });
  });
}, []);

const goToCrumb = React.useCallback((crumbIndex: number) => {
  setBreadcrumbs((prev) => {
    const next = prev.slice(0, crumbIndex + 1);
    const target = next[next.length - 1] ?? { id: null, label: "Raíz" };
    setParentId(target.id);
    return next;
  });
}, []);

// dentro de useCategoryTree
const goUp = React.useCallback(() => {
  setBreadcrumbs((prev) => {
    if (prev.length <= 1) return prev;
    const next = prev.slice(0, prev.length - 1);
    const target = next[next.length - 1] ?? { id: null, label: "Raíz" };
    setParentId(target.id);
    return next;
  });
}, []);



  const refresh = React.useCallback(async () => {
    pager.reset();
    await pager.loadMore();
  }, [pager]);

  return {
    parentId,
    breadcrumbs,

    rows: pager.items,
    loading: pager.loading,
    error: pager.error,
    hasMore: pager.hasMore,

    search,
    setSearch,

    openRoot,
    openChild,
    goToCrumb,
    goUp,
    refresh,
    loadMore: pager.loadMore,
    setError: pager.setError,
  };
}
