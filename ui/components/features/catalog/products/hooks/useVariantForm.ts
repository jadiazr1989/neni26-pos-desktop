// src/modules/catalog/products/ui/variants/hooks/useVariantForm.ts
"use client";

import * as React from "react";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import type { VariantUnit } from "../variants/variant.constants";
import { normalizeBarcode } from "../variants/variant.parsers";
import { parseMoneyToMinor, minorToMoneyString } from "@/lib/money/money";

export type VariantFormState = {
  sku: string;
  barcode: string;
  title: string;
  unit: VariantUnit | "";
  price: string; // ✅ decimal string (ej "12.05" | "12,05")
  cost: string;  // ✅ decimal string
  imageFile: File | null;
};

export type VariantFormOutput = {
  sku: string;
  barcode: string | null;
  title: string | null;
  unit: VariantUnit;
  attributes: null;
  priceBaseMinor: number; // ✅ int
  costBaseMinor: number;  // ✅ int
  imageFile: File | null;
};

type ValidateResult =
  | { ok: true; value: VariantFormOutput }
  | { ok: false; error: string };

// Por ahora fijo. Si mañana quieres por moneda:
// USD/EUR/CUP -> 2, o CUP -> 0, lo haces paramétrico aquí.
const MONEY_SCALE = 2;

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
    price: "0.00",
    cost: "0.00",
    imageFile: null,
  });

  React.useEffect(() => {
    if (!args.open) return;

    const v = args.initial;

    setState({
      sku: v?.sku ?? "",
      barcode: v?.barcode ?? "",
      title: v?.title ?? "",
      unit: (v?.pricingUnit ?? "") as VariantUnit | "",

      // ✅ viene en minor -> lo mostramos como decimal (ej 12 -> "0.12")
      price: v ? minorToMoneyString(v.priceBaseMinor ?? 0, { scale: MONEY_SCALE }) : "0.00",
      cost: v ? minorToMoneyString(v.costBaseMinor ?? 0, { scale: MONEY_SCALE }) : "0.00",
      imageFile: null,
    });
  }, [args.open, args.initial]);

  function patch(p: Partial<VariantFormState>) {
    setState((s) => ({ ...s, ...p }));
  }

  function validate(): ValidateResult {
    const sku = state.sku.trim();
    if (!sku) return { ok: false, error: "SKU requerido." };

    if (!state.unit) return { ok: false, error: "Unidad requerida." };

    const barcodeNorm = normalizeBarcode(state.barcode);
    if (state.barcode.trim() !== "" && barcodeNorm == null) {
      return { ok: false, error: "Barcode inválido. Usa solo números." };
    }

    const priceParsed = parseMoneyToMinor(state.price, { scale: MONEY_SCALE });
    if (!priceParsed.ok) return { ok: false, error: `Precio: ${priceParsed.error}` };

    const costParsed = parseMoneyToMinor(state.cost, { scale: MONEY_SCALE });
    if (!costParsed.ok) return { ok: false, error: `Costo: ${costParsed.error}` };

    if (costParsed.minor > priceParsed.minor) {
      return { ok: false, error: "Costo no puede ser mayor que precio." };
    }

    const title = state.title.trim() || null;

    if (args.mode === "create" && !state.imageFile) {
      return { ok: false, error: "Imagen requerida para la variante." };
    }

    return {
      ok: true,
      value: {
        sku,
        barcode: barcodeNorm,
        title,
        unit: state.unit as VariantUnit,
        attributes: null,
        priceBaseMinor: priceParsed.minor,
        costBaseMinor: costParsed.minor,
        imageFile: state.imageFile,
      },
    };
  }

  return { state, patch, validate };
}
