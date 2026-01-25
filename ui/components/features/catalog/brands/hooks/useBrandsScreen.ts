// src/modules/catalog/brands/ui/hooks/useBrandsScreen.ts
"use client";

import * as React from "react";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";
import { brandService } from "@/lib/modules/catalog/brands/brand.service";
import { useInfiniteBrands } from "./useInfiniteBrands";
import { ApiHttpError } from "@/lib/api.errors";
import { notify } from "@/lib/notify/notify";

type BrandFormPayload = { name: string; slug: string };

export function useBrandsScreen() {
  const [search, setSearch] = React.useState("");

  // 🔑 mismo criterio que en useInfiniteBrands
  const queryKey = React.useMemo(() => JSON.stringify({ search }), [search]);

  const pager = useInfiniteBrands({ search });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<BrandDTO | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // ✅ carga inicial: 1 vez por queryKey (evita dependencia a funciones)
  React.useEffect(() => {
    pager.reset();
    void pager.loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const refresh = React.useCallback(async () => {
    pager.reset();
    await pager.loadMore();
  }, [pager]);

  const openCreate = React.useCallback(() => {
    setDialogMode("create");
    setSelected(null);
    setDialogOpen(true);
  }, []);

  const openEdit = React.useCallback((b: BrandDTO) => {
    setDialogMode("edit");
    setSelected(b);
    setDialogOpen(true);
  }, []);

  const onOpenChangeDialog = React.useCallback((v: boolean) => {
    setDialogOpen(v);
    if (!v) setSelected(null);
  }, []);

  const onSubmit = React.useCallback(
    async (payload: BrandFormPayload) => {
      pager.setError(null);

      try {
        if (dialogMode === "create") {
          await brandService.create({ name: payload.name, slug: payload.slug });
          notify.success({ title: "Marca creada", description: payload.name });
        } else if (selected) {
          await brandService.update(selected.id, { name: payload.name, slug: payload.slug });
          notify.success({ title: "Marca actualizada", description: payload.name });
        }

        setDialogOpen(false);
        setSelected(null);
        await refresh();
      } catch (e: unknown) {
        if (e instanceof ApiHttpError) {
          notify.warning({ title: "No se pudo guardar", description: e.message });
          pager.setError(e.message);
          return;
        }
        notify.error({ title: "Error", description: "No se pudo guardar la marca." });
      }
    },
    [dialogMode, selected, pager, refresh]
  );

  // Paso 1: solicitar delete (abre confirm)
  const onDelete = React.useCallback((id: string, name: string) => {
    setConfirmDelete({ id, name });
  }, []);

  const onCancelDelete = React.useCallback(() => setConfirmDelete(null), []);

  // Paso 2: confirmar delete
  const onConfirmDelete = React.useCallback(async () => {
    if (!confirmDelete || deleting) return;

    setDeleting(true);
    try {
      await brandService.remove(confirmDelete.id);
      notify.success({ title: "Marca eliminada", description: "La marca se eliminó correctamente." });
      await refresh();
    } catch (e: unknown) {
      if (e instanceof ApiHttpError) {
        if (e.status === 409) {
          notify.warning({
            title: "No se puede eliminar",
            description: "Esta marca tiene productos asociados.",
          });
          return;
        }
        notify.error({ title: "Error", description: e.message });
        return;
      }
      notify.error({ title: "Error inesperado", description: "No se pudo eliminar la marca." });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleting, refresh]);

  return {
    search,
    setSearch,

    pager,

    dialogOpen,
    dialogMode,
    selected,
    openCreate,
    openEdit,
    onOpenChangeDialog,
    onSubmit,

    confirmDelete,
    deleting,
    onDelete,
    onCancelDelete,
    onConfirmDelete,

    refresh,
  };
}
