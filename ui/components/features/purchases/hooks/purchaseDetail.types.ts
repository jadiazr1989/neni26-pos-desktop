// src/modules/purchases/hooks/purchaseDetail.types.ts
import type { PurchaseStatus, PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import type { VariantMeta } from "./purchaseItemDialog.types";
import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";
import type { MoneyStr } from "@/lib/money/moneyStr";

export type DraftLine = {
  productVariantId: string;

  // ✅ NEW contract (input)
  qtyInput: string;
  unitInput: SellUnit;
  qtyBaseMinor: number;

  // ✅ display from backend (optional)
  qtyDisplay?: string | null;
  displayUnit?: SellUnit | null;

  unitCostBaseMinor: number;
  unitPriceBaseMinor: number | null;

  // ✅ total from backend (optional, BigInt string)
  lineTotalBaseMinor?: MoneyStr | null;

  variant: VariantMeta | null;
};

export type PurchaseFlags = {
  status: PurchaseStatus;
  itemsCount: number;
  canSaveItems: boolean;
  canOrder: boolean;
  canReceive: boolean;
  canCancel: boolean;
  showEmptyItemsWarning: boolean;
};

export type PurchaseItemsEditorVm = {
  canEditItems: boolean;
  dirty: boolean;
  lines: DraftLine[];

  syncFromPurchase: (p: PurchaseWithItemsDTO) => void;

  upsertByVariantId: (variantId: string) => void;
  openAdd: (seed?: Partial<DraftLine>) => void;

  removeLine: (idx: number) => void;
  setLine: (idx: number, patch: Partial<DraftLine>) => void;

  saveItems: () => Promise<void>;
};

export type PurchaseReceiveVm = {
  confirmOpen: boolean;
  request: () => void;
  cancel: () => void;
  confirm: () => Promise<void>;
  receiving: boolean;
};

export type PurchaseOrderCancelVm = {
  order: () => Promise<void>;
  cancel: (reason?: string) => Promise<void>;
};

export type PurchaseDetailVm = {
  purchaseId: string;
  purchase: PurchaseWithItemsDTO | null;
  loading: boolean;
  error: string | null;

  goBack: () => void;
  reload: () => Promise<void>;

  flags: PurchaseFlags;

  editor: PurchaseItemsEditorVm;
  receive: PurchaseReceiveVm;
  order: PurchaseOrderCancelVm;
};