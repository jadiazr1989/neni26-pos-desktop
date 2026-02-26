// src/modules/catalog/products/ui/variants/variant.constants.ts
export const VARIANT_UNITS = ["UNIT", "LB", "KG", "L", "ML", "G"] as const;
export type VariantUnit = (typeof VARIANT_UNITS)[number];
