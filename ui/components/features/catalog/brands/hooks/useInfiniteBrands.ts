// src/modules/catalog/brands/ui/hooks/useInfiniteBrands.ts
"use client";

import * as React from "react";
import { useInfinitePager } from "@/core/paging/useInfinitePager";
import type { PageResult } from "@/core/paging/paging.types";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";
import { brandService } from "@/lib/modules/catalog/brands/brand.service";

export type BrandsQuery = {
  search: string;
};

export function useInfiniteBrands(query: BrandsQuery) {
  const queryKey = React.useMemo(() => JSON.stringify(query), [query]);

  return useInfinitePager<BrandDTO, BrandsQuery>({
    query,
    queryKey,
    pageSize: 50,
    fetchPage: async (q, page): Promise<PageResult<BrandDTO>> => {
      const items = await brandService.list({
        search: q.search.trim() || undefined,
        take: page.take,
        skip: page.skip,
      });

      return { items, hasMore: items.length === page.take };
    },
  });
}
