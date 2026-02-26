// src/modules/purchases/ui/detail/PurchaseItemsCard.tsx
"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DraftLine, PurchaseDetailVm } from "../../hooks/purchaseDetail.types";
import { PurchaseItemDialog } from "./PurchaseItemDialog";
import { PurchaseItemPickerSmart } from "./PurchaseItemPickerSmart";
import { PurchaseItemsList } from "./PurchaseItemsList";

import { normalizeId } from "../../hooks/purchaseDetail.helpers";
import { useMyWarehouseVariantIndex, type VariantPick } from "../../hooks/useMyWarehouseVariantIndex";

type Pending =
  | { mode: "add"; seed: DraftLine; picked: VariantPick | null }
  | { mode: "edit"; idx: number; seed: DraftLine; picked: VariantPick | null };

function parseQtyInput(raw: unknown): number | null {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function formatQtyInput(n: number): string {
  // evita "1.0000000002"
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}

export function PurchaseItemsCard({ vm }: { vm: PurchaseDetailVm }) {
  const canEdit = vm.editor.canEditItems;
  const disabled = vm.loading || !canEdit;

  const inv = useMyWarehouseVariantIndex({ maxItems: 800, pageSize: 150 });
  const { ensureLoaded, byId } = inv;

  const [pending, setPending] = React.useState<Pending | null>(null);
  const [removeIdx, setRemoveIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!canEdit) return;
    if (vm.editor.lines.length === 0) return;
    void ensureLoaded();
  }, [canEdit, vm.editor.lines.length, ensureLoaded]);

  const pickToLineVariant = React.useCallback((v: VariantPick): DraftLine["variant"] => {
  return {
    id: v.id,
    sku: v.sku ?? "—",
    barcode: v.barcode ?? null,
    title: v.title ?? v.label ?? null,
    imageUrl: v.imageUrl ?? null,
    isActive: v.isActive ?? true,
    productName: v.productName ?? null,

    units: {
      baseUnit: v.baseUnit,
      pricingUnit: v.pricingUnit,
      unitFactor: v.unitFactor,
    },

    money: {
      costBaseMinor: v.costBaseMinor,
      priceBaseMinor: v.priceBaseMinor,
    },

    unit: v.pricingUnit,
  };
}, []);


  const handlePick = React.useCallback(
    (v: VariantPick) => {
      const id = normalizeId(v.id) || v.id;
      const meta = pickToLineVariant(v);

      const idx = vm.editor.lines.findIndex(
        (x) => (normalizeId(x.productVariantId) || x.productVariantId) === id,
      );

      if (idx >= 0) {
        const cur = vm.editor.lines[idx]!;
        const curQty = parseQtyInput(cur.qtyInput);
        const nextQtyInput = curQty == null ? cur.qtyInput : formatQtyInput(curQty + 1);

        setPending({
          mode: "edit",
          idx,
          seed: {
            ...cur,
            variant: cur.variant ?? meta,
            unitCostBaseMinor: Number(cur.unitCostBaseMinor ?? 0) || Math.max(0, v.costBaseMinor ?? 0),
            unitPriceBaseMinor: cur.unitPriceBaseMinor ?? ((v.priceBaseMinor ?? 0) || null),

            // ✅ nuevo contrato
            qtyInput: nextQtyInput,
            // mantenemos unitInput existente si ya está; si no, usa pricingUnit
            unitInput: cur.unitInput ?? v.pricingUnit,
            // qtyBaseMinor se recalcula en dialog (usePurchaseItemForm) al guardar
            qtyBaseMinor: Number(cur.qtyBaseMinor ?? 0),
          },
          picked: v,
        });
        return;
      }

      setPending({
        mode: "add",
        seed: {
          productVariantId: id,

          // ✅ nuevo contrato (inicial)
          qtyInput: "1",
          unitInput: v.pricingUnit,
          qtyBaseMinor: 0,

          unitCostBaseMinor: Math.max(0, v.costBaseMinor ?? 0),
          unitPriceBaseMinor: (v.priceBaseMinor ?? 0) || null,
          variant: meta,
        },
        picked: v,
      });
    },
    [pickToLineVariant, vm.editor.lines],
  );

  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>Productos</CardTitle>
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
            const picked = byId.get(id) ?? null;

            setPending({
              mode: "edit",
              idx,
              seed: {
                ...cur,
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
          picked={pending?.picked ?? null}
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
