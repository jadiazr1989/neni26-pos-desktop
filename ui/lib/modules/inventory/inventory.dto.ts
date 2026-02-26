// src/lib/modules/inventory/inventory.dto.ts

import type { ProductVariantDTO, Unit, SellUnit } from "../catalog/products/product.dto";

type ProductParent = { id: string; name: string };

/**
 * ✅ Warehouse stock row (backend -> frontend)
 * quantity/reservedQuantity are ALWAYS baseMinor:
 * - UNIT: pieces (1 = 1 unit)
 * - G: grams   (1 = 1g)
 * - ML: ml     (1 = 1ml)
 */
export type WarehouseStockRowDTO = {
  warehouseId: string;

  /**
   * Alias in your API (points to ProductVariant.id).
   * Some APIs return this as productVariantId; normalize to variantId in the controller.
   */
  variantId: string;

  quantity: number; // ✅ baseMinor
  reservedQuantity: number; // ✅ baseMinor
  updatedAt?: string;

  variant: {
    id: string;
    sku: string;
    barcode: string | null;
    title: string | null;
    imageUrl: string | null;
    isActive: boolean;

    product: ProductParent;

    // ✅ units model (replaces old `unit`)
    baseUnit: Unit; // UNIT | G | ML
    pricingUnit: SellUnit; // UNIT | G | KG | LB | ML | L
    unitFactor: string | null; // "1000" | "453.59237" | "1" | null

    priceBaseMinor: number;
    costBaseMinor: number;
  };
};

/**
 * ✅ UI-friendly row for inventory tables/dialogs
 * qtyBaseMinor is still baseMinor (pieces / grams / ml).
 */
export type WarehouseStockRowUI = {
  variantId: string;
  sku: string;
  title: string | null;
  barcode: string | null;
  qtyBaseMinor: number;
  reservedBaseMinor?: number;
  availableBaseMinor?: number;

  isActive: boolean;
  imageUrl: string | null;
  productName: string | null;

  baseUnit: Unit;
  unitFactor: string | null;
  pricingUnit: SellUnit;

  priceBaseMinor?: number;
  costBaseMinor?: number;

  // ✅ display (pricingUnit)
  qtyDisplay?: string;       // e.g. "12.50 KG"
  reservedDisplay?: string;  // e.g. "1.00 KG"
  availableDisplay?: string; // e.g. "11.50 KG"
};


// src/lib/modules/inventory/inventory.dto.ts

export type InventoryDeltaSign = "IN" | "OUT";

// ✅ soporta legacy (qtyDelta) + new contract (qtyInput/unitInput/deltaSign)
export type InventoryAdjustLineInput =
  | {
    variantId: string;
    qtyDelta: number; // legacy baseMinor
    notes?: string | null;
  }
  | {
    variantId: string;
    qtyInput: string | number; // user qty (e.g. "0.5")
    unitInput: SellUnit;       // UNIT | G | KG | LB | ML | L
    deltaSign: InventoryDeltaSign;
    notes?: string | null;
  };

export type GetWarehouseStockResponse = {
  rows: WarehouseStockRowDTO[];
  nextCursor: string | null;
};

export type VariantStockRowDTO = {
  warehouseId: string;
  quantity: number; // baseMinor
  reservedQuantity: number; // baseMinor
};

export type GetVariantStockResponse = {
  rows: VariantStockRowDTO[];
};

export type InventoryAdjustInput = {
  reason?: string | null;
  referenceId?: string;
  lines: InventoryAdjustLineInput[];
};

export type InventoryPreviewLineDTO = {
  variantId: string;
  beforeQty: number; // baseMinor
  afterQty: number;  // baseMinor
  qtyDelta: number;  // baseMinor
  notes?: string | null;

  // ✅ UI display (pricingUnit)
  displayUnit?: SellUnit;        // "LB" | "KG" | "L" | ...
  beforeDisplay?: string;        // "75.02"
  afterDisplay?: string;         // "98.02"
  deltaDisplay?: string;         // "+23.00"
};


export type InventoryPreviewRowDTO = InventoryPreviewLineDTO;

export type InventoryPreviewResponse = {
  warehouseId: string;
  terminalId: string | null;
  reason: string | null;
  rows: InventoryPreviewLineDTO[];
};

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

export type InventoryMovementDTO = {
  id: string;
  warehouseId: string;
  productVariantId: string;
  type: string;
  quantityDelta: number; // baseMinor
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

  // resolved variant
  variantId: string;

  // user input (sku/barcode typed)
  code: string;

  /**
   * qtyDelta string typed in UI (must parse to int baseMinor).
   * IMPORTANT: this represents baseMinor, not "KG/LB/L" etc.
   */
  qtyDelta: string;

  notes: string;
  variant: ResolvedVariantUI | null;
  error: string | null;
};
