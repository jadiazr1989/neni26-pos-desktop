// src/modules/catalog/products/ui/ProductsScreen.tsx
"use client";

import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useProductsScreen } from "./hooks/useProductsScreen";
import { ProductDialog } from "./ui/ProductDialog";
import { ProductsTable } from "./ui/ProductsTable";
import { VariantDialog } from "./ui/VariantDialog";

export function ProductsScreen() {
  const vm = useProductsScreen();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">Listado + búsqueda + virtualización.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.list.refresh()} disabled={vm.list.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={vm.openCreate} variant="outline">
            <Plus className="mr-2 size-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.list.error && (
            <Alert>
              <AlertDescription>{vm.list.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              value={vm.list.search}
              onChange={(e) => vm.list.setSearch(e.target.value)}
              placeholder="Buscar por name/barcode/sku… (debounce 300ms)"
            />
            <Button variant="outline" onClick={() => void vm.list.refresh()} disabled={vm.list.loading}>
              Buscar
            </Button>
          </div>

          <ProductsTable
            rows={vm.list.rows}
            loading={vm.list.loading}
            hasMore={vm.list.hasMore}
            loadMore={() => void vm.list.loadMore()}
            selectedId={vm.editing?.id ?? null}
            onOpen={vm.onOpenProduct}
            onEdit={vm.openEdit}
            onDelete={vm.onDelete}
          />

          <div className="text-xs text-muted-foreground">
            Tip: click en un producto para abrir detalle.{" "}
            <Link className="underline" href="/admin/products">
              /catalog/products
            </Link>
          </div>
        </CardContent>
      </Card>

      <ProductDialog
        open={vm.dialogOpen}
        onOpenChange={vm.onOpenChangeProductDialog}
        initial={vm.editing}
        onSaved={vm.onSavedProduct}
      />

      <VariantDialog
        open={vm.variantDlgOpen}
        mode="create"
        productId={vm.variantProductId ?? ""}
        initial={null}
        onOpenChange={vm.onOpenChangeVariantDialog}
        onSaved={vm.onSavedVariant}
      />

      <ConfirmDialog
        open={!!vm.confirmDelete}
        onOpenChange={(v) => !v && vm.onCancelDelete()}
        title="Eliminar producto"
        description={
          vm.confirmDelete
            ? `Eliminar “${vm.confirmDelete.name}” de forma permanente. Solo si NO tiene variantes. ¿Deseas continuar?`
            : undefined
        }
        confirmText="Eliminar"
        destructive
        busy={vm.deleting}
        onConfirm={vm.onConfirmDelete}
      />
    </div>
  );
}
