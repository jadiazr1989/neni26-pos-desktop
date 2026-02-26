// src/lib/modules/catalog/products/product.dto.ts
import type { JsonValue } from "@/lib/types/json";

export type ProductStatus = "active" | "inactive";

// ✅ Inventario/base unit (fijo)
export type Unit = "UNIT" | "G" | "ML";

// ✅ Venta/pricing unit (lo que ve el humano)
export type SellUnit = "UNIT" | "G" | "KG" | "LB" | "ML" | "L";

// ✅ UI unit (selector viejo) — alias
export type VariantUnit = SellUnit;

// ✅ CREATE product: además de info del producto, manda cómo crear la variante base
export type CreateProductInput = {
  name: string;
  description?: string | null;
  barcode?: string | null;
  brandId?: string | null;
  categoryId: string;
  status?: ProductStatus;

  baseUnit: Unit;
  pricingUnit: SellUnit;

  // ✅ opcional: backend normaliza a "1" si viene vacío
  unitFactor?: string | null;
};

export type CreateProductResponse = { productId: string; baseVariantId: string };

export type UpdateProductInput = {
  name?: string;
  description?: string | null;
  barcode?: string | null;
  brandId?: string | null;
  categoryId?: string | null;
  status?: ProductStatus;
};

export type UpdateProductResponse = { product: { id: string } };
export type DeleteProductResponse = { id: string };

export type CreateVariantInput = {
  sku: string;
  barcode?: string | null;
  title?: string | null;
  attributes?: JsonValue | null;

  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor?: string | null;

  allowedUnitsJson?: JsonValue | null;
  packs?: JsonValue | null;

  // ✅ consistente con backend "pending"
  imageUrl?: string | null;

  priceBaseMinor: number;
  costBaseMinor: number;
  isActive?: boolean;
  isDefault?: boolean;
};

export type CreateVariantResponse = { variant: { id: string } };
export type UpdateVariantInput = Partial<CreateVariantInput>;
export type UpdateVariantResponse = { variant: { id: string } };

export type ProductVariantDTO = {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  title: string | null;

  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor: string | null;

  attributes: JsonValue | null;
  imageUrl: string | null;

  priceBaseMinor: number;
  costBaseMinor: number;
  isActive: boolean;
  isDefault: boolean;

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

// ✅ POS catalog (alineado con tu backend actual listPosCatalog)
export type PosCatalogRowDTO = {
  variantId: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  imageUrl: string | null;

  productId: string;
  productName: string;
  productBarcode: string | null;
  categoryId: string;

  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor: string | null;

  priceBaseMinor: number;

  // ✅ inventario en base minor (como repo listPosCatalog)
  qty: number;
  reservedQty: number;
  availableQty: number;
};

export type ListPosCatalogQuery = {
  categoryId?: string;
  q?: string;
  limit?: number;
  cursor?: string | null;
  inStock?: boolean;
};

export type ListPosCatalogResponse = {
  rows: PosCatalogRowDTO[];
  nextCursor: string | null;
};

export type ListProductsResponse = { products: ProductDTO[] };
export type GetProductResponse = { product: ProductDTO };
