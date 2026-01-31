"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import type { DraftLine, PurchaseItemsEditorVm } from "./purchaseDetail.types";
import {
  draftLinesToSetItemsInput,
  errDesc,
  itemsToDraftLines,
  mergeByVariantId,
  normalizeId,
} from "./purchaseDetail.helpers";

export function usePurchaseItemsEditor(opts: {
  purchaseId: string;
  purchase: PurchaseWithItemsDTO | null;
  setPurchase: (p: PurchaseWithItemsDTO) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}): PurchaseItemsEditorVm {
  const canEditItems = opts.purchase?.status === "DRAFT";

  const [lines, setLines] = React.useState<DraftLine[]>([]);
  const [dirty, setDirty] = React.useState(false);

  const syncFromPurchase = React.useCallback((p: PurchaseWithItemsDTO) => {
    setLines(itemsToDraftLines(p));
    setDirty(false);
  }, []);

  const openAdd = React.useCallback((seed?: Partial<DraftLine>) => {
    const id = normalizeId(seed?.productVariantId ?? "");
    if (!id) {
      notify.error({
        title: "Variante inválida",
        description: "No se pudo agregar: falta el ID de la variante.",
      });
      return;
    }

    const qtySeed = Number(seed?.quantity ?? 1);
    const costSeed = Number(seed?.unitCostBaseMinor ?? 0);

    const hasPrice = Object.prototype.hasOwnProperty.call(seed ?? {}, "unitPriceBaseMinor");
    const priceSeed = (seed as Partial<DraftLine> | undefined)?.unitPriceBaseMinor;

    // ✅ si viene meta, la guardamos
    const variantSeed = (seed as Partial<DraftLine> | undefined)?.variant ?? null;

    setLines((prev) => {
      const idx = prev.findIndex((x) => normalizeId(x.productVariantId) === id);

      if (idx >= 0) {
        const cur = prev[idx]!;
        const next = prev.slice();

        next[idx] = {
          ...cur,
          productVariantId: id,
          quantity: Number(cur.quantity ?? 0) + (Number.isFinite(qtySeed) ? qtySeed : 0),
          unitCostBaseMinor:
            Number.isFinite(costSeed) && costSeed > 0 ? costSeed : Number(cur.unitCostBaseMinor ?? 0),
          unitPriceBaseMinor: hasPrice ? (priceSeed == null ? null : Number(priceSeed)) : cur.unitPriceBaseMinor,

          // ✅ NO perder meta: si seed trae, reemplaza (porque puede venir más fresco)
          variant: variantSeed ?? cur.variant ?? null,
        };

        return next;
      }

      return [
        ...prev,
        {
          productVariantId: id,
          quantity: Number.isFinite(qtySeed) ? qtySeed : 1,
          unitCostBaseMinor: Number.isFinite(costSeed) ? costSeed : 0,
          unitPriceBaseMinor: hasPrice ? (priceSeed == null ? null : Number(priceSeed)) : null,

          // ✅ meta
          variant: variantSeed,
        },
      ];
    });

    setDirty(true);
  }, []);

  /**
   * ⚠️ Antes perdías meta siempre porque solo recibes variantId.
   * ✅ Ahora incrementa qty pero NO toca cur.variant.
   * (Si quieres inyectar meta aquí, hay que pasarla desde el caller.)
   */
  const upsertByVariantId = React.useCallback((variantIdRaw: string) => {
    const variantId = normalizeId(variantIdRaw);
    if (!variantId) {
      notify.error({ title: "Variante inválida", description: "ID de variante inválido." });
      return;
    }

    setLines((prev) => {
      const idx = prev.findIndex((x) => normalizeId(x.productVariantId) === variantId);
      if (idx >= 0) {
        const next = prev.slice();
        const cur = next[idx]!;
        next[idx] = { ...cur, quantity: Number(cur.quantity ?? 0) + 1 };
        return next;
      }

      // ✅ nueva línea SIN meta (porque aquí no tenemos VariantPick)
      return [
        ...prev,
        {
          productVariantId: variantId,
          quantity: 1,
          unitCostBaseMinor: 0,
          unitPriceBaseMinor: null,
          variant: null,
        },
      ];
    });

    setDirty(true);
  }, []);

  const setLine = React.useCallback((idx: number, patch: Partial<DraftLine>) => {
    setLines((prev) => {
      const next = prev.slice();
      if (!next[idx]) return prev;
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    setDirty(true);
  }, []);

  const removeLine = React.useCallback((idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  }, []);

  const saveItems = React.useCallback(async () => {
    if (!canEditItems) {
      notify.warning({ title: "No editable", description: "Solo puedes editar items en estado DRAFT." });
      return;
    }

    // ✅ normaliza y preserva meta
    const normalized: DraftLine[] = lines.map((l) => ({
      ...l,
      productVariantId: normalizeId(l.productVariantId),
      quantity: Number(l.quantity ?? 0),
      unitCostBaseMinor: Number(l.unitCostBaseMinor ?? 0),
      unitPriceBaseMinor: l.unitPriceBaseMinor == null ? null : Number(l.unitPriceBaseMinor),
    }));

    const merged = mergeByVariantId(normalized);

    const invalidId = merged.find((l) => !normalizeId(l.productVariantId));
    if (invalidId) {
      notify.error({
        title: "No se pudo guardar",
        description: `Variante inválida: ${String(invalidId.productVariantId).slice(0, 40)}`,
      });
      return;
    }

    const bad = merged.find((l) => {
      if (!Number.isFinite(l.quantity) || l.quantity <= 0) return true;
      if (!Number.isFinite(l.unitCostBaseMinor) || l.unitCostBaseMinor < 0) return true;
      if (l.unitPriceBaseMinor != null && (!Number.isFinite(l.unitPriceBaseMinor) || l.unitPriceBaseMinor < 0))
        return true;
      return false;
    });

    if (bad) {
      notify.error({ title: "No se pudo guardar", description: "Hay una línea con cantidad/costo/precio inválidos." });
      return;
    }

    const input = draftLinesToSetItemsInput(merged);
    if (!input.items.length) {
      notify.error({ title: "No se pudo guardar", description: "Debes agregar al menos 1 item." });
      return;
    }

    opts.setLoading(true);
    try {
      // ✅ setItems puede NO devolver meta -> recargamos con getById
      await purchaseService.setItems(opts.purchaseId, input);

      const fresh = await purchaseService.getById(opts.purchaseId); // ✅ aseguras items[].variant
      opts.setPurchase(fresh);
      syncFromPurchase(fresh);

      notify.success({ title: "Items guardados", description: "Totales recalculados." });
    } catch (e: unknown) {
      notify.error({ title: "No se pudo guardar", description: errDesc(e) });
    } finally {
      opts.setLoading(false);
    }
  }, [canEditItems, lines, opts, syncFromPurchase]);

  return {
    canEditItems: Boolean(canEditItems),
    dirty,
    lines,
    syncFromPurchase,
    upsertByVariantId,
    openAdd,
    removeLine,
    setLine,
    saveItems,
  };
}
