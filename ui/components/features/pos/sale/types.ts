// ui/components/features/pos/sales/types.ts
import type { Unit, SellUnit } from "@/lib/quantity/sellUnit";

export type MoneyMinor = number; // siempre int minor

export type SoldBy = "UNIT" | "MEASURE";
// ui/components/features/pos/sale/types.ts

export type ProductOption = {
  id: string;
  name: string;
  priceDeltaMinor: number;
};

export type ProductOptionGroup = {
  id: string;
  name: string;
  display: "radio" | "checkbox";
  min: number;
  max: number;
  options: ProductOption[];
};

export type LineItemOptionSnapshot = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDeltaMinor: number;
};

export type Product = {
  id: string; // (variantId)
  variantId: string;
  productId: string;
  categoryId: string;

  name: string;

  soldBy: SoldBy;

  // ✅ claves para unidades
  baseUnit: Unit;          // "UNIT" | "G" | "ML"
  pricingUnit: SellUnit;   // "UNIT"|"G"|"KG"|"LB"|"ML"|"L"

  pricePerUnitMinor: number;

  optionGroups: ProductOptionGroup[];
  imageUrl?: string | null;

  // ✅ stock en UI (humano) o baseMinor, pero sé consistente
  availableQty: number;
};


export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

// payload del modal de opciones
export type DetailConfirmPayload = {
  qty: number;
  optionsSnapshot: LineItemOptionSnapshot[];
};
