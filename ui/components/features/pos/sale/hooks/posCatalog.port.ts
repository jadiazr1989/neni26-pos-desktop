"use client";

import type { PosCatalogPort } from "./usePosCatalog";
import type { ListPosCatalogQuery, ListPosCatalogResponse } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";

/**
 * ✅ Adapter pattern:
 * Convierte productService en un "port" compatible con el hook.
 */
export const posCatalogPort: PosCatalogPort = {
  listPosCatalog(q: ListPosCatalogQuery): Promise<ListPosCatalogResponse> {
    // asumo que lo agregaste: productService.listForPos(q)
    return productService.listPosCatalog(q);
  },
};
