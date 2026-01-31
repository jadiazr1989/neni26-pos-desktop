// src/modules/purchases/ui/detail/PurchaseItemsCard.tsx
"use client";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";

import type { DraftLine, PurchaseDetailVm } from "../../hooks/purchaseDetail.types";
import { PurchaseItemDialog } from "./PurchaseItemDialog";
import { PurchaseItemPickerSmart } from "./PurchaseItemPickerSmart";
import { PurchaseItemsList } from "./PurchaseItemsList";

import { normalizeId } from "../../hooks/purchaseDetail.helpers";
import { useMyWarehouseVariantIndex, type VariantPick } from "../../hooks/useMyWarehouseVariantIndex";

type Pending =
  | { mode: "add"; seed: DraftLine; picked: VariantPick | null }
  | { mode: "edit"; idx: number; seed: DraftLine; picked: VariantPick | null };

export function PurchaseItemsCard({ vm }: { vm: PurchaseDetailVm }) {
  const canEdit = vm.editor.canEditItems;
  const disabled = vm.loading || !canEdit;

  const inv = useMyWarehouseVariantIndex({ maxItems: 800, pageSize: 150 });

  const [pending, setPending] = React.useState<Pending | null>(null);
  const [removeIdx, setRemoveIdx] = React.useState<number | null>(null);

  // ✅ Cargar inventario automáticamente para que la lista tenga meta humano
  React.useEffect(() => {
    if (!canEdit) return;
    // si hay líneas o quieres siempre: carga
    if (vm.editor.lines.length === 0) return;
    void inv.ensureLoaded();
  }, [canEdit, vm.editor.lines.length, inv]);

  // ✅ helper: VariantPick -> DraftLine["variant"]
  function pickToLineVariant(v: VariantPick): DraftLine["variant"] {
    return {
      id: v.id,
      sku: v.sku ?? "—",
      barcode: v.barcode ?? null,
      title: v.title ?? v.label ?? null,
      imageUrl: v.imageUrl ?? null,
      isActive: v.isActive ?? true,
      productName: v.productName ?? null,
      costBaseMinor: v.costBaseMinor,
      priceBaseMinor: v.priceBaseMinor,
      unit: v.unit
    };
  }


  const handlePick = React.useCallback(
    (v: VariantPick) => {
      const id = normalizeId(v.id) || v.id;
      const meta = pickToLineVariant(v);

      const idx = vm.editor.lines.findIndex(
        (x) => (normalizeId(x.productVariantId) || x.productVariantId) === id
      );

      if (idx >= 0) {
        const cur = vm.editor.lines[idx]!;
        setPending({
          mode: "edit",
          idx,
          // ✅ mantenemos variant existente; si no hay, usamos el pick
          seed: {
            ...cur,
            variant: cur.variant ?? meta,
            unitCostBaseMinor: cur.unitCostBaseMinor ?? Math.max(0, v.costBaseMinor ?? 0),
            unitPriceBaseMinor: cur.unitPriceBaseMinor ?? ((v.priceBaseMinor ?? 0) || null),
            quantity: Number(cur.quantity ?? 0) + 1,
          },
          picked: v,
        });
        return;
      }

      setPending({
        mode: "add",
        seed: {
          productVariantId: id,
          quantity: 1,
          unitCostBaseMinor: Math.max(0, v.costBaseMinor ?? 0),   // ✅ costo sugerido
          unitPriceBaseMinor: (v.priceBaseMinor ?? 0) || null,    // ✅ precio sugerido opcional
          variant: meta,
        },
        picked: v,
      });
    },
    [vm.editor.lines]
  );



  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="">Productos</CardTitle>
            <div className="text-sm text-muted-foreground">
              {canEdit ? "Busca y selecciona una variante" : "Solo lectura"} · {vm.editor.lines.length} item(s)
              {canEdit ? (vm.editor.dirty ? " · Cambios sin guardar" : " · Sin cambios") : null}
            </div>
          </div>

          {canEdit ? (
            <button
              className="text-sm font-medium underline underline-offset-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
              onClick={() => void vm.editor.saveItems()}
              disabled={!vm.flags.canSaveItems || vm.loading}
              title={!vm.flags.canSaveItems ? "No hay cambios para guardar" : "Guardar items"}
            >
              Guardar items
            </button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <PurchaseItemPickerSmart disabled={disabled} onPick={handlePick} />

        <PurchaseItemsList
          disabled={disabled}
          lines={vm.editor.lines}
          onEdit={(idx) => {
            const cur = vm.editor.lines[idx];
            if (!cur) return;

            const id = normalizeId(cur.productVariantId) || cur.productVariantId;
            const picked = inv.byId.get(id) ?? null;

            setPending({
              mode: "edit",
              idx,
              seed: {
                ...cur,
                // ✅ si la línea no tiene meta, la reconstruimos del índice
                variant: cur.variant ?? (picked ? pickToLineVariant(picked) : null),
              },
              picked,
            });
          }}
          onRemove={(idx) => setRemoveIdx(idx)}
        />




        <PurchaseItemDialog
          open={pending != null}
          onOpenChange={(v) => !v && setPending(null)}
          busy={vm.loading}
          title={pending?.mode === "add" ? "Agregar producto" : "Editar producto"}
          line={pending?.seed ?? null}
          picked={pending?.picked ?? null} // ✅ pasamos VariantPick real
          onSave={(patch) => {
            if (!pending) return;

            if (pending.mode === "edit") vm.editor.setLine(pending.idx, patch);
            else vm.editor.openAdd({ ...pending.seed, ...patch });

            setPending(null);
          }}
        />

        <ConfirmDialog
          open={removeIdx != null}
          onOpenChange={(v) => !v && setRemoveIdx(null)}
          title="Eliminar producto"
          description="Se eliminará este producto de la compra (aún no afecta inventario hasta guardar/recibir)."
          confirmText="Eliminar"
          destructive
          busy={vm.loading}
          onConfirm={async () => {
            if (removeIdx == null) return;
            vm.editor.removeLine(removeIdx);
            setRemoveIdx(null);
          }}
        />
      </CardContent>
    </Card>
  );
}
