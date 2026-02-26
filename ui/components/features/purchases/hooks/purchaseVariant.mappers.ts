import type { PurchaseItemVariantDTO } from "@/lib/modules/purchases/purchase.dto";
import type { VariantPick } from "./useMyWarehouseVariantIndex";
import type { VariantMeta } from "./purchaseItemDialog.types";
import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";

function normalizeUnit(u: unknown): SellUnit {
  const s = String(u ?? "").trim().toUpperCase();
  const allowed: SellUnit[] = ["UNIT", "G", "KG", "LB", "ML", "L"];
  return allowed.includes(s as SellUnit) ? (s as SellUnit) : "UNIT";
}

export function pickToVariantMeta(p: VariantPick): VariantMeta {
  const pricingUnit = normalizeUnit(p.pricingUnit);

  return {
    id: p.id,
    sku: p.sku ?? "—",
    barcode: p.barcode ?? null,
    title: p.title ?? p.label ?? null,
    imageUrl: p.imageUrl ?? null,
    isActive: Boolean(p.isActive ?? true),
    productName: p.productName ?? null,

    units: {
      baseUnit: p.baseUnit,
      pricingUnit,
      unitFactor: p.unitFactor ?? null,
    },

    money: {
      costBaseMinor: Number(p.costBaseMinor ?? 0),
      priceBaseMinor: Number(p.priceBaseMinor ?? 0),
    },

    unit: pricingUnit,
  };
}

export function dtoToVariantMeta(v: PurchaseItemVariantDTO): VariantMeta {
  const pricingUnit = normalizeUnit(v.pricingUnit);

  return {
    id: v.id,
    sku: v.sku ?? "—",
    barcode: v.barcode ?? null,
    title: v.title ?? null,
    imageUrl: v.imageUrl ?? null,
    isActive: v.isActive ?? true,
    productName: v.product?.name ?? null,

    units: {
      baseUnit: v.baseUnit,
      pricingUnit,
      unitFactor: v.unitFactor ?? null,
    },

    money: {
      costBaseMinor: Number(v.costBaseMinor ?? 0),
      priceBaseMinor: Number(v.priceBaseMinor ?? 0),
    },

    unit: pricingUnit, // compat
  };
}

