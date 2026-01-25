// src/modules/catalog/categories/ui/hooks/useCategoriesScreen.ts
"use client";

import * as React from "react";
import type { CategoryDTO } from "@/lib/modules/catalog/categories/category.dto";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";
import { useCategoryTree } from "../hooks/useCategoryTree";
import { ApiHttpError } from "@/lib/api.errors";
import { notify } from "@/lib/notify/notify";

type CategoryFormPayload = {
  name: string;
  slug: string;
  parentId: string | null;
  imageFile: File | null;
};

export function useCategoriesScreen() {
  const tree = useCategoryTree({ debounceMs: 300 });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<CategoryDTO | null>(null);

  const [confirmDelete, setConfirmDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const isSearching = tree.search.trim().length > 0;

  const crumbs = React.useMemo(
    () => (isSearching ? [{ id: null, label: "Resultados" }] : tree.breadcrumbs),
    [isSearching, tree.breadcrumbs]
  );

  const openCreate = React.useCallback(() => {
    setDialogMode("create");
    setSelected(null);
    setDialogOpen(true);
  }, []);

  const openEdit = React.useCallback((c: CategoryDTO) => {
    setDialogMode("edit");
    setSelected(c);
    setDialogOpen(true);
  }, []);

  const onOpenChangeDialog = React.useCallback((v: boolean) => {
    setDialogOpen(v);
    if (!v) setSelected(null);
  }, []);

  const onDelete = React.useCallback(async (id: string, name: string) => {
    setConfirmDelete({ id, name });
  }, []);

  const onCancelDelete = React.useCallback(() => setConfirmDelete(null), []);

  const onConfirmDelete = React.useCallback(async () => {
    if (!confirmDelete || deleting) return;

    setDeleting(true);
    try {
      await categoryService.remove(confirmDelete.id);
      notify.success({
        title: "Categoría eliminada",
        description: "La categoría se eliminó correctamente.",
      });
      await tree.refresh();
    } catch (e: unknown) {
      if (e instanceof ApiHttpError) {
        if (e.status === 409) {
          notify.warning({
            title: "No se puede eliminar",
            description: "Esta categoría tiene subcategorías o productos asociados.",
          });
          return;
        }
        notify.error({ title: "Error", description: e.message });
        return;
      }

      notify.error({
        title: "Error inesperado",
        description: "No se pudo eliminar la categoría.",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleting, tree]);

  const onSubmit = React.useCallback(
    async (payload: CategoryFormPayload) => {
      tree.setError(null);

      try {
        if (dialogMode === "create") {
          const finalParentId = payload.parentId ?? tree.parentId;

          const id = await categoryService.create({
            name: payload.name,
            slug: payload.slug,
            parentId: finalParentId,
          });

          if (payload.imageFile) {
            await categoryService.uploadImage(id, payload.imageFile);
          }

          notify.success({ title: "Categoría creada", description: payload.name });
        } else if (selected) {
          await categoryService.update(selected.id, {
            name: payload.name,
            slug: payload.slug,
            parentId: payload.parentId,
          });

          if (payload.imageFile) {
            await categoryService.uploadImage(selected.id, payload.imageFile);
          }

          notify.success({ title: "Categoría actualizada", description: payload.name });
        }

        setDialogOpen(false);
        setSelected(null);
        await tree.refresh();
      } catch (e: unknown) {
        if (e instanceof ApiHttpError) {
          notify.warning({ title: "No se pudo guardar", description: e.message });
          tree.setError(e.message);
          return;
        }

        notify.error({ title: "Error", description: "No se pudo guardar la categoría." });
      }
    },
    [dialogMode, selected, tree]
  );

  const onPickCrumb = React.useCallback(
    (idx: number) => {
      if (isSearching) {
        tree.setSearch("");
        tree.openRoot();
        void tree.refresh();
        return;
      }
      tree.goToCrumb(idx);
    },
    [isSearching, tree]
  );

  const onCloseLast = React.useCallback(() => tree.goUp(), [tree]);

  const onExitSearch = React.useCallback(() => {
    tree.setSearch("");
    tree.openRoot();
    void tree.refresh();
  }, [tree]);

  return {
    tree,

    // derived
    isSearching,
    crumbs,

    // dialog
    dialogOpen,
    dialogMode,
    selected,
    openCreate,
    openEdit,
    onOpenChangeDialog,

    // submit
    onSubmit,

    // delete
    confirmDelete,
    deleting,
    onDelete,
    onCancelDelete,
    onConfirmDelete,

    // nav header
    onPickCrumb,
    onCloseLast,
    onExitSearch,
  };
}
