// src/modules/catalog/products/ui/variants/VariantDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { useVariantForm } from "../hooks/useVariantForm";
import { VariantUnitSelect } from "./VariantUnitSelect";
import { VariantImagePicker } from "./VariantImagePicker";
import { useVariantSubmit } from "../hooks/useVariantSubmit";

type Mode = "create" | "edit";

export function VariantDialog(props: {
  open: boolean;
  mode: Mode;
  productId: string;
  initial: ProductVariantDTO | null;
  variantId?: string;
  onOpenChange: (v: boolean) => void;
  onSaved: () => Promise<void> | void;
}) {
  const form = useVariantForm({
    open: props.open,
    mode: props.mode,
    initial: props.initial,
  });

  const close = React.useCallback(() => props.onOpenChange(false), [props]);

  const { submitting, submit } = useVariantSubmit({
    mode: props.mode,
    productId: props.productId,
    initial: props.initial,
    variantId: props.variantId,
    validate: form.validate,
    onSaved: props.onSaved,
    onClose: close,
  });

  const disabled = submitting;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Nueva variante" : "Editar variante"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
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
              inputMode="numeric"
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

          {/* ✅ inputs decimales: aceptan "." y "," (el parser lo normaliza) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Precio</div>
              <Input
                inputMode="decimal"
                value={form.state.price}
                onChange={(e) => form.patch({ price: e.target.value })}
                placeholder="12.34"
                disabled={disabled}
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Costo</div>
              <Input
                inputMode="decimal"
                value={form.state.cost}
                onChange={(e) => form.patch({ cost: e.target.value })}
                placeholder="10.00"
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
            <Button variant="secondary" onClick={close} disabled={disabled}>
              Cancelar
            </Button>

            <Button
              onClick={() => void submit()}
              disabled={disabled || !form.state.sku.trim() || !form.state.unit}
            >
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
