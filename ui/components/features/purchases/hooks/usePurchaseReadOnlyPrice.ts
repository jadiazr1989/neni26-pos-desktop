// src/modules/purchases/ui/hooks/usePurchaseReadOnlyPrice.ts
"use client";

import * as React from "react";
import type { DraftLine } from "./purchaseDetail.types";
import type { VariantMeta } from "./purchaseItemDialog.types";
import type { VariantPick } from "./useMyWarehouseVariantIndex";

type HasPrice = { priceBaseMinor?: number | null };

function resolveReadOnlyPriceMinor(
  line: DraftLine | null,
  variant: VariantMeta | null,
  picked: VariantPick | null,
): number | null {
  if (line?.unitPriceBaseMinor != null) {
    const n = Number(line.unitPriceBaseMinor);
    return Number.isFinite(n) ? n : null;
  }

  const vAny = variant as unknown as HasPrice | null;
  const pAny = picked as unknown as HasPrice | null;

  const fromVariant = vAny?.priceBaseMinor;
  if (typeof fromVariant === "number" && Number.isFinite(fromVariant)) return fromVariant;

  const fromPicked = pAny?.priceBaseMinor;
  if (typeof fromPicked === "number" && Number.isFinite(fromPicked)) return fromPicked;

  return null;
}

export function usePurchaseReadOnlyPrice(args: {
  line: DraftLine | null;
  variant: VariantMeta | null;
  picked: VariantPick | null;
}) {
  const { line, variant, picked } = args;
  const priceMinor = resolveReadOnlyPriceMinor(line, variant, picked);
  return { priceMinor };
}

