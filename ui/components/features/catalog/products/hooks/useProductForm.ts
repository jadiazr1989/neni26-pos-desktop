// src/modules/catalog/products/ui/hooks/useProductForm.ts
"use client";

import * as React from "react";
import type { ProductDTO, SellUnit } from "@/lib/modules/catalog/products/product.dto";
import { normalizeOptionalText, normalizeRequiredText } from "@/lib/forms/normalize";

type ProductFormState = {
  name: string;
  barcode: string;
  description: string;
  brandId: string | null;
  categoryId: string | null;

  // ✅ UI selector: pricing unit (lo humano)
  pricingUnit: SellUnit; // UNIT/G/KG/LB/ML/L
};

export type ProductFormValue = {
  name: string;
  barcode: string | null;
  description: string | null;
  brandId: string | null;
  categoryId: string;

  // ✅ lo que consume submitProduct
  pricingUnit: SellUnit;
};

export function useProductForm(args: {
  open: boolean;
  initial?: ProductDTO | null;
  mode: "create" | "edit";
}) {
  const [state, setState] = React.useState<ProductFormState>({
    name: "",
    barcode: "",
    description: "",
    brandId: null,
    categoryId: null,
    pricingUnit: "UNIT",
  });

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!args.open) return;
    const p = args.initial ?? null;

    setState((prev) => ({
      name: p?.name ?? "",
      barcode: p?.barcode ?? "",
      description: p?.description ?? "",
      brandId: p?.brandId ?? null,
      categoryId: p?.categoryId ?? null,

      // ✅ en create decides la unidad de la variante base
      // ✅ en edit NO la tocamos (la unidad real vive en variant)
      pricingUnit: args.mode === "create" ? "UNIT" : prev.pricingUnit,
    }));

    setError(null);
  }, [args.open, args.initial, args.mode]);

  function patch(p: Partial<ProductFormState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function validate(): { ok: true; value: ProductFormValue } | { ok: false; error: string } {
    const name = normalizeRequiredText(state.name);
    if (!name) return { ok: false, error: "Nombre requerido." };

    const categoryId = state.categoryId?.trim() ?? "";
    if (!categoryId) return { ok: false, error: "Categoría requerida." };

    if (args.mode === "create" && !state.pricingUnit) {
      return { ok: false, error: "Unidad requerida." };
    }

    return {
      ok: true,
      value: {
        name,
        barcode: normalizeOptionalText(state.barcode),
        description: normalizeOptionalText(state.description),
        brandId: state.brandId,
        categoryId,
        pricingUnit: state.pricingUnit,
      },
    };
  }

  return { state, patch, error, setError, validate };
}
