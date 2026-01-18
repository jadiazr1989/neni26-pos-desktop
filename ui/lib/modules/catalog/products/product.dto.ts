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
  categoryId?: string | null;
  status?: ProductStatus;
};

export type CreateProductResponse = { productId: string };

export type UpdateProductInput = Partial<CreateProductInput>;
export type UpdateProductResponse = { product: { id: string } };

export type DeleteProductResponse = { id: string };

export type CreateVariantInput = {
  sku: string;
  barcode?: string | null;
  title?: string | null;
  attributes?: JsonValue | null;        // ✅ required (tu Prisma lo pide)
  unit: VariantUnit;         // ✅ required
  priceBaseMinor: number;
  costBaseMinor: number;
  isActive?: boolean;
};

export type CreateVariantResponse = { variant: { id: string } };
export type UpdateVariantInput = Partial<CreateVariantInput>;
export type UpdateVariantResponse = { variant: { id: string } };

// src/lib/modules/catalog/products/product.dto.ts


