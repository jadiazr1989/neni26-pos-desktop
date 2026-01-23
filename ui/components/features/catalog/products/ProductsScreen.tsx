// src/modules/catalog/products/ui/ProductsScreen.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useProductsList } from "./hooks/useProductsList";
import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { ProductsTable } from "./ui/ProductsTable";
import { ProductDialog } from "./ui/ProductDialog";
import { useRouter } from "next/navigation";
import { VariantDialog } from "./ui/VariantDialog";

import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope"; // ✅ recomendado (un solo lugar)

export function ProductsScreen() {
  const router = useRouter();
  const list = useProductsList({ debounceMs: 300 });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductDTO | null>(null);

  const [variantDlgOpen, setVariantDlgOpen] = React.useState(false);
  const [variantProductId, setVariantProductId] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    const ok = window.confirm("Eliminar producto (solo si NO tiene variants). ¿Continuar?");
    if (!ok) return;

    try {
      await productService.remove(id);
      notify.success({ title: "Eliminado", description: "Producto eliminado correctamente." });
      await list.refresh();
    } catch (e: unknown) {
      if (isApiHttpError(e)) {
        // 409 = conflicto de negocio (ej: tiene variantes)
        if (e.status === 409) {
          // si tu backend manda code específico, úsalo; si no, solo el status
          if (e.code === "PRODUCT_HAS_VARIANTS") {
            notify.warning({
              title: "No se puede eliminar",
              description: "Este producto tiene variantes. Elimina las variantes primero e intenta de nuevo.",
            });
            return;
          }

          notify.warning({ title: "No se puede eliminar", description: e.message });
          return;
        }

        // resto = error real
        notify.error({ title: "Error", description: e.message });
        return;
      }

      const msg = e instanceof Error ? e.message : "No se pudo eliminar el producto.";
      notify.error({ title: "Error", description: msg });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">Listado + búsqueda + virtualización.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void list.refresh()} disabled={list.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            variant="outline"
          >
            <Plus className="mr-2 size-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {list.error && (
            <Alert>
              <AlertDescription>{list.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              value={list.search}
              onChange={(e) => list.setSearch(e.target.value)}
              placeholder="Buscar por name/barcode/sku… (debounce 300ms)"
            />
            <Button variant="outline" onClick={() => void list.refresh()} disabled={list.loading}>
              Aplicar
            </Button>
          </div>

          <ProductsTable
            rows={list.rows}
            loading={list.loading}
            hasMore={list.hasMore}
            loadMore={() => void list.loadMore()}
            onOpen={(p) => router.push(`/admin/products/${p.id}`)}
            onEdit={(p) => {
              setEditing(p);
              setDialogOpen(true);
            }}
            onDelete={onDelete}
          />

          <div className="text-xs text-muted-foreground">
            Tip: click en un producto para abrir detalle.{" "}
            <Link className="underline" href="/catalog/products">
              /catalog/products
            </Link>
          </div>
        </CardContent>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditing(null);
        }}
        initial={editing}
        onSaved={async (productId) => {
          setDialogOpen(false);
          setEditing(null);
          await list.refresh();

          setVariantProductId(productId);
          setVariantDlgOpen(true);

          router.push(`/admin/products/${productId}`);
        }}
      />

      <VariantDialog
        open={variantDlgOpen}
        mode="create"
        productId={variantProductId ?? ""}
        initial={null}
        onOpenChange={(v) => {
          setVariantDlgOpen(v);
          if (!v) setVariantProductId(null);
        }}
        onSaved={async () => {
          await list.refresh();
          if (variantProductId) router.push(`/admin/products/${variantProductId}`);
        }}
      />
    </div>
  );
}
