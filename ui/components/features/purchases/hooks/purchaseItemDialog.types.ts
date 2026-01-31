// src/modules/purchases/ui/detail/purchaseItemDialog.types.ts
export type VariantMeta = {
  id: string;               // variantId
  sku: string;
  barcode: string | null;
  title: string | null;
  productName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  unit: string;              // ✅
  priceBaseMinor: number;    // ✅
  costBaseMinor: number;
};
