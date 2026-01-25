import { ProductVariantDTO } from "../catalog/products/product.dto";


type ProdutcParent = { id: string; name: string };

// ✅ Esto es lo que VIENE del backend en warehouse stock
export type WarehouseStockRowDTO = {
  warehouseId: string;
  variantId: string;              // ✅ viene como alias en tu API
  quantity: number;
  reservedQuantity: number;
  updatedAt?: string;
  variant: {
    id: string;
    sku: string;
    barcode: string | null;
    title: string | null;
    imageUrl: string | null;
    isActive: boolean;
    product: ProdutcParent;
  };
};

export type WarehouseStockRowUI = {
  variantId: string;              // interno (NO se muestra)
  sku: string;
  title: string | null;
  qty: number;
  isActive: boolean;
  imageUrl: string | null;
  productName: string | null;     // ✅ para UI friendly
};

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

export type InventoryPreviewRowDTO = {
  variantId: string;
  beforeQty: number;
  afterQty: number;
  qtyDelta: number;
  notes?: string | null;
};

export type InventoryPreviewLineDTO = {
  variantId: string;
  beforeQty: number;
  afterQty: number;
  qtyDelta: number;
  notes?: string | null;
};

export type InventoryPreviewResponse = {
  warehouseId: string;
  terminalId: string | null;
  reason: string | null;
  lines: InventoryPreviewLineDTO[];
};


// ✅ acción
export type InventoryAdjustResponse = {
  referenceType: "ADJUSTMENT" | string;
  adjustmentId: string;
  lines: Array<{ variantId: string; beforeQty: number; afterQty: number; qtyDelta: number }>;
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


// src/lib/modules/inventory/inventory.dto.ts

