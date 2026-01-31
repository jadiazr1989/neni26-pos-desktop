// src/modules/catalog/products/ui/variants/hooks/useVariantSubmit.ts
"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import { productService } from "@/lib/modules/catalog/products/product.service";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { VariantUnit } from "../variants/variant.constants";

export type VariantMode = "create" | "edit";

export function useVariantSubmit(args: {
  mode: VariantMode;
  productId: string;
  initial: ProductVariantDTO | null;
  variantId?: string;

  validate: () =>
    | { ok: true; value: { sku: string; barcode: string | null; title: string | null; unit: VariantUnit; attributes: null; priceBaseMinor: number; costBaseMinor: number; imageFile: File | null } }
    | { ok: false; error: string };

  onSaved: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const submittingRef = React.useRef(false);

  const submit = React.useCallback(async () => {
    if (submittingRef.current) return; // ✅ anti doble click / doble trigger
    submittingRef.current = true;
    setSubmitting(true);

    try {
      const v = args.validate();
      if (!v.ok) {
        notify.error({ title: "Validación", description: v.error });
        return;
      }

      const payload = v.value;

      if (args.mode === "create") {
        if (!payload.imageFile) {
          notify.error({ title: "Validación", description: "Imagen requerida para crear la variante." });
          return;
        }

        const variantId = await productService.createVariant(args.productId, {
          sku: payload.sku,
          barcode: payload.barcode,
          title: payload.title,
          unit: payload.unit,
          priceBaseMinor: payload.priceBaseMinor,
          costBaseMinor: payload.costBaseMinor,
          isActive: true,
          attributes: payload.attributes,
        });

        await productService.uploadVariantImage(variantId, payload.imageFile);
      } else {
        const id = String(args.variantId ?? args.initial?.id ?? "").trim();
        if (!id) {
          notify.error({ title: "Error", description: "variantId requerido para editar." });
          return;
        }

        await productService.updateVariant(id, {
          sku: payload.sku,
          barcode: payload.barcode,
          title: payload.title,
          unit: payload.unit,
          priceBaseMinor: payload.priceBaseMinor,
          costBaseMinor: payload.costBaseMinor,
        });

        if (payload.imageFile) {
          await productService.uploadVariantImage(id, payload.imageFile);
        }
      }

      notify.success({ title: "Listo", description: "Variante guardada." });
      await args.onSaved();
      args.onClose();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo guardar la variante.";
      notify.error({ title: "Error guardando variante", description: msg });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [args]);

  return { submitting, submit };
}
