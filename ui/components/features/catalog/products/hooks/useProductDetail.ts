// src/modules/catalog/products/ui/hooks/useProductDetail.ts
"use client";

import * as React from "react";
import { productService } from "@/lib/modules/catalog/products/product.service";
import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";

type LoadState = "idle" | "loading" | "ready" | "error";

export function useProductDetail(productId: string) {
  const [state, setState] = React.useState<LoadState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [product, setProduct] = React.useState<ProductDTO | null>(null);

  const load = React.useCallback(async () => {
    if (!productId) return;
    setState("loading");
    setError(null);
    try {
      const p = await productService.get(productId);
      setProduct(p);
      setState("ready");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Error cargando producto.");
    }
  }, [productId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { product, state, error, load, setError };
}
