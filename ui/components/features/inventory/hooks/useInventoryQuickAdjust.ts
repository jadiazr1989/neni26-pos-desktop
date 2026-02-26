// src/modules/inventory/ui/hooks/useInventoryQuickAdjust.ts
"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";

import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";
import type {
  InventoryAdjustLineInput,
  InventoryPreviewLineDTO,
  InventoryDeltaSign,
} from "@/lib/modules/inventory/inventory.dto";

import { maxAbsQtyInputExactFromUnitFactor, formatMaxQty } from "@/lib/quantity/limits";

// Conflicts (backend los manda como reason en error tipo conflict)
type InventoryConflictReason =
  | "NEGATIVE_INVENTORY"
  | "WAREHOUSE_CLOSED"
  | "INSUFFICIENT_PERMISSION"
  | "WAREHOUSE_INACTIVE";

function isInventoryConflict(e: unknown, reason: InventoryConflictReason): boolean {
  return isApiHttpError(e) && e.reason === reason;
}

// Validations (backend manda code="VALIDATION_ERROR" y reason=XXXX)
type InventoryValidationReason =
  | "QTY_DELTA_MUST_BE_INT"
  | "QTY_DELTA_OUT_OF_RANGE"
  | "QTY_DELTA_TOO_LARGE"
  | "QTY_INPUT_INVALID"
  | "UNIT_INPUT_INVALID"
  | "WAREHOUSE_ID_REQUIRED"
  | "VARIANT_NOT_FOUND"
  | "WAREHOUSE_NOT_FOUND";

function normalizeNotes(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

// "+0.5" | "-2" | "3.25" => absQty + sign (+ también acepta coma)
function parseSignedQtyInput(raw: string): { absQty: string; sign: InventoryDeltaSign; signed: number } | null {
  const t = String(raw ?? "").trim().replace(",", ".");
  if (!t) return null;

  const n = Number(t);
  if (!Number.isFinite(n) || n === 0) return null;

  const sign: InventoryDeltaSign = n > 0 ? "IN" : "OUT";
  return { absQty: String(Math.abs(n)), sign, signed: n };
}

function mapInventoryApiError(e: unknown): { uiTitle: string; uiMsg: string; kind: "error" | "warning" } {
  if (!isApiHttpError(e)) {
    const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado.";
    return { uiTitle: "Error", uiMsg: msg, kind: "error" };
  }

  const code = String(e.code ?? "");
  const reason = String(e.reason ?? "");
  const message = e.message ?? "No se pudo completar la operación.";

  // 1) Conflicts por reason
  if (reason === "NEGATIVE_INVENTORY") {
    return { uiTitle: "No permitido", uiMsg: "No se puede dejar el stock en negativo.", kind: "warning" };
  }
  if (reason === "WAREHOUSE_CLOSED") {
    return { uiTitle: "Caja cerrada", uiMsg: "No se puede ajustar inventario con caja cerrada.", kind: "warning" };
  }
  if (reason === "INSUFFICIENT_PERMISSION") {
    return { uiTitle: "Sin permisos", uiMsg: "No tienes permisos para ajustar inventario.", kind: "warning" };
  }
  if (reason === "WAREHOUSE_INACTIVE") {
    return { uiTitle: "Almacén inactivo", uiMsg: "El almacén está inactivo. No se puede ajustar.", kind: "warning" };
  }

  // 2) Validations
  if (code === "VALIDATION_ERROR") {
    const vr = reason as InventoryValidationReason;

    switch (vr) {
      case "QTY_DELTA_MUST_BE_INT":
        return {
          uiTitle: "Cantidad inválida",
          uiMsg: "Para ajustes, la cantidad debe convertirse a un entero en base (baseMinor).",
          kind: "warning",
        };

      case "QTY_DELTA_OUT_OF_RANGE":
        return {
          uiTitle: "Cantidad demasiado grande",
          uiMsg: "El ajuste excede el rango permitido. Reduce la cantidad.",
          kind: "warning",
        };

      case "QTY_DELTA_TOO_LARGE":
        return {
          uiTitle: "Cantidad excede el límite",
          uiMsg: "El ajuste supera el límite de negocio configurado. Reduce la cantidad.",
          kind: "warning",
        };

      case "UNIT_INPUT_INVALID":
        return {
          uiTitle: "Unidad inválida",
          uiMsg: "La unidad de esta variante no es válida. Revisa el catálogo (pricingUnit).",
          kind: "warning",
        };

      case "QTY_INPUT_INVALID":
        return {
          uiTitle: "Cantidad inválida",
          uiMsg: "La cantidad ingresada no es válida. Revisa el formato.",
          kind: "warning",
        };

      case "WAREHOUSE_ID_REQUIRED":
        return {
          uiTitle: "Falta almacén",
          uiMsg: "No se encontró warehouseId en el contexto del terminal. Reabre la pantalla o selecciona un almacén.",
          kind: "warning",
        };

      case "WAREHOUSE_NOT_FOUND":
        return { uiTitle: "Almacén no existe", uiMsg: "El almacén no fue encontrado.", kind: "warning" };

      case "VARIANT_NOT_FOUND":
        return { uiTitle: "Variante no existe", uiMsg: "La variante no fue encontrada.", kind: "warning" };

      default:
        return {
          uiTitle: "Datos inválidos",
          uiMsg: "Hay un problema con los datos enviados. Revisa e intenta otra vez.",
          kind: "warning",
        };
    }
  }

  return { uiTitle: "Error", uiMsg: message, kind: "error" };
}

function mkRangeMessage(maxAbs: number, unit: SellUnit) {
  return `Cantidad demasiado grande. Máximo permitido: ±${formatMaxQty(maxAbs, 3)} ${unit}.`;
}

export function useInventoryQuickAdjust(params: {
  open: boolean;
  variantId: string;
  defaultUnit: SellUnit | null; // fuente única de unidad (pricingUnit)
  unitFactor: string | null; // ✅ baseMinor por 1 pricingUnit (mismo concepto backend)
}) {
  const vid = params.variantId.trim();

  const [submitting, setSubmitting] = React.useState(false);

  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [qtyInput, setQtyInput] = React.useState(""); // signed string

  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [preview, setPreview] = React.useState<InventoryPreviewLineDTO[] | null>(null);
  const [previewErr, setPreviewErr] = React.useState<string | null>(null);

  const [negBlocked, setNegBlocked] = React.useState(false);

  // ✅ calculo de limite por unitFactor (exact HALF_UP)
  const maxAbsQty = React.useMemo(() => {
    return maxAbsQtyInputExactFromUnitFactor(params.unitFactor);
  }, [params.unitFactor]);

  const reset = React.useCallback(() => {
    setReason("");
    setNotes("");
    setQtyInput("");
    setPreviewLoading(false);
    setPreview(null);
    setPreviewErr(null);
    setNegBlocked(false);
    setSubmitting(false);
  }, []);

  React.useEffect(() => {
    if (!params.open) return;
    reset();
  }, [params.open, vid, reset]);

  // qty changes => invalidate preview
  React.useEffect(() => {
    if (!params.open) return;
    setNegBlocked(false);
    setPreviewErr(null);
    setPreview(null);
  }, [qtyInput, params.open]);

  const built = React.useMemo(() => {
    if (!vid) return { line: null as InventoryAdjustLineInput | null, missingUnit: false, signed: null as number | null };

    const unit = params.defaultUnit;
    if (!unit) return { line: null as InventoryAdjustLineInput | null, missingUnit: true, signed: null as number | null };

    const parsed = parseSignedQtyInput(qtyInput);
    if (!parsed) return { line: null as InventoryAdjustLineInput | null, missingUnit: false, signed: null as number | null };

    const notesNorm = normalizeNotes(notes);

    const line: InventoryAdjustLineInput = {
      variantId: vid,
      qtyInput: parsed.absQty,
      unitInput: unit,
      deltaSign: parsed.sign,
      ...(notesNorm ? { notes: notesNorm } : {}),
    };

    return { line, missingUnit: false, signed: parsed.signed };
  }, [vid, qtyInput, notes, params.defaultUnit]);

  function checkLocalRange(): string | null {
    // si no hay factor, no podemos validar rango local
    if (maxAbsQty == null) return null;
    if (built.signed == null) return null;

    const unit = params.defaultUnit;
    if (!unit) return null;

    if (Math.abs(built.signed) > maxAbsQty) {
      return mkRangeMessage(maxAbsQty, unit);
    }
    return null;
  }

  async function runPreview(): Promise<InventoryPreviewLineDTO[] | null> {
    setPreviewErr(null);
    setPreview(null);

    if (built.missingUnit) {
      const msg = "Esta variante no tiene pricingUnit. Revisa el catálogo.";
      setPreviewErr(msg);
      notify.error({ title: "Config inválida", description: msg });
      return null;
    }

    if (!built.line) return null;

    // ✅ rango local ANTES de API (evita int32 out of range)
    const rangeMsg = checkLocalRange();
    if (rangeMsg) {
      setPreviewErr(rangeMsg);
      notify.warning({ title: "Cantidad fuera de rango", description: rangeMsg });
      return null;
    }

    setPreviewLoading(true);
    try {
      const res = await inventoryService.previewAdjustment({
        reason: reason.trim() ? reason.trim() : null,
        lines: [built.line],
      });

      if (res.rows.some((l) => l.afterQty < 0)) {
        setNegBlocked(true);
        const msg = "No se puede dejar el stock en negativo.";
        setPreviewErr(msg);
        notify.warning({ title: "No permitido", description: msg });
        return null;
      }

      setNegBlocked(false);
      setPreview(res.rows);
      return res.rows;
    } catch (e: unknown) {
      const mapped = mapInventoryApiError(e);

      if (isInventoryConflict(e, "NEGATIVE_INVENTORY")) {
        setNegBlocked(true);
        setPreview(null);
        setPreviewErr(mapped.uiMsg);
        notify.warning({ title: mapped.uiTitle, description: mapped.uiMsg });
        return null;
      }

      setNegBlocked(false);
      setPreview(null);
      setPreviewErr(mapped.uiMsg);

      if (mapped.kind === "warning") notify.warning({ title: mapped.uiTitle, description: mapped.uiMsg });
      else notify.error({ title: mapped.uiTitle, description: mapped.uiMsg });

      return null;
    } finally {
      setPreviewLoading(false);
    }
  }

  async function apply(onApplied?: () => Promise<void> | void) {
    if (built.missingUnit) {
      notify.error({ title: "Config inválida", description: "La variante no tiene pricingUnit. Revisa el catálogo." });
      return;
    }

    if (!built.line) {
      notify.warning({ title: "Revisa", description: "Cantidad requerida (distinta de 0)." });
      return;
    }

    if (negBlocked) {
      notify.warning({ title: "No permitido", description: "Este ajuste dejaría stock en negativo." });
      return;
    }

    if (!preview?.length) {
      notify.warning({ title: "Preview requerido", description: "Haz Preview primero para validar el ajuste." });
      return;
    }

    // ✅ rango local ANTES de API (por si cambió qty sin preview)
    const rangeMsg = checkLocalRange();
    if (rangeMsg) {
      setPreviewErr(rangeMsg);
      notify.warning({ title: "Cantidad fuera de rango", description: rangeMsg });
      return;
    }

    setSubmitting(true);
    try {
      await inventoryService.adjust({
        reason: reason.trim() ? reason.trim() : null,
        lines: [built.line],
      });

      notify.success({ title: "Inventario actualizado", description: "Ajuste aplicado." });
      await onApplied?.();
    } catch (e: unknown) {
      const mapped = mapInventoryApiError(e);

      if (isInventoryConflict(e, "NEGATIVE_INVENTORY")) {
        setNegBlocked(true);
        setPreview(null);
        setPreviewErr(mapped.uiMsg);
        notify.warning({ title: mapped.uiTitle, description: mapped.uiMsg });
        return;
      }

      notify[mapped.kind]({ title: mapped.uiTitle, description: mapped.uiMsg });
    } finally {
      setSubmitting(false);
    }
  }

  const rangeMsg = checkLocalRange();
  const canPreview = !!built.line && !previewLoading && !submitting && !built.missingUnit && !rangeMsg;
  const canApply = canPreview && !!preview?.length && !negBlocked && !rangeMsg;

  return {
    reason,
    setReason,
    notes,
    setNotes,
    qtyInput,
    setQtyInput,

    preview,
    previewErr,
    previewLoading,

    negBlocked,

    runPreview,
    apply,
    reset,

    submitting,
    canPreview,
    canApply,

    // para UI
    pricingUnit: params.defaultUnit,
    maxAbsQty, // ✅ para mostrar "máximo permitido" en el dialog
    rangeMsg,  // ✅ si quieres pintarlo debajo del input
  };
}