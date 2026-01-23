// src/modules/inventory/ui/InventoryAdjustDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import { useInventoryAdjustForm } from "../hooks/useInventoryAdjustForm";
import { useInventoryPreview } from "../hooks/useInventoryPreview";
import { InventoryAdjustLinesEditor } from "./components/InventoryAdjustLinesEditor";
import { InventoryPreviewCard } from "./components/InventoryPreviewCard";

function isNonZeroIntString(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  const n = Number(t);
  return Number.isFinite(n) && Number.isInteger(n) && n !== 0;
}

export function InventoryAdjustDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApplied: () => Promise<void> | void;
  initialVariantId?: string | null;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const disabled = submitting;

  const form = useInventoryAdjustForm({ open: props.open });
  const preview = useInventoryPreview();

  // 1) limpia preview cuando abre/cierra
  React.useEffect(() => {
    if (!props.open) return;
    preview.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open]);

  // 2) limpia preview si cambia algo relevante del form
  React.useEffect(() => {
    if (!props.open) return;
    preview.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.open,
    form.state.reason,
    form.state.referenceId,
    JSON.stringify(
      form.state.lines.map((l) => ({
        id: l.id,
        code: l.code,
        variantId: l.variantId,
        qtyDelta: l.qtyDelta,
        notes: l.notes,
      })),
    ),
  ]);

  // 3) ✅ Prefill de variante al abrir desde tabla
  React.useEffect(() => {
    if (!props.open) return;

    const vid = props.initialVariantId?.trim() ?? "";
    if (!vid) return;

    const first = form.state.lines[0];
    if (!first) return;

    // Si ya está en esa misma variante, no hagas nada
    if (first.variantId.trim() === vid) return;

    // Prellenar: variantId y limpiar error/variant (si quieres)
    form.patchLine(first.id, {
      variantId: vid,
      // code lo dejamos como estaba (normalmente vacío)
      error: null,
      // si quieres obligar a re-resolver el preview visual:
      variant: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, props.initialVariantId]);

  async function onPreview() {
    form.setError(null);
    const v = form.validate();
    if (!v.ok) return form.setError(v.error);

    await preview.run({ reason: v.value.reason, lines: v.value.lines });
  }


  async function onApply() {
    form.setError(null);

    const v = form.validate();
    if (!v.ok) return form.setError(v.error);

    setSubmitting(true);
    try {

      await preview.run({ reason: v.value.reason, lines: v.value.lines });

      await inventoryService.adjust({
        reason: v.value.reason,
        ...(v.value.referenceId ? { referenceId: v.value.referenceId } : {}),
        lines: v.value.lines,
      });


      await props.onApplied();
      props.onOpenChange(false);
    } catch (e: unknown) {
      form.setError(e instanceof Error ? e.message : "No se pudo aplicar el ajuste.");
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Apply NO exige code (porque desde tabla no lo tendrás)
  // - debe tener variantId (resuelto o prefill)
  // - qtyDelta entero != 0
  // - sin error por línea
  const canApply =
    !disabled &&
    form.state.lines.length > 0 &&
    form.state.lines.every((l) => {
      const hasVariant = l.variantId.trim().length > 0;
      const qtyOk = isNonZeroIntString(l.qtyDelta);
      const noLineError = !l.error;
      return hasVariant && qtyOk && noLineError;
    });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ajuste directo de inventario (Admin)</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {form.state.error && <div className="text-sm text-destructive">{form.state.error}</div>}

          <div className="grid gap-2">
            <div className="text-sm font-medium">Razón (opcional)</div>
            <Input
              value={form.state.reason}
              disabled={disabled}
              onChange={(e) => form.patch({ reason: e.target.value })}
              placeholder="Stock recount"
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Reference ID (opcional)</div>
            <Input
              value={form.state.referenceId}
              disabled={disabled}
              onChange={(e) => form.patch({ referenceId: e.target.value })}
              placeholder="optional reference"
            />
          </div>

          <InventoryAdjustLinesEditor
            value={form.state.lines}
            disabled={disabled}
            onChange={(lines) => form.patch({ lines })}
          />

          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" disabled={disabled} onClick={() => void onPreview()}>
              Preview
            </Button>
            <div className="text-xs text-muted-foreground">
              Preview te ayuda a detectar NEGATIVE_INVENTORY antes de aplicar.
            </div>
          </div>

         <InventoryPreviewCard rows={preview.rows} loading={preview.loading} error={preview.error} />
         
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
              Cancelar
            </Button>
            <Button onClick={() => void onApply()} disabled={!canApply}>
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
