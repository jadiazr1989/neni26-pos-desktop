// src/modules/catalog/products/ui/hooks/useProductsList.ts
"use client";

import * as React from "react";
import { useInfinitePager } from "@/core/paging/useInfinitePager";
import type { PageResult } from "@/core/paging/paging.types";
import { useDebouncedValue } from "@/components/shared/hooks/useDebouncedValue";
import { productService } from "@/lib/modules/catalog/products/product.service";
import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";

type Query = { search: string };

export function useProductsList(opts?: { debounceMs?: number }) {
  const [search, setSearch] = React.useState("");
  const debounced = useDebouncedValue(search, opts?.debounceMs ?? 300);

  const query = React.useMemo<Query>(() => ({ search: debounced }), [debounced]);
  const queryKey = React.useMemo(() => JSON.stringify(query), [query]);

  const pager = useInfinitePager<ProductDTO, Query>({
    query,
    queryKey,
    pageSize: 50,
    fetchPage: async (q, page): Promise<PageResult<ProductDTO>> => {
      const items = await productService.list({
        search: q.search.trim() || undefined,
        take: page.take,
        skip: page.skip,
      });
      return { items, hasMore: items.length === page.take };
    },
  });

  React.useEffect(() => {
    void pager.loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const refresh = React.useCallback(async () => {
    pager.reset();
    await pager.loadMore();
  }, [pager]);

  return {
    search,
    setSearch,

    rows: pager.items,
    loading: pager.loading,
    error: pager.error,
    hasMore: pager.hasMore,

    refresh,
    loadMore: pager.loadMore,
    setError: pager.setError,
  };
}
