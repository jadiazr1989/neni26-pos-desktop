// src/modules/catalog/products/ui/variants/VariantDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { useVariantForm } from "../hooks/useVariantForm";
import { VariantUnitSelect } from "./VariantUnitSelect";
import { VariantImagePicker } from "./VariantImagePicker";

type Mode = "create" | "edit";

export function VariantDialog(props: {
  open: boolean;
  mode: Mode;
  productId: string;
  initial: ProductVariantDTO | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void> | void;
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const disabled = submitting;

  const form = useVariantForm({
    open: props.open,
    mode: props.mode,
    initial: props.initial,
  });

  async function submit() {
    form.setError(null);

    const v = form.validate();
    if (!v.ok) {
      form.setError(v.error);
      return;
    }

    // ✅ imagen obligatoria SOLO se valida al submit (no bloquea botón)
    if (props.mode === "create" && !v.value.imageFile) {
      form.setError("Imagen requerida para crear la variante.");
      return;
    }

    setSubmitting(true);
    try {
      if (props.mode === "create") {
        const variantId = await productService.createVariant(props.productId, {
          sku: v.value.sku,
          barcode: v.value.barcode,
          title: v.value.title,
          unit: v.value.unit,
          priceBaseMinor: v.value.priceBaseMinor,
          costBaseMinor: v.value.costBaseMinor,
          isActive: true,
        });

        await productService.uploadVariantImage(variantId, v.value.imageFile!);
      } else {
        const id = props.initial!.id;

        await productService.updateVariant(id, {
          sku: v.value.sku,
          barcode: v.value.barcode,
          title: v.value.title,
          unit: v.value.unit,
          priceBaseMinor: v.value.priceBaseMinor,
          costBaseMinor: v.value.costBaseMinor,
        });

        if (v.value.imageFile) {
          await productService.uploadVariantImage(id, v.value.imageFile);
        }
      }

      await props.onSaved();
      props.onOpenChange(false);
    } catch (e: unknown) {
      form.setError(e instanceof Error ? e.message : "No se pudo guardar la variante.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Nueva variante" : "Editar variante"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {form.error && <div className="text-sm text-destructive">{form.error}</div>}

          <div className="grid gap-2">
            <div className="text-sm font-medium">SKU</div>
            <Input
              value={form.state.sku}
              onChange={(e) => form.patch({ sku: e.target.value })}
              placeholder="SKU-001"
              disabled={disabled}
            />
          </div>

          <VariantUnitSelect
            value={form.state.unit}
            onChange={(u) => form.patch({ unit: u })}
            disabled={disabled}
          />

          <div className="grid gap-2">
            <div className="text-sm font-medium">Barcode (opcional)</div>
            <Input
              value={form.state.barcode}
              onChange={(e) => form.patch({ barcode: e.target.value })}
              placeholder="0123456789"
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Título (opcional)</div>
            <Input
              value={form.state.title}
              onChange={(e) => form.patch({ title: e.target.value })}
              placeholder="Coca Cola 2L"
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Precio (minor)</div>
              <Input
                inputMode="numeric"
                value={form.state.price}
                onChange={(e) => form.patch({ price: e.target.value })}
                disabled={disabled}
              />
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium">Costo (minor)</div>
              <Input
                inputMode="numeric"
                value={form.state.cost}
                onChange={(e) => form.patch({ cost: e.target.value })}
                disabled={disabled}
              />
            </div>
          </div>

          <VariantImagePicker
            value={form.state.imageFile}
            onChange={(f) => form.patch({ imageFile: f })}
            disabled={disabled}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
              Cancelar
            </Button>

            <Button
              onClick={() => void submit()}
              disabled={
                disabled ||
                !form.state.sku.trim() ||
                !form.state.unit
                // ✅ NO bloqueamos por imageFile
              }
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
