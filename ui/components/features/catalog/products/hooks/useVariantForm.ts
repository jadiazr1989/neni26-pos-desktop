// src/modules/catalog/products/ui/variants/hooks/useVariantForm.ts
"use client";

import * as React from "react";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import type { VariantUnit } from "../variants/variant.constants";
import { normalizeBarcode, parseNonNegInt } from "../variants/variant.parsers";

export type VariantFormState = {
  sku: string;
  barcode: string;
  title: string;
  unit: VariantUnit | "";
  price: string;
  cost: string;
  imageFile: File | null;
};

export type VariantFormOutput = {
  sku: string;
  barcode: string | null;
  title: string | null;
  unit: VariantUnit;
  priceBaseMinor: number;
  costBaseMinor: number;
  imageFile: File | null;
};

export function useVariantForm(args: {
  open: boolean;
  mode: "create" | "edit";
  initial: ProductVariantDTO | null;
}) {
  const [state, setState] = React.useState<VariantFormState>({
    sku: "",
    barcode: "",
    title: "",
    unit: "",
    price: "0",
    cost: "0",
    imageFile: null,
  });

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!args.open) return;

    const v = args.initial;
    setState({
      sku: v?.sku ?? "",
      barcode: v?.barcode ?? "",
      title: v?.title ?? "",
      unit: (v?.unit ?? "") as VariantUnit | "",
      price: v ? String(v.priceBaseMinor) : "0",
      cost: v ? String(v.costBaseMinor) : "0",
      imageFile: null, // siempre null al abrir, como CategoryDialog
    });
    setError(null);
  }, [args.open, args.initial]);

  function patch(p: Partial<VariantFormState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function validate(): { ok: true; value: VariantFormOutput } | { ok: false; error: string } {
    const sku = state.sku.trim();
    if (!sku) return { ok: false, error: "SKU requerido." };

    if (!state.unit) return { ok: false, error: "Unidad requerida." };

    const barcodeNorm = normalizeBarcode(state.barcode);
    if (state.barcode.trim() !== "" && barcodeNorm == null) {
      return { ok: false, error: "Barcode inválido. Usa solo números." };
    }

    const priceMinor = parseNonNegInt(state.price);
    if (priceMinor == null) return { ok: false, error: "Precio inválido. Debe ser entero >= 0." };

    const costMinor = parseNonNegInt(state.cost);
    if (costMinor == null) return { ok: false, error: "Costo inválido. Debe ser entero >= 0." };

    if (costMinor > priceMinor) return { ok: false, error: "Costo no puede ser mayor que precio." };

    const title = state.title.trim() || null;

    return {
      ok: true,
      value: {
        sku,
        barcode: barcodeNorm, // null o string
        title,
        unit: state.unit as VariantUnit,
        priceBaseMinor: priceMinor,
        costBaseMinor: costMinor,
        imageFile: state.imageFile,
      },
    };
  }

  return {
    state,
    patch,
    error,
    setError,
    validate,
  };
}
