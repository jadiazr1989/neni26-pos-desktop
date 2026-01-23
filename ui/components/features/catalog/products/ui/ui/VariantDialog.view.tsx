"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "@/components/shared/utils/FieldLabel";
import { HelpText } from "@/components/shared/utils/HelpText";
import type { VariantUnit } from "@/lib/modules/catalog/products/product.dto";
import { VariantUnitSelect } from "../VariantUnitSelect";
import { VariantImagePicker } from "../VariantImagePicker";

export type VariantDialogViewProps = {
  open: boolean;
  title: string;
  submitting: boolean;
  error: string | null;

  sku: string;
  barcode: string;
  titleText: string;
  unit: VariantUnit | "";
  price: string;
  cost: string;
  imageFile: File | null;

  onOpenChange: (v: boolean) => void;
  onSkuChange: (v: string) => void;
  onBarcodeChange: (v: string) => void;
  onTitleChange: (v: string) => void;
  onUnitChange: (v: VariantUnit | "") => void;
  onPriceChange: (v: string) => void;
  onCostChange: (v: string) => void;
  onImageChange: (f: File | null) => void;

  onSubmit: () => void;
};

export function VariantDialogView(p: VariantDialogViewProps) {
  const disabled = p.submitting;
  const canSubmit = !disabled && !!p.sku.trim() && !!p.unit;

  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">{p.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">Configura la variante que se vende en POS.</div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {p.error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{p.error}</AlertDescription>
            </Alert>
          )}

          {/* SKU + Unidad */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-8">
              <FieldLabel required>SKU</FieldLabel>
              <Input
                value={p.sku}
                onChange={(e) => p.onSkuChange(e.target.value)}
                placeholder="SKU-001"
                disabled={disabled}
              />
              <HelpText>Identificador interno.</HelpText>
            </div>

            <div className="md:col-span-4">
              <FieldLabel required>Unidad</FieldLabel>
              <VariantUnitSelect
                value={p.unit}
                onChange={(u) => p.onUnitChange(u)}
                disabled={disabled}
                align="right"
                widthClassName="w-full md:w-[160px]"
                triggerClassName="bg-muted/30"
                placeholder="Unidad…"
              />
              <HelpText>Cómo se vende.</HelpText>
            </div>
          </div>

          {/* Barcode + Título */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <FieldLabel>Barcode</FieldLabel>
              <Input
                value={p.barcode}
                onChange={(e) => p.onBarcodeChange(e.target.value)}
                placeholder="0123456789"
                disabled={disabled}
              />
              <HelpText>Opcional.</HelpText>
            </div>

            <div className="grid gap-2">
              <FieldLabel>Título</FieldLabel>
              <Input
                value={p.titleText}
                onChange={(e) => p.onTitleChange(e.target.value)}
                placeholder="Coca Cola 2L"
                disabled={disabled}
              />
              <HelpText>Opcional.</HelpText>
            </div>
          </div>

          {/* Precio + Costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <FieldLabel required>Precio (minor)</FieldLabel>
              <Input inputMode="numeric" value={p.price} onChange={(e) => p.onPriceChange(e.target.value)} disabled={disabled} />
            </div>
            <div className="grid gap-2">
              <FieldLabel>Costo (minor)</FieldLabel>
              <Input inputMode="numeric" value={p.cost} onChange={(e) => p.onCostChange(e.target.value)} disabled={disabled} />
            </div>
          </div>

          <VariantImagePicker value={p.imageFile} onChange={p.onImageChange} disabled={disabled} />
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => p.onOpenChange(false)} disabled={disabled}>
            Cancelar
          </Button>
          <Button onClick={p.onSubmit} disabled={!canSubmit}>
            {disabled ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
