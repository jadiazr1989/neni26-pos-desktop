// src/modules/catalog/products/ui/ProductDetailScreen.tsx
"use client";

import * as React from "react";
import { ArrowLeft, Plus, RefreshCw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { VariantDialog } from "./ui/VariantDialog";
import { VariantsTable } from "./ui/VariantsTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProductDetailScreen } from "./hooks/useProductDetailScreen";

export function ProductDetailScreen(props: { productId: string }) {
  const vm = useProductDetailScreen(props.productId);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={vm.goBack} title="Volver">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold">{vm.product?.name ?? "Producto"}</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{vm.productId}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.reload(true)} disabled={vm.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={vm.openCreate} disabled={!vm.product || vm.loading} variant="outline">
            <Plus className="mr-2 size-4" />
            Nueva variante
          </Button>
        </div>
      </div>

      {vm.d.error && (
        <Alert>
          <AlertDescription>{vm.d.error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Variantes</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={vm.controls.variantSearch}
              onChange={(e) => vm.controls.setVariantSearch(e.target.value)}
              placeholder="Buscar por SKU / barcode / título…"
              disabled={vm.loading}
              className="sm:w-[360px]"
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={vm.controls.variantFilter === "all" ? "secondary" : "outline"}
                onClick={() => vm.controls.setVariantFilter("all")}
                disabled={vm.loading}
              >
                Todas ({vm.controls.counts.total})
              </Button>
              <Button
                size="sm"
                variant={vm.controls.variantFilter === "active" ? "secondary" : "outline"}
                onClick={() => vm.controls.setVariantFilter("active")}
                disabled={vm.loading}
              >
                Activas ({vm.controls.counts.active})
              </Button>
              <Button
                size="sm"
                variant={vm.controls.variantFilter === "inactive" ? "secondary" : "outline"}
                onClick={() => vm.controls.setVariantFilter("inactive")}
                disabled={vm.loading}
              >
                Desactivadas ({vm.controls.counts.inactive})
              </Button>
            </div>
          </div>

          <VariantsTable
            rows={vm.controls.filteredVariants}
            loading={vm.loading}
            onEdit={vm.openEdit}
            onToggleActiveRequest={vm.requestToggleActive}
          />
        </CardContent>
      </Card>

      <VariantDialog
        open={vm.dlgOpen}
        mode={vm.dlgMode}
        productId={vm.productId}
        initial={vm.selected}
        onOpenChange={vm.onOpenChangeDialog}
        onSaved={vm.onSavedVariant}
      />

      <ConfirmDialog
        open={!!vm.confirmActive}
        onOpenChange={(v) => !v && vm.onCancelConfirmActive()}
        title={vm.confirmActive?.nextActive ? "Activar variante" : "Ocultar variante"}
        description={
          vm.confirmActive
            ? vm.confirmActive.nextActive
              ? `La variante “${vm.confirmActive.label}” volverá a estar disponible para la venta.`
              : `La variante “${vm.confirmActive.label}” dejará de aparecer en ventas y escáner.`
            : undefined
        }
        confirmText={vm.confirmActive?.nextActive ? "Activar" : "Ocultar"}
        destructive={!vm.confirmActive?.nextActive}
        busy={vm.toggling}
        onConfirm={vm.confirmToggleActive}
      />
    </div>
  );
}
