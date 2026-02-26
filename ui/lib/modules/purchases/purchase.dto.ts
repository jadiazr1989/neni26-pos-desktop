// src/lib/modules/purchases/purchase.dto.ts
import type { Unit, SellUnit } from "../catalog/products/product.dto";
import type { MoneyStr } from "@/lib/money/moneyStr";

export type PurchaseStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

export type PurchaseItemDTO = {
  id: string;
  purchaseId: string;
  productVariantId: string;

  // ✅ NEW contract
  qtyInput: string;       // "0.5"
  unitInput: SellUnit;    // "KG" | "LB" | ...
  qtyBaseMinor: number;   // baseMinor int
  displayUnit: SellUnit;  // normalmente pricingUnit
  qtyDisplay: string;     // "0.50" (ya calculado por backend)

  unitCostBaseMinor: number;
  unitPriceBaseMinor: number | null;

  // ✅ BigInt -> string
  lineTotalBaseMinor: MoneyStr;

  createdAt: string;

  variant?: {
    id: string;
    sku: string;
    barcode: string | null;
    title: string | null;
    imageUrl: string | null;
    isActive: boolean;
    product: { id: string; name: string };

    baseUnit: Unit;
    pricingUnit: SellUnit;
    unitFactor: string | null;
    allowedUnitsJson?: unknown | null;

    costBaseMinor: number;
    priceBaseMinor: number;
  } | null;
};

export type PurchaseDTO = {
  id: string;
  warehouseId: string;
  supplierId: string | null;
  status: PurchaseStatus;

  // ✅ BigInt -> string
  subtotalBaseMinor: MoneyStr;
  taxBaseMinor: MoneyStr;
  discountBaseMinor: MoneyStr;
  totalBaseMinor: MoneyStr;

  invoiceNumber: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  receivedAt: string | null;
};

export type PurchaseWithItemsDTO = PurchaseDTO & { items: PurchaseItemDTO[] };

export type GetPurchaseResponse = { purchase: PurchaseWithItemsDTO };

export type PurchaseItemVariantDTO = {
  id: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  imageUrl: string | null;
  isActive: boolean;
  product: { id: string; name: string };

  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor: string | null;

  priceBaseMinor: number;
  costBaseMinor: number;
};

export type ListPurchasesResponse = { purchases: PurchaseDTO[] };

export type CreatePurchaseInput = {
  supplierId?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
};

export type CreatePurchaseResponse = {
  purchaseId: string;
  purchase: PurchaseDTO;
};

export type SetPurchaseItemsInput = {
  items: Array<{
    productVariantId: string;

    qtyInput: string;
    unitInput: SellUnit;

    unitCostBaseMinor: number;
    unitPriceBaseMinor?: number | null;
  }>;
};

export type SetPurchaseItemsResponse = { purchase: PurchaseWithItemsDTO };

export type ReceivePurchaseInput = {
  notes?: string | null;
  receivedAt?: string | null;
};

export type ReceivePurchaseResponse = { purchase: PurchaseWithItemsDTO };

export type ListPurchasesQuery = {
  search?: string;
  status?: PurchaseStatus;
  warehouseId?: string;

  from?: string;
  to?: string;
  take?: number;
  skip?: number;
};

export type OrderPurchaseResponse = { purchase: PurchaseDTO };
export type CancelPurchaseResponse = { purchase: PurchaseDTO };

export type CancelPurchaseInput = {
  reason?: string | null;
};