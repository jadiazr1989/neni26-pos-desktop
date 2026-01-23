import { ProductVariantDTO } from "../catalog/products/product.dto";

// src/lib/modules/inventory/inventory.dto.ts
export type InventoryAdjustLineInput = {
  variantId: string;
  qtyDelta: number;
  notes?: string | null;
};

export type InventoryAdjustInput = {
  reason?: string | null;
  referenceId?: string;
  lines: InventoryAdjustLineInput[];
};

// ✅ acción
export type InventoryAdjustResponse = {
  referenceType: "ADJUSTMENT" | string;
  adjustmentId: string;
  lines: Array<{ variantId: string; beforeQty: number; afterQty: number; qtyDelta: number }>;
};

// ✅ lectura (preview -> rows)
export type InventoryPreviewRowDTO = {
  variantId: string;
  beforeQty: number;
  afterQty: number;
  qtyDelta: number;
  notes?: string | null;
};

export type InventoryPreviewResponse = {
  rows: InventoryPreviewRowDTO[];
};

export type InventoryAdjustmentRequestResponse = {
  adjustment: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    items: Array<{ productVariantId: string; qtyDelta: number; notes?: string | null }>;
  };
};

export type InventoryAdjustmentReviewResponse = {
  adjustment: { id: string; status: "APPROVED" | "REJECTED" | string };
  applied?: { referenceId: string } | null;
};

// ✅ lecturas -> rows
export type WarehouseStockRowDTO = {
  warehouseId: string;
  productVariantId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt?: string;
};

export type GetWarehouseStockResponse = {
  rows: WarehouseStockRowDTO[];
  nextCursor: string | null;
};

export type VariantStockRowDTO = {
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
};

export type GetVariantStockResponse = {
  rows: VariantStockRowDTO[];
};

export type InventoryMovementDTO = {
  id: string;
  warehouseId: string;
  productVariantId: string;
  type: string;
  quantityDelta: number;
  reason: string | null;
  referenceType: string | null;
  referenceId: string | null;
  saleId?: string | null;
  createdAt: string;
};

export type ListMovementsQuery = {
  warehouseId?: string | null;
  variantId?: string | null;
  type?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  limit?: number;
  cursor?: string | null;
};

export type ListMovementsResponse = {
  rows: InventoryMovementDTO[];
  nextCursor: string | null;
};

export type ResolvedVariantUI = Pick<ProductVariantDTO, "id" | "sku" | "barcode" | "title" | "imageUrl">;

export type InventoryAdjustLineUI = {
  id: string;
  variantId: string;
  code: string;
  qtyDelta: string;
  notes: string;
  variant: ResolvedVariantUI | null;
  error: string | null;
};

// src/modules/inventory/ui/types.ts
export type WarehouseStockRowUI = {
  variantId: string;
  sku: string;
  title: string | null;
  qty: number;
  isActive: boolean;
};
