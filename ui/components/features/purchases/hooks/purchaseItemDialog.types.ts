import type { SellUnit, Unit } from "@/lib/modules/catalog/products/product.dto";

export type VariantUnits = {
  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor: string | null; // baseMinor por 1 pricingUnit (string del backend)
};

export type VariantMoney = {
  costBaseMinor: number;
  priceBaseMinor: number;
};

export type VariantMeta = {
  id: string;
  sku: string;
  barcode: string | null;
  title: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productName: string | null;

  units: VariantUnits;
  money: VariantMoney;

  /**
   * legacy alias (compat)
   * siempre = units.pricingUnit
   */
  unit: SellUnit;
};
