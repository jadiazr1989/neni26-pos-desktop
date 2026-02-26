// src/modules/purchases/hooks/usePurchaseItemsEditor.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { PurchaseWithItemsDTO } from "@/lib/modules/purchases/purchase.dto";
import type { DraftLine, PurchaseItemsEditorVm } from "./purchaseDetail.types";
import {
  draftLinesToSetItemsInput,
  errDesc,
  itemsToDraftLinesRehydrated,
  mergeByVariantId,
  normalizeId,
} from "./purchaseDetail.helpers";
import type { SellUnit } from "@/lib/modules/catalog/products/product.dto";

function parseQtyInput(raw: unknown): number | null {
  const s = String(raw ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function cleanServerFields(): Pick<DraftLine, "qtyDisplay" | "displayUnit" | "lineTotalBaseMinor"> {
  return { qtyDisplay: null, displayUnit: null, lineTotalBaseMinor: null };
}

// type-guard: “seed trae explícitamente unitPriceBaseMinor”
function hasUnitPriceBaseMinor(
  seed: Partial<DraftLine> | undefined,
): seed is Partial<DraftLine> & { unitPriceBaseMinor: number | null } {
  return Boolean(seed) && Object.prototype.hasOwnProperty.call(seed, "unitPriceBaseMinor");
}

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
    setLines((prev) => itemsToDraftLinesRehydrated(p, prev));
    setDirty(false);
  }, []);

  const openAdd = React.useCallback((seed?: Partial<DraftLine>) => {
    const id = normalizeId(seed?.productVariantId ?? "");
    if (!id) {
      notify.error({ title: "Variante inválida", description: "No se pudo agregar: falta el ID de la variante." });
      return;
    }

    const seedQtyInput = String(seed?.qtyInput ?? "").trim();
    const seedUnitInput = (seed?.unitInput ?? "UNIT") as SellUnit;
    const seedQtyBaseMinor = Number(seed?.qtyBaseMinor ?? 0);

    const seedCost = Number(seed?.unitCostBaseMinor ?? 0);

    const priceProvided = hasUnitPriceBaseMinor(seed);
    const seedPrice = priceProvided ? seed.unitPriceBaseMinor : undefined;

    const seedVariant: DraftLine["variant"] = seed?.variant ?? null;

    setLines((prev) => {
      const idx = prev.findIndex((x) => normalizeId(x.productVariantId) === id);

      // ✅ existe
      if (idx >= 0) {
        const next = prev.slice();
        const cur = next[idx]!;

        const nextVariant = seedVariant ?? cur.variant ?? null;

        // si seed NO trae qtyInput explícito, comportamiento “tap”
        const shouldAutoInc = seedQtyInput === "" && cur.unitInput === "UNIT";

        if (shouldAutoInc) {
          const n = parseQtyInput(cur.qtyInput);
          const nextQty = n == null ? 1 : n + 1;

          next[idx] = {
            ...cur,
            ...cleanServerFields(),
            productVariantId: id,
            qtyInput: String(nextQty),
            unitInput: cur.unitInput,
            qtyBaseMinor: Math.max(0, Math.trunc(Number(cur.qtyBaseMinor ?? 0) + 1)),

            unitCostBaseMinor: Number.isFinite(seedCost) && seedCost >= 0 ? seedCost : cur.unitCostBaseMinor,
            unitPriceBaseMinor: priceProvided ? (seedPrice ?? null) : cur.unitPriceBaseMinor,

            variant: nextVariant,
          };
          return next;
        }

        // ✅ no auto-increment (measure units o seed trae qtyInput)
        next[idx] = {
          ...cur,
          ...cleanServerFields(),
          productVariantId: id,

          qtyInput: seedQtyInput !== "" ? seedQtyInput : cur.qtyInput,
          unitInput: seedUnitInput || cur.unitInput,
          qtyBaseMinor: seedQtyBaseMinor > 0 ? seedQtyBaseMinor : cur.qtyBaseMinor,

          unitCostBaseMinor: Number.isFinite(seedCost) && seedCost >= 0 ? seedCost : cur.unitCostBaseMinor,
          unitPriceBaseMinor: priceProvided ? (seedPrice ?? null) : cur.unitPriceBaseMinor,

          variant: nextVariant,
        };

        return next;
      }

      // ✅ nueva línea
      return [
        ...prev,
        {
          productVariantId: id,

          qtyInput: seedQtyInput !== "" ? seedQtyInput : "1",
          unitInput: seedUnitInput,
          qtyBaseMinor: seedQtyBaseMinor > 0 ? seedQtyBaseMinor : (seedUnitInput === "UNIT" ? 1 : 0),

          unitCostBaseMinor: Number.isFinite(seedCost) && seedCost >= 0 ? seedCost : 0,
          unitPriceBaseMinor: priceProvided ? (seedPrice ?? null) : null,

          qtyDisplay: null,
          displayUnit: null,
          lineTotalBaseMinor: null,

          variant: seedVariant,
        },
      ];
    });

    setDirty(true);
  }, []);

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

        if (cur.unitInput === "UNIT") {
          const n = parseQtyInput(cur.qtyInput);
          const nextQty = n == null ? 1 : n + 1;

          next[idx] = {
            ...cur,
            ...cleanServerFields(),
            qtyInput: String(nextQty),
            qtyBaseMinor: Math.max(0, Math.trunc(Number(cur.qtyBaseMinor ?? 0) + 1)),
          };
        } else {
          next[idx] = { ...cur };
        }

        return next;
      }

      return [
        ...prev,
        {
          productVariantId: variantId,
          qtyInput: "1",
          unitInput: "UNIT",
          qtyBaseMinor: 1,
          unitCostBaseMinor: 0,
          unitPriceBaseMinor: null,
          qtyDisplay: null,
          displayUnit: null,
          lineTotalBaseMinor: null,
          variant: null,
        },
      ];
    });

    setDirty(true);
  }, []);

  const setLine = React.useCallback((idx: number, patch: Partial<DraftLine>) => {
    setLines((prev) => {
      const cur = prev[idx];
      if (!cur) return prev;

      const next = prev.slice();

      const nextVariant =
        patch.variant === undefined
          ? cur.variant
          : patch.variant === null
            ? null
            : {
                ...cur.variant,
                ...patch.variant,
                units: {
                  ...cur.variant?.units,
                  ...patch.variant.units,
                },
                money: {
                  ...cur.variant?.money,
                  ...patch.variant.money,
                },
                unit: patch.variant.unit ?? cur.variant?.unit ?? patch.variant.units.pricingUnit,
              };

      next[idx] = {
        ...cur,
        ...cleanServerFields(),
        ...patch,
        variant: nextVariant,
      };

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

    const normalized: DraftLine[] = lines.map((l) => ({
      ...l,
      productVariantId: normalizeId(l.productVariantId),
      qtyInput: String(l.qtyInput ?? "").trim(),
      unitInput: (l.unitInput ?? "UNIT") as SellUnit,
      qtyBaseMinor: Number(l.qtyBaseMinor ?? 0),

      unitCostBaseMinor: Number(l.unitCostBaseMinor ?? 0),
      unitPriceBaseMinor: l.unitPriceBaseMinor == null ? null : Number(l.unitPriceBaseMinor),

      variant: l.variant ?? null,
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
      const q = parseQtyInput(l.qtyInput);
      if (q == null || q <= 0) return true;
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
      await purchaseService.setItems(opts.purchaseId, input);

      // ✅ refresca para traer qtyDisplay/displayUnit/lineTotalBaseMinor reales
      const fresh = await purchaseService.getById(opts.purchaseId);
      opts.setPurchase(fresh);

      // ✅ rehidrata preservando variant local si backend no la manda
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