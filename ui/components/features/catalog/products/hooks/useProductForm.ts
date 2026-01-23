"use client";

import * as React from "react";
import type { ProductDTO, VariantUnit } from "@/lib/modules/catalog/products/product.dto";
import { normalizeOptionalText, normalizeRequiredText } from "@/lib/forms/normalize";

type ProductFormState = {
  name: string;
  barcode: string;
  description: string;
  brandId: string | null;
  categoryId: string | null;

  // ✅ siempre existe en state (para create)
  baseUnit: VariantUnit;
};

export type ProductFormValue = {
  name: string;
  barcode: string | null;
  description: string | null;
  brandId: string | null;
  categoryId: string;

  // ✅ required en create (tu submit lo manda)
  baseUnit: VariantUnit;
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
    baseUnit: "UNIT",
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

      // ✅ solo resetea baseUnit cuando es create
      // ✅ si es edit, conserva el valor previo (aunque no se muestre)
      baseUnit: args.mode === "create" ? "UNIT" : prev.baseUnit,
    }));

    setError(null);
  }, [args.open, args.initial, args.mode]);

  function patch(p: Partial<ProductFormState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function validate():
    | { ok: true; value: ProductFormValue }
    | { ok: false; error: string } {
    const name = normalizeRequiredText(state.name);
    if (!name) return { ok: false, error: "Nombre requerido." };

    const categoryId = state.categoryId?.trim() ?? "";
    if (!categoryId) return { ok: false, error: "Categoría requerida." };

    // ✅ si tu UI lo muestra solo en create, igual garantizamos aquí
    if (args.mode === "create" && !state.baseUnit) {
      return { ok: false, error: "Unidad base requerida." };
    }

    return {
      ok: true,
      value: {
        name,
        barcode: normalizeOptionalText(state.barcode),
        description: normalizeOptionalText(state.description),
        brandId: state.brandId,
        categoryId,
        // ✅ en edit no se usa, pero el submitProduct NO lo manda en update
        baseUnit: state.baseUnit,
      },
    };
  }

  return { state, patch, error, setError, validate };
}
