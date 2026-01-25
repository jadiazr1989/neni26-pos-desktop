"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityAvatar } from "@/components/shared/EntityAvatar";

import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";

import type { InventoryPreviewLineDTO, WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";
import { InventoryPreviewCard } from "./components/InventoryPreviewCard";
import { displayVariantTitle, isNonZeroIntString } from "@/lib/utils";


type InventoryConflictReason =
  | "NEGATIVE_INVENTORY"
  | "WAREHOUSE_CLOSED"
  | "INSUFFICIENT_PERMISSION";

function isInventoryConflict(e: unknown, reason: InventoryConflictReason): boolean {
  if (!isApiHttpError(e)) return false;
  return e.reason === reason;
}

export function InventoryQuickAdjustDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApplied: () => Promise<void> | void;
  row: WarehouseStockRowUI | null;
}) {
  const row = props.row;
  const vid = row?.variantId?.trim() ?? "";

  const [submitting, setSubmitting] = React.useState(false);

  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [delta, setDelta] = React.useState("");

  const [preview, setPreview] = React.useState<InventoryPreviewLineDTO[] | null>(null);
  const [previewErr, setPreviewErr] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);

  // ✅ bloque por negativo
  const [negBlocked, setNegBlocked] = React.useState(false);

  React.useEffect(() => {
    if (!props.open) return;
    setReason("");
    setNotes("");
    setDelta("");
    setPreview(null);
    setPreviewErr(null);
    setPreviewLoading(false);
    setNegBlocked(false);
  }, [props.open]);

  // Si cambia la row mientras está abierto, limpia preview/bloqueo
  React.useEffect(() => {
    if (!props.open) return;
    setPreview(null);
    setPreviewErr(null);
    setNegBlocked(false);
  }, [props.open, row?.variantId]);

  // ✅ si el usuario cambia delta, desbloquea para recalcular
  React.useEffect(() => {
    if (!props.open) return;
    setNegBlocked(false);
    setPreviewErr(null);
    setPreview(null);
  }, [delta, props.open]);

  async function runPreview(): Promise<InventoryPreviewLineDTO[] | null> {
    setPreviewErr(null);
    setPreview(null);

    if (!vid) return null;
    if (!isNonZeroIntString(delta)) return null;

    setPreviewLoading(true);
    try {
      const qtyDelta = Number(delta.trim());

      const res = await inventoryService.previewAdjustment({
        reason: reason.trim() ? reason.trim() : null,
        lines: [{ variantId: vid, qtyDelta, ...(notes.trim() ? { notes: notes.trim() } : {}) }],
      });

      // fallback: si backend algún día devuelve after < 0
      const hasNegative = res.lines.some((l) => l.afterQty < 0);
      if (hasNegative) {
        setNegBlocked(true);
        setPreviewErr("No se puede dejar el stock en negativo.");
        setPreview(null);
        notify.warning({ title: "No permitido", description: "Este ajuste dejaría stock en negativo." });
        return null;
      }

      setNegBlocked(false);
      setPreview(res.lines);
      return res.lines;
    } catch (e: unknown) {
      if (isInventoryConflict(e, "NEGATIVE_INVENTORY")) {
        setNegBlocked(true);
        setPreview(null);
        const msg = "No se puede dejar el stock en negativo.";
        setPreviewErr(msg);
        notify.warning({ title: "No permitido", description: msg });
        return null;
      }

      const msg = isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "No se pudo previsualizar.";
      setPreviewErr(msg);
      setNegBlocked(false);
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }

  async function apply() {
    if (!vid) return;

    if (!isNonZeroIntString(delta)) {
      notify.warning({ title: "Revisa", description: "Delta debe ser entero distinto de 0." });
      return;
    }

    // ✅ si está bloqueado por negativo, no permitir
    if (negBlocked) {
      notify.warning({ title: "No permitido", description: "Este ajuste dejaría stock en negativo." });
      return;
    }

    // ✅ exige preview válido antes de aplicar (recomendado)
    if (!preview?.length) {
      notify.warning({ title: "Preview requerido", description: "Haz Preview primero para validar el ajuste." });
      return;
    }

    setSubmitting(true);
    try {
      const qtyDelta = Number(delta.trim());

      await inventoryService.adjust({
        reason: reason.trim() ? reason.trim() : null,
        lines: [{ variantId: vid, qtyDelta, ...(notes.trim() ? { notes: notes.trim() } : {}) }],
      });

      notify.success({ title: "Inventario actualizado", description: "Ajuste aplicado." });
      await props.onApplied();
      props.onOpenChange(false);
    } catch (e: unknown) {
      if (isInventoryConflict(e, "NEGATIVE_INVENTORY")) {
        const msg = "No se puede dejar el stock en negativo.";
        setNegBlocked(true);
        setPreview(null);
        setPreviewErr(msg);
        notify.warning({ title: "No permitido", description: msg });
        return;
      }

      const msg = isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "No se pudo aplicar.";
      notify.error({ title: "Error", description: msg });
    } finally {
      setSubmitting(false);
    }
  }

  const titleText = row ? displayVariantTitle(row.title, row.sku) : "—";

  // ✅ deshabilitar Apply cuando:
  // - no hay row/vid
  // - delta inválido
  // - loading/submitting
  // - hay bloqueo por negativo
  // - no hay preview válido
  const canApply =
    !!row &&
    !!vid &&
    isNonZeroIntString(delta) &&
    !submitting &&
    !previewLoading &&
    !negBlocked &&
    !!preview?.length;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajuste de inventario</DialogTitle>
        </DialogHeader>

        {!row ? (
          <div className="text-sm text-muted-foreground">Selecciona una variante en la tabla.</div>
        ) : (
          <>
            <div className="rounded-xl border border-border p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <EntityAvatar src={row.imageUrl ?? undefined} alt={titleText} size={44} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{titleText}</div>
                  <div className="text-xs text-muted-foreground truncate">SKU: {row.sku}</div>
                  {row.productName ? <div className="text-xs text-muted-foreground truncate">{row.productName}</div> : null}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">Stock actual</div>
                <div className="text-lg font-semibold tabular-nums">{row.qty}</div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1">
                <div className="text-sm font-medium">Delta</div>
                <Input
                  inputMode="numeric"
                  value={delta}
                  disabled={submitting}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="+10 / -2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void runPreview();
                    }
                  }}
                />
              </div>

              <div className="grid gap-1">
                <div className="text-sm font-medium">Notas (opcional)</div>
                <Input value={notes} disabled={submitting} onChange={(e) => setNotes(e.target.value)} placeholder="recount / shrink / damage…" />
              </div>

              <div className="grid gap-1">
                <div className="text-sm font-medium">Razón (opcional)</div>
                <Input value={reason} disabled={submitting} onChange={(e) => setReason(e.target.value)} placeholder="Stock recount…" />
              </div>

              {/* ✅ mensaje visible (además del notify) */}
              {negBlocked ? (
                <div className="text-sm text-destructive">No se puede dejar el stock en negativo. Ajusta el delta.</div>
              ) : null}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting || previewLoading || !isNonZeroIntString(delta)}
                  onClick={() => void runPreview()}
                >
                  {previewLoading ? "Calculando..." : "Preview"}
                </Button>
                <div className="text-xs text-muted-foreground">Confirma “after” antes de aplicar.</div>
              </div>

              <InventoryPreviewCard
                lines={preview}
                loading={previewLoading}
                error={previewErr}
                title={`${titleText} · SKU: ${row.sku}`}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={submitting || previewLoading}>
                  Cancelar
                </Button>
                <Button onClick={() => void apply()} disabled={!canApply}>
                  Aplicar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
