// src/modules/catalog/products/ui/hooks/useProductsScreen.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";
import { useProductsList } from "../hooks/useProductsList";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";

export function useProductsScreen() {
  const router = useRouter();
  const list = useProductsList({ debounceMs: 300 });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ProductDTO | null>(null);

  const [variantDlgOpen, setVariantDlgOpen] = React.useState(false);
  const [variantProductId, setVariantProductId] = React.useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const openCreate = React.useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);

  const openEdit = React.useCallback((p: ProductDTO) => {
    setEditing(p);
    setDialogOpen(true);
  }, []);

  const onOpenProduct = React.useCallback(
    (p: ProductDTO) => {
      router.push(`/admin/products/${p.id}`);
    },
    [router]
  );

  // ✅ Paso 1: abre confirm (async para compatibilidad con tablas que esperan Promise)
  const onDelete = React.useCallback(async (id: string, name: string) => {
    setConfirmDelete({ id, name });
  }, []);

  const onCancelDelete = React.useCallback(() => setConfirmDelete(null), []);

  // ✅ Paso 2: ejecuta delete
  const onConfirmDelete = React.useCallback(async () => {
    if (!confirmDelete || deleting) return;

    setDeleting(true);
    try {
      await productService.remove(confirmDelete.id);
      notify.success({ title: "Eliminado", description: "Producto eliminado correctamente." });
      await list.refresh();
    } catch (e: unknown) {
      if (isApiHttpError(e)) {
        if (e.status === 409) {
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
        notify.error({ title: "Error", description: e.message });
        return;
      }

      const msg = e instanceof Error ? e.message : "No se pudo eliminar el producto.";
      notify.error({ title: "Error", description: msg });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleting, list]);

  const onOpenChangeProductDialog = React.useCallback((v: boolean) => {
    setDialogOpen(v);
    if (!v) setEditing(null);
  }, []);

  const onSavedProduct = React.useCallback(
    async (productId: string) => {
      setDialogOpen(false);
      setEditing(null);

      await list.refresh();

      setVariantProductId(productId);
      setVariantDlgOpen(true);

      router.push(`/admin/products/${productId}`);
    },
    [list, router]
  );

  const onOpenChangeVariantDialog = React.useCallback((v: boolean) => {
    setVariantDlgOpen(v);
    if (!v) setVariantProductId(null);
  }, []);

  const onSavedVariant = React.useCallback(async () => {
    await list.refresh();
    if (variantProductId) router.push(`/admin/products/${variantProductId}`);
  }, [list, router, variantProductId]);

  return {
    router,
    list,

    dialogOpen,
    editing,
    openCreate,
    openEdit,
    onOpenProduct,
    onOpenChangeProductDialog,
    onSavedProduct,

    variantDlgOpen,
    variantProductId,
    onOpenChangeVariantDialog,
    onSavedVariant,

    confirmDelete,
    deleting,
    onDelete,
    onCancelDelete,
    onConfirmDelete,
  };
}
