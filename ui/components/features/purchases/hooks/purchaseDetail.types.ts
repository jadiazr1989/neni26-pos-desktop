import type { PurchaseStatus, PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import { VariantMeta } from "./purchaseItemDialog.types";

export type DraftLine = {
    productVariantId: string;
    quantity: number;
    unitCostBaseMinor: number;
    unitPriceBaseMinor: number | null;

    variant?: VariantMeta | null;
};

export type PurchaseFlags = {
    status: PurchaseStatus;
    itemsCount: number;
    canSaveItems: boolean; // DRAFT + dirty
    canOrder: boolean;     // DRAFT + itemsCount>0 + !dirty
    canReceive: boolean;   // ORDERED + itemsCount>0 + !dirty
    canCancel: boolean;    // != RECEIVED
    showEmptyItemsWarning: boolean; // DRAFT/ORDERED + itemsCount===0
};

export type PurchaseItemsEditorVm = {
    canEditItems: boolean;
    dirty: boolean;
    lines: DraftLine[];

    syncFromPurchase: (p: PurchaseWithItemsDTO) => void;

    // POS helpers
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
    cancel: (reason?: string) => Promise<void>; // ✅ sin null
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
