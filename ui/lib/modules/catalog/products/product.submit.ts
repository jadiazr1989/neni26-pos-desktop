// src/lib/modules/catalog/products/product.submit.ts

import type { SellUnit, Unit } from "./product.dto";
import type { ProductPort } from "./product.port";

// ✅ evita importar ProductFormValue desde UI para romper ciclos
// ✅ UI guarda PRICING UNIT (lo humano), NO baseUnit
export type ProductFormValue = {
  name: string;
  barcode: string | null;
  description: string | null;
  brandId: string | null;
  categoryId: string;

  pricingUnit: SellUnit; // UNIT/G/KG/LB/ML/L
};

function mapUnits(pricingUnit: SellUnit): {
  baseUnit: Unit;
  pricingUnit: SellUnit;
  unitFactor: string;
} {
  switch (pricingUnit) {
    case "UNIT":
      return { baseUnit: "UNIT", pricingUnit: "UNIT", unitFactor: "1" };

    case "G":
      return { baseUnit: "G", pricingUnit: "G", unitFactor: "1" };

    case "KG":
      return { baseUnit: "G", pricingUnit: "KG", unitFactor: "1000" };

    case "LB":
      // ✅ mejor precisión y consistente con tu helper/meta
      return { baseUnit: "G", pricingUnit: "LB", unitFactor: "453.59237" };

    case "ML":
      return { baseUnit: "ML", pricingUnit: "ML", unitFactor: "1" };

    case "L":
      return { baseUnit: "ML", pricingUnit: "L", unitFactor: "1000" };

    default: {
      const _exhaustive: never = pricingUnit;
      throw new Error(`Unsupported pricingUnit: ${_exhaustive}`);
    }
  }
}

export async function submitProduct(args: {
  mode: "create" | "edit";
  productId: string | null;
  value: ProductFormValue;
  service: Pick<ProductPort, "create" | "update">;
}): Promise<{ productId: string; baseVariantId?: string }> {
  if (args.mode === "create") {
    const units = mapUnits(args.value.pricingUnit);

    const created = await args.service.create({
      name: args.value.name,
      barcode: args.value.barcode,
      description: args.value.description,
      brandId: args.value.brandId,
      categoryId: args.value.categoryId,

      // ✅ base variant definition
      baseUnit: units.baseUnit,
      pricingUnit: units.pricingUnit,
      unitFactor: units.unitFactor,
    });

    return created;
  }

  if (!args.productId) throw new Error("productId required for edit");

  // edit: NO tocar unidades (correcto)
  const updated = await args.service.update(args.productId, {
    name: args.value.name,
    barcode: args.value.barcode,
    description: args.value.description,
    brandId: args.value.brandId,
    categoryId: args.value.categoryId,
  });

  return { productId: updated.product.id };
}
