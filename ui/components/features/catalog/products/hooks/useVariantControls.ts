// src/modules/catalog/products/ui/hooks/useVariantControls.ts
"use client";

import * as React from "react";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";

export type VariantFilter = "all" | "active" | "inactive";

export function useVariantControls(variants: ProductVariantDTO[]) {
  const [variantSearch, setVariantSearch] = React.useState("");
  const [variantFilter, setVariantFilter] = React.useState<VariantFilter>("all");

  const filteredVariants = React.useMemo(() => {
    const q = variantSearch.trim().toLowerCase();

    return variants
      .filter((v) => {
        if (variantFilter === "active") return v.isActive;
        if (variantFilter === "inactive") return !v.isActive;
        return true;
      })
      .filter((v) => {
        if (!q) return true;
        const hay = `${v.sku ?? ""} ${v.barcode ?? ""} ${v.title ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
  }, [variants, variantSearch, variantFilter]);

  const counts = React.useMemo(() => {
    const total = variants.length;
    const active = variants.filter((x) => x.isActive).length;
    return { total, active, inactive: total - active };
  }, [variants]);

  return {
    variantSearch,
    setVariantSearch,
    variantFilter,
    setVariantFilter,
    filteredVariants,
    counts,
  };
}
