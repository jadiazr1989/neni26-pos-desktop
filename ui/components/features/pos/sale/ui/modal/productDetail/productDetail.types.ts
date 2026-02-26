// ui/components/features/pos/sale/ui/modal/productDetail.types.ts
import type { Product, LineItemOptionSnapshot } from "../../../types";

export type DetailProduct = Pick<
  Product,
  "variantId" | "productId" | "name" | "soldBy" | "baseUnit" | "pricingUnit" | "pricePerUnitMinor" | "optionGroups"
>;

export type DetailPayload = {
  qty: number;
  optionsSnapshot: LineItemOptionSnapshot[];
};

export type ProductDetailModalProps = {
  open: boolean;
  product: DetailProduct | null;
  initialQty?: number;
  initialOptionsSnapshot?: LineItemOptionSnapshot[];
  onClose: () => void;
  onConfirm: (payload: DetailPayload) => void;
};
