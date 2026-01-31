// src/lib/modules/purchases/purchase.dto.ts
export type PurchaseStatus = "DRAFT" | "ORDERED" | "RECEIVED" | "CANCELLED";

export type PurchaseItemDTO = {
  id: string;
  purchaseId: string;
  productVariantId: string;
  quantity: number;
  unitCostBaseMinor: number;
  unitPriceBaseMinor: number | null;
  lineTotalBaseMinor: number;
  createdAt: string;

   variant: {
    id: string;
    sku: string;
    barcode: string | null;
    title: string | null;
    imageUrl: string | null;
    isActive: boolean;
    product: { id: string; name: string };
  } | null;
};

export type PurchaseDTO = {
  id: string;
  warehouseId: string;
  supplierId: string | null;
  status: PurchaseStatus;
  subtotalBaseMinor: number;
  taxBaseMinor: number;
  discountBaseMinor: number;
  totalBaseMinor: number;
  invoiceNumber: string | null;
  notes: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  receivedAt: string | null;
};

export type PurchaseWithItemsDTO = PurchaseDTO & { items: PurchaseItemDTO[] };

export type ListPurchasesResponse = { purchases: PurchaseDTO[] };
export type GetPurchaseResponse = { purchase: PurchaseWithItemsDTO };

export type CreatePurchaseInput = {
  supplierId?: string | null;
  invoiceNumber?: string | null;
  notes?: string | null;
  // warehouseId sale del terminalContext (no lo mandes desde UI)
};

export type CreatePurchaseResponse = {
  purchaseId: string;
  purchase: PurchaseDTO;
};

export type SetPurchaseItemsInput = {
  items: Array<{
    productVariantId: string;
    quantity: number;
    unitCostBaseMinor: number;
    unitPriceBaseMinor?: number | null;
  }>;
};

export type SetPurchaseItemsResponse = { purchase: PurchaseWithItemsDTO };

export type ReceivePurchaseInput = {
  notes?: string | null;
  receivedAt?: string | null; // ISO
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

