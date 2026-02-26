// src/modules/catalog/products/ui/ProductDialog.view.tsx
"use client";

import * as React from "react";
import { AsyncComboboxSingle } from "@/components/shared/AsyncComboboxSingle";
import { FieldLabel } from "@/components/shared/utils/FieldLabel";
import { HelpText } from "@/components/shared/utils/HelpText";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LoadState = "idle" | "loading" | "ready" | "error";
type Option = { value: string; label: string };

export type ProductDialogViewProps = {
  open: boolean;
  title: string;
  submitting: boolean;
  mode: "create" | "edit";

  name: string;
  barcode: string;
  description: string;
  brandId: string | null;
  categoryId: string | null;

  error: string | null;

  brandOptions: {
    loadState: LoadState;
    loadError: string | null;
    items: Option[];
    search: string;
    setSearch: (v: string) => void;
    ensureLoaded: () => void;
  };

  categoryOptions: {
    loadState: LoadState;
    loadError: string | null;
    items: Option[];
    search: string;
    setSearch: (v: string) => void;
    ensureLoaded: () => void;
  };

  onOpenChange: (v: boolean) => void;
  onNameChange: (v: string) => void;
  onBarcodeChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onBrandChange: (v: string | null) => void;
  onCategoryChange: (v: string | null) => void;
  onSubmit: () => void;
};

export function ProductDialogView(p: ProductDialogViewProps) {
  const canSubmit = !p.submitting && !!p.name.trim() && !!p.categoryId;

  return (
    <Dialog open={p.open} onOpenChange={p.onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">{p.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {p.mode === "create"
              ? "Crea un producto (la variante base se crea por backend)."
              : "Edita la información general del producto."}
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {p.error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{p.error}</AlertDescription>
            </Alert>
          )}

          {/* Nombre */}
          <div className="grid gap-2">
            <FieldLabel required>Nombre</FieldLabel>
            <Input
              value={p.name}
              onChange={(e) => p.onNameChange(e.target.value)}
              placeholder="Ej: Coca Cola"
              disabled={p.submitting}
            />
            <HelpText>Visible en catálogo y POS.</HelpText>
          </div>

          {/* Barcode + Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <FieldLabel>Barcode</FieldLabel>
              <Input
                value={p.barcode}
                onChange={(e) => p.onBarcodeChange(e.target.value)}
                placeholder="Ej: 0123456789"
                disabled={p.submitting}
              />
              <HelpText>Opcional (scanner).</HelpText>
            </div>

            <div className="md:col-span-8">
              <FieldLabel>Descripción</FieldLabel>
              <Textarea
                value={p.description}
                onChange={(e) => p.onDescriptionChange(e.target.value)}
                placeholder="Ej: 2L, sabor original, pack x6…"
                disabled={p.submitting}
                rows={3}
              />
              <HelpText>Opcional.</HelpText>
            </div>
          </div>

          {/* Marca + Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <FieldLabel>Marca</FieldLabel>
              <AsyncComboboxSingle
                value={p.brandId}
                onChange={p.onBrandChange}
                placeholder="Seleccionar marca…"
                searchPlaceholder="Buscar marca…"
                emptyText="Sin marcas."
                disabled={p.submitting}
                loadState={p.brandOptions.loadState}
                loadError={p.brandOptions.loadError}
                items={p.brandOptions.items}
                search={p.brandOptions.search}
                setSearch={p.brandOptions.setSearch}
                ensureLoaded={p.brandOptions.ensureLoaded}
              />
              <HelpText>Opcional.</HelpText>
            </div>

            <div className="grid gap-2">
              <FieldLabel required>Categoría</FieldLabel>
              <AsyncComboboxSingle
                value={p.categoryId}
                onChange={p.onCategoryChange}
                placeholder="Seleccionar categoría…"
                searchPlaceholder="Buscar categoría…"
                emptyText="Sin categorías."
                disabled={p.submitting}
                loadState={p.categoryOptions.loadState}
                loadError={p.categoryOptions.loadError}
                items={p.categoryOptions.items}
                search={p.categoryOptions.search}
                setSearch={p.categoryOptions.setSearch}
                ensureLoaded={p.categoryOptions.ensureLoaded}
              />
              <HelpText>Requerida.</HelpText>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {!p.categoryId ? "* Requiere categoría para guardar." : null}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => p.onOpenChange(false)} disabled={p.submitting}>
              Cancelar
            </Button>
            <Button onClick={p.onSubmit} disabled={!canSubmit}>
              {p.submitting ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
