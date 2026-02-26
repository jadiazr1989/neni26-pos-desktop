"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TooltipProvider } from "@/components/ui/tooltip";

import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";
import { useInventoryQuickAdjust } from "../hooks/useInventoryQuickAdjust";

import { InventoryPreviewCard } from "./components/InventoryPreviewCard";
import { InlineAlert } from "./components/InlineAlert";
import { VariantHeaderCard } from "./components/VariantHeaderCard";
import { DiscardChangesDialog } from "./components/DiscardChangesDialog";
import { QuickAdjustForm } from "./components/QuickAdjustForm";
import { ActionBar } from "./components/ActionBar";
import { useDirtySnapshot } from "../hooks/useDirtySnapshot";
import { useDialogCloseGuards } from "../hooks/useDialogCloseGuards";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApplied: () => Promise<void> | void;
  row: WarehouseStockRowUI | null;
};

// si el hook te devuelve cosas “raras” (refs), esto lo vuelve string seguro
type MaybeRefString = string | { current: unknown } | null | undefined;

function readMaybeRefString(v: MaybeRefString): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "current" in v) {
    const cur = (v as { current: unknown }).current;
    return cur == null ? "" : String(cur);
  }
  return "";
}

export function InventoryQuickAdjustDialog(props: Props) {
  const row = props.row;
  const variantId = row?.variantId?.trim() ?? "";

  const qa = useInventoryQuickAdjust({
    open: props.open,
    variantId,
    defaultUnit: row?.pricingUnit ?? null,
    unitFactor: row?.unitFactor ?? null,
  });

  const qtyRef = React.useRef<HTMLInputElement | null>(null);
  const errRef = React.useRef<HTMLDivElement | null>(null);
  const errId = React.useId();

  // -------------------------
  // ✅ Local inputs (strings) + local errors (strings/booleans)
  // -------------------------
  const [qtyInput, setQtyInput] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [reason, setReason] = React.useState("");

  const [rangeMsg, setRangeMsg] = React.useState<string | null>(null);
  const [negBlocked, setNegBlocked] = React.useState(false);

  // sync from qa when open / variant changes
  React.useEffect(() => {
    if (!props.open) return;

    setQtyInput(readMaybeRefString(qa.qtyInput as unknown as MaybeRefString));
    setNotes(readMaybeRefString(qa.notes as unknown as MaybeRefString));
    setReason(readMaybeRefString(qa.reason as unknown as MaybeRefString));

    // ✅ IMPORTANT: copiar errores a state (evita leer refs en render)
    setRangeMsg(qa.rangeMsg ? String(qa.rangeMsg) : null);
    setNegBlocked(Boolean(qa.negBlocked));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, row?.variantId]);

  // keep local errors in sync when they change (pero sin leerlos en render)
  React.useEffect(() => {
    if (!props.open) return;
    setRangeMsg(qa.rangeMsg ? String(qa.rangeMsg) : null);
    setNegBlocked(Boolean(qa.negBlocked));
  }, [props.open, qa.rangeMsg, qa.negBlocked]);

  const isBusy = qa.submitting || qa.previewLoading;

  const showErrorBanner = Boolean(rangeMsg) || negBlocked;

  const { isDirty, reset: resetDirtySnapshot } = useDirtySnapshot({
    open: props.open,
    snapshotKey: row?.variantId ?? "",
    qty: qtyInput,
    notes,
    reason,
  });

  // autofocus al abrir
  React.useEffect(() => {
    if (!props.open) return;
    const t = window.setTimeout(() => qtyRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [props.open]);

  // scroll al error si aparece
  React.useEffect(() => {
    if (!props.open) return;
    if (!showErrorBanner) return;
    const t = window.setTimeout(() => {
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      qtyRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [props.open, showErrorBanner]);

  const doClose = React.useCallback(() => props.onOpenChange(false), [props.onOpenChange]);

  const guards = useDialogCloseGuards({
    open: props.open,
    isBusy,
    isDirty,
    onClose: doClose,
    onRefocus: () => window.setTimeout(() => qtyRef.current?.focus(), 0),
  });

  const onChangeQty = React.useCallback(
    (v: string) => {
      setQtyInput(v);
      qa.setQtyInput(v);
    },
    [qa]
  );

  const onChangeNotes = React.useCallback(
    (v: string) => {
      setNotes(v);
      qa.setNotes(v);
    },
    [qa]
  );

  const onChangeReason = React.useCallback(
    (v: string) => {
      setReason(v);
      qa.setReason(v);
    },
    [qa]
  );

  async function onApply() {
    if (!qa.canApply) {
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      qtyRef.current?.focus();
      return;
    }

    await qa.apply(async () => {
      await props.onApplied();
      resetDirtySnapshot();
      doClose();
    });
  }

  const applyDisabled = !row || !qa.canApply || isBusy;
  const previewDisabled = !row || !qa.canPreview || isBusy;

  const applyTooltipText = React.useMemo(() => {
    if (!row) return "Selecciona una variante.";
    if (qa.submitting) return "Aplicando…";
    if (qa.previewLoading) return "Espera a que termine el preview.";
    if (rangeMsg) return rangeMsg;
    if (negBlocked) return "No se puede dejar el stock en negativo. Ajusta la cantidad.";
    if (!qa.canApply) return "Haz preview y corrige los campos antes de aplicar.";
    return "";
  }, [row, qa.submitting, qa.previewLoading, rangeMsg, negBlocked, qa.canApply]);

  const previewTooltipText = React.useMemo(() => {
    if (!row) return "Selecciona una variante.";
    if (qa.submitting) return "Espera a que termine la operación.";
    if (!qa.canPreview) return "Introduce una cantidad válida para previsualizar.";
    return "";
  }, [row, qa.submitting, qa.canPreview]);

  const maxAbsText = React.useMemo(() => {
    if (!row) return null;
    if (qa.maxAbsQty == null) return null;
    return `Máximo permitido: ±${new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(qa.maxAbsQty)} ${row.pricingUnit
      }`;
  }, [row, qa.maxAbsQty]);

  const qtyInputClass =
    (showErrorBanner ? "border-amber-400 ring-2 ring-amber-300 focus-visible:ring-2 focus-visible:ring-amber-300" : "") +
    "";

  const onQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      void onApply();
      return;
    }

    e.preventDefault();
    void qa.runPreview();
  };

  return (
    <TooltipProvider>
      <DiscardChangesDialog
        open={guards.confirmOpen}
        onOpenChange={guards.setConfirmOpenSafe}
        onKeepEditing={guards.onConfirmKeepEditing}
        onDiscard={guards.onConfirmDiscard}
      />

      <Dialog open={props.open} onOpenChange={guards.onDialogOpenChange}>
        <DialogContent
          className="sm:max-w-2xl rounded-2xl"
          onEscapeKeyDown={guards.onEscapeKeyDown}
          onPointerDownOutside={guards.onPointerDownOutside}
          onInteractOutside={guards.onInteractOutside}
        >
          <DialogHeader>
            <DialogTitle>Ajuste de inventario</DialogTitle>
          </DialogHeader>

          {!row ? (
            <div className="text-sm text-muted-foreground">Selecciona una variante en la tabla.</div>
          ) : (
            <>
              <VariantHeaderCard row={row} />

              {showErrorBanner ? (
                <div ref={errRef} className="mt-3">
                  <InlineAlert id={errId}>
                    {rangeMsg ? (
                      <>
                        <span className="font-semibold">Cantidad fuera de rango.</span>{" "}
                        <span className="opacity-90">{rangeMsg}</span>
                      </>
                    ) : negBlocked ? (
                      <>
                        <span className="font-semibold">Stock en negativo bloqueado.</span>{" "}
                        <span className="opacity-90">Ajusta la cantidad.</span>
                      </>
                    ) : null}
                  </InlineAlert>
                </div>
              ) : null}

              <QuickAdjustForm
                ref={qtyRef}
                row={row}
                qtyInput={qtyInput}
                notes={notes}
                reason={reason}
                setQtyInput={onChangeQty}
                setNotes={onChangeNotes}
                setReason={onChangeReason}
                isBusy={isBusy}
                maxAbsText={maxAbsText}
                qtyInputClass={qtyInputClass}
                showErrorBanner={showErrorBanner}
                errId={errId}
                onQtyKeyDown={onQtyKeyDown}
                negBlocked={negBlocked}
              />

              <InventoryPreviewCard
                title={`${row.title} · SKU: ${row.sku}`}
                lines={qa.preview}
                loading={qa.previewLoading}
                error={qa.previewErr}
                pricingUnit={row.pricingUnit}
                unitFactor={row.unitFactor}
              />

              <ActionBar
                onCancel={guards.requestClose}
                cancelDisabled={isBusy}
                onPreview={() => void qa.runPreview()}
                previewDisabled={previewDisabled}
                previewLoading={qa.previewLoading}
                previewTooltip={previewTooltipText}
                onApply={() => void onApply()}
                applyDisabled={applyDisabled}
                applyLoading={qa.submitting}
                applyTooltip={applyTooltipText}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}