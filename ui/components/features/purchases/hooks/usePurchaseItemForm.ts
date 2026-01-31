// src/modules/purchases/ui/hooks/usePurchaseItemForm.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { parseMoneyToMinor, minorToMoneyString } from "@/lib/money/money";

import type { DraftLine } from "./purchaseDetail.types";
import type { VariantMeta } from "./purchaseItemDialog.types";
import type { VariantPick } from "./useMyWarehouseVariantIndex";
import { usePurchaseReadOnlyPrice } from "./usePurchaseReadOnlyPrice";

type FormState = {
  qty: string;   // entero string
  cost: string;  // decimal string ("12.05" | "12,05")
};

type ValidateOk = {
  ok: true;
  value: { quantity: number; unitCostBaseMinor: number };
};

type ValidateErr = { ok: false; error: string };

const MONEY_SCALE = 2; // si CUP(0) -> hazlo param

function asIntStrict(v: string): number | null {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function clampMin0(n: number): number {
  return n < 0 ? 0 : n;
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

  const [state, setState] = React.useState<FormState>({ qty: "1", cost: "0.00" });

  // seed al abrir
  React.useEffect(() => {
    if (!args.open) return;
    const l = args.line;
    if (!l) return;

    setState({
      qty: String(l.quantity ?? 1),
      cost: minorToMoneyString(l.unitCostBaseMinor ?? 0, { scale: MONEY_SCALE }),
    });
  }, [args.open, args.line]);

  const patch = React.useCallback((p: Partial<FormState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const validate = React.useCallback((): ValidateOk | ValidateErr => {
    const qtyN = asIntStrict(state.qty);
    if (qtyN == null || qtyN <= 0) return { ok: false, error: "Cantidad inválida. Debe ser > 0." };

    const costParsed = parseMoneyToMinor(state.cost, { scale: MONEY_SCALE });
    if (!costParsed.ok) return { ok: false, error: `Costo: ${costParsed.error}` };

    const costMinor = clampMin0(costParsed.minor);

    return { ok: true, value: { quantity: qtyN, unitCostBaseMinor: costMinor } };
  }, [state.qty, state.cost]);

  const canSave = React.useMemo(() => {
    if (!args.line) return false;
    if (args.busy) return false;
    const v = validate();
    return v.ok;
  }, [args.line, args.busy, validate]);

  // preview para totales
  const previewLine = React.useMemo(() => {
    const l = args.line;
    if (!l) return null;

    const v = validate();
    if (!v.ok) {
      // si inválido, devolvemos algo “seguro” para UI
      return { ...l, quantity: 0, unitCostBaseMinor: 0, unitPriceBaseMinor: priceMinor };
    }

    return {
      ...l,
      quantity: v.value.quantity,
      unitCostBaseMinor: v.value.unitCostBaseMinor,
      unitPriceBaseMinor: priceMinor, // readonly
    };
  }, [args.line, validate, priceMinor]);

  const submit = React.useCallback(() => {
    const v = validate();
    if (!v.ok) {
      notify.error({ title: "Validación", description: v.error });
      return;
    }

    args.onSave({
      quantity: v.value.quantity,
      unitCostBaseMinor: v.value.unitCostBaseMinor,
      // ✅ NO tocamos unitPriceBaseMinor
    });

    args.onClose();
  }, [args, validate]);

  return {
    state,
    patch,

    priceMinor, // readonly (catálogo)
    previewLine,
    canSave,

    submit,
  };
}
