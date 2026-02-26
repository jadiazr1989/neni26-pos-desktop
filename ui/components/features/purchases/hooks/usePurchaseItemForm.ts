// src/modules/purchases/ui/hooks/usePurchaseItemForm.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { parseMoneyToMinor, minorToMoneyString } from "@/lib/money/money";

import type { DraftLine } from "./purchaseDetail.types";
import type { VariantMeta } from "./purchaseItemDialog.types";
import type { VariantPick } from "./useMyWarehouseVariantIndex";
import { usePurchaseReadOnlyPrice } from "./usePurchaseReadOnlyPrice";
import type { SellUnit, Unit } from "@/lib/modules/catalog/products/product.dto";
import { pickToVariantMeta } from "./purchaseVariant.mappers";

import { maxAbsQtyInputExactFromUnitFactor, formatMaxQty } from "@/lib/quantity/limits";

type FormState = { qtyInput: string; cost: string };

type ValidateOk = {
  ok: true;
  value: { qtyInput: string; qtyBaseMinor: number; unitCostBaseMinor: number };
  warn?: string | null;
  maxAbsQty?: number | null;
};
type ValidateErr = { ok: false; error: string; warn?: string | null; maxAbsQty?: number | null };

const MONEY_SCALE = 2;

function clampMin0(n: number): number {
  return n < 0 ? 0 : n;
}

function normalizeQtyInput(raw: string): string {
  return raw.trim().replace(",", ".");
}

function parsePositiveNumber(raw: string): number | null {
  const t = normalizeQtyInput(raw);
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function factorForUnitInput(unit: SellUnit): { baseUnit: Unit; factor: number } | null {
  switch (unit) {
    case "UNIT":
      return { baseUnit: "UNIT", factor: 1 };
    case "G":
      return { baseUnit: "G", factor: 1 };
    case "KG":
      return { baseUnit: "G", factor: 1000 };
    case "LB":
      return { baseUnit: "G", factor: 453.59237 };
    case "ML":
      return { baseUnit: "ML", factor: 1 };
    case "L":
      return { baseUnit: "ML", factor: 1000 };
    default:
      return null;
  }
}

/**
 * qtyBaseMinor = round_half_up(qtyInput * factor)
 * Usamos Math.round como aproximación (tu backend usa HALF_UP con Decimal).
 * Para el límite exacto, usamos maxAbsQtyInputExactFromUnitFactor.
 */
function computeQtyBaseMinor(args: { qtyInput: number; unitInput: SellUnit; variant: VariantMeta | null }): number {
  const { qtyInput, unitInput, variant } = args;
  if (!variant) return 0;

  const m = factorForUnitInput(unitInput);
  if (!m) return 0;

  if (variant.units.baseUnit !== m.baseUnit) return 0;

  return Math.round(qtyInput * m.factor);
}

function getPricingUnitFactorString(variant: VariantMeta | null): string | null {
  // VariantMeta típico: variant.units.unitFactor como string | null (según tu DTO)
  // Si viene como number, lo normalizamos a string
  const uf = variant?.units?.unitFactor as string | number | null | undefined;
  if (uf == null) return null;
  if (typeof uf === "string") return uf;
  if (typeof uf === "number" && Number.isFinite(uf)) return String(uf);
  return null;
}

export function usePurchaseItemForm(args: {
  open: boolean;
  busy: boolean;
  line: DraftLine | null;
  variant: VariantMeta | null;
  picked: VariantPick | null;

  onSave: (patch: Partial<DraftLine>) => void;
  onClose: () => void;
}) {
  const { priceMinor } = usePurchaseReadOnlyPrice({
    line: args.line,
    variant: args.variant,
    picked: args.picked,
  });

  const resolvedVariant = React.useMemo<VariantMeta | null>(() => {
    return args.line?.variant ?? args.variant ?? (args.picked ? pickToVariantMeta(args.picked) : null);
  }, [args.line?.variant, args.variant, args.picked]);

  const [state, setState] = React.useState<FormState>({ qtyInput: "1", cost: "0.00" });

  React.useEffect(() => {
    if (!args.open) return;
    const l = args.line;
    if (!l) return;

    setState({
      qtyInput: String(l.qtyInput ?? "1"),
      cost: minorToMoneyString(l.unitCostBaseMinor ?? 0, { scale: MONEY_SCALE }),
    });
  }, [args.open, args.line]);

  const patch = React.useCallback((p: Partial<FormState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const validate = React.useCallback((): ValidateOk | ValidateErr => {
    if (!args.line) return { ok: false, error: "Sin línea." };

    const qtyN = parsePositiveNumber(state.qtyInput);
    if (qtyN == null) return { ok: false, error: "Cantidad inválida. Debe ser > 0." };

    const costParsed = parseMoneyToMinor(state.cost, { scale: MONEY_SCALE });
    if (!costParsed.ok) return { ok: false, error: `Costo: ${costParsed.error}` };

    const costMinor = clampMin0(costParsed.minor);

    // ✅ límite (idealmente por pricingUnit factor)
    const unitInput = (args.line.unitInput ?? "UNIT") as SellUnit;

    // Caso 1: si el usuario entra en pricingUnit y tenemos unitFactor, límite exacto
    const pricingUnit = resolvedVariant?.units?.pricingUnit as SellUnit | undefined;
    const ufStr = getPricingUnitFactorString(resolvedVariant);
    const isSameAsPricing = pricingUnit && String(unitInput) === String(pricingUnit);

    let maxAbsQty: number | null = null;
    if (isSameAsPricing) {
      maxAbsQty = maxAbsQtyInputExactFromUnitFactor(ufStr);
    }

    if (maxAbsQty != null && qtyN > maxAbsQty) {
      const warn = `Cantidad demasiado grande. Máximo permitido: ${formatMaxQty(maxAbsQty, 3)} ${unitInput}.`;
      return { ok: false, error: warn, warn, maxAbsQty };
    }

    const qtyBaseMinor = computeQtyBaseMinor({
      qtyInput: qtyN,
      unitInput,
      variant: resolvedVariant,
    });

    if (qtyBaseMinor <= 0) {
      return {
        ok: false,
        error: "No se pudo convertir qtyInput a qtyBaseMinor. Falta variant.units o hay mismatch baseUnit/unitInput.",
      };
    }

    return {
      ok: true,
      value: {
        qtyInput: normalizeQtyInput(state.qtyInput),
        qtyBaseMinor,
        unitCostBaseMinor: costMinor,
      },
      maxAbsQty,
      warn: maxAbsQty != null ? `Máximo permitido: ${formatMaxQty(maxAbsQty, 3)} ${unitInput}.` : null,
    };
  }, [args.line, resolvedVariant, state.qtyInput, state.cost]);

  const canSave = React.useMemo(() => {
    if (!args.line) return false;
    if (args.busy) return false;
    return validate().ok;
  }, [args.line, args.busy, validate]);

  const previewLine = React.useMemo(() => {
    const l = args.line;
    if (!l) return null;

    const v = validate();

    const clearServerFields: Partial<DraftLine> = {
      qtyDisplay: null,
      displayUnit: null,
      lineTotalBaseMinor: null,
    };

    if (!v.ok) {
      return {
        ...l,
        ...clearServerFields,
        qtyBaseMinor: 0,
        unitCostBaseMinor: 0,
        unitPriceBaseMinor: priceMinor,
        variant: resolvedVariant ?? l.variant ?? null,
      };
    }

    return {
      ...l,
      ...clearServerFields,
      qtyInput: v.value.qtyInput,
      qtyBaseMinor: v.value.qtyBaseMinor,
      unitCostBaseMinor: v.value.unitCostBaseMinor,
      unitPriceBaseMinor: priceMinor,
      variant: resolvedVariant ?? l.variant ?? null,
    };
  }, [args.line, validate, priceMinor, resolvedVariant]);

  const submit = React.useCallback(() => {
    const v = validate();
    if (!v.ok) {
      notify.warning({ title: "Cantidad inválida", description: v.error });
      return;
    }

    args.onSave({
      qtyInput: v.value.qtyInput,
      qtyBaseMinor: v.value.qtyBaseMinor,
      unitCostBaseMinor: v.value.unitCostBaseMinor,
      variant: args.line?.variant ?? resolvedVariant ?? null,

      qtyDisplay: null,
      displayUnit: null,
      lineTotalBaseMinor: null,
    });

    args.onClose();
  }, [args, validate, resolvedVariant]);

  // ✅ expone límites para UI
  const limitInfo = React.useMemo(() => {
    const v = validate();
    return {
      maxAbsQty: v.ok ? v.maxAbsQty ?? null : v.maxAbsQty ?? null,
      hint: v.ok ? v.warn ?? null : v.warn ?? null,
    };
  }, [validate]);

  return { state, patch, priceMinor, previewLine, canSave, submit, limitInfo };
}