// src/lib/modules/catalog/products/product.dto.ts
import type { JsonValue } from "@/lib/types/json";

export type ProductStatus = "active" | "inactive"; // ajusta si tu enum difiere

export type VariantUnit = "UNIT" | "LB" | "KG" | "L" | "ML";

export type ProductVariantDTO = {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  unit: VariantUnit;
  attributes: JsonValue | null;
  imageUrl: string;
  priceBaseMinor: number;
  costBaseMinor: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductDTO = {
  id: string;
  name: string;
  description: string | null;
  barcode: string | null;
  brandId: string | null;
  categoryId: string | null;
  status: ProductStatus | string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDTO[];
};

export type ListProductsResponse = { products: ProductDTO[] };
export type GetProductResponse = { product: ProductDTO };

export type CreateProductInput = {
  name: string;
  description?: string | null;
  barcode?: string | null;
  brandId?: string | null;
  categoryId: string;
  status?: ProductStatus;

  baseUnit: VariantUnit;
};

export type CreateProductResponse = { productId: string; baseVariantId: string };


export type UpdateProductInput = Partial<CreateProductInput>;
export type UpdateProductResponse = { product: { id: string } };

export type DeleteProductResponse = { id: string };

export type CreateVariantInput = {
  sku: string;
  barcode?: string | null;
  title?: string | null;
  attributes: JsonValue | null;        // ✅ required (tu Prisma lo pide)
  unit: VariantUnit;         // ✅ required
  priceBaseMinor: number;
  costBaseMinor: number;
  isActive?: boolean;
};

export type CreateVariantResponse = { variant: { id: string } };
export type UpdateVariantInput = Partial<CreateVariantInput>;
export type UpdateVariantResponse = { variant: { id: string } };

// src/lib/modules/catalog/products/product.dto.ts


// ✅ POS Catalog (Terminal warehouse scoped)

export type PosCatalogRowDTO = {
  variantId: string;

  sku: string;
  barcode: string | null;
  title: string | null;
  imageUrl: string;

  productId: string;
  productName: string;
  productBarcode: string | null;
  categoryId: string;

  unit: VariantUnit;
  priceBaseMinor: number;

  qty: number;
  reservedQty: number;
  availableQty: number;
};

export type ListPosCatalogQuery = {
  categoryId?: string;      // "all" o uuid
  q?: string;               // search
  limit?: number;           // 1..50 (backend)
  cursor?: string | null;   // productVariantId
  inStock?: boolean;        // default true
};

export type ListPosCatalogResponse = {
  rows: PosCatalogRowDTO[];
  nextCursor: string | null;
};
