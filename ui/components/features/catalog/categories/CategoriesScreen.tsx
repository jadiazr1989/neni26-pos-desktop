// src/modules/catalog/categories/ui/CategoriesScreen.tsx
"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { CategoryDTO } from "@/lib/modules/catalog/categories/category.dto";
import { categoryService } from "@/lib/modules/catalog/categories/category.service";
import { useCategoryTree } from "./hooks/useCategoryTree";
import { CategoriesTreeTable } from "./ui/CategoriesTreeTable";
import { CategoryDialog } from "./ui/CategoryDialog";
import { CategoriesNavHeader } from "./ui/CategoriesNavHeader";

export function CategoriesScreen() {
  const tree = useCategoryTree({ debounceMs: 300 });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<CategoryDTO | null>(null);

  const isSearching = tree.search.trim().length > 0;

  const crumbs = React.useMemo(
    () => (isSearching ? [{ id: null, label: "Resultados" }] : tree.breadcrumbs),
    [isSearching, tree.breadcrumbs]
  );

  async function onSubmit(payload: { name: string; slug: string; parentId: string | null; imageFile: File | null }) {
    tree.setError(null);

    if (dialogMode === "create") {
      const finalParentId = payload.parentId ?? tree.parentId;

      const id = await categoryService.create({
        name: payload.name,
        slug: payload.slug,
        parentId: finalParentId,
      });

      if (payload.imageFile) await categoryService.uploadImage(id, payload.imageFile);
    } else if (selected) {
      await categoryService.update(selected.id, {
        name: payload.name,
        slug: payload.slug,
        parentId: payload.parentId,
      });
      if (payload.imageFile) await categoryService.uploadImage(selected.id, payload.imageFile);
    }

    setDialogOpen(false);
    setSelected(null);
    await tree.refresh();
  }

  async function onDelete(id: string) {
    tree.setError(null);
    const ok = window.confirm("Eliminar categoría (hard delete). ¿Continuar?");
    if (!ok) return;

    await categoryService.remove(id);
    await tree.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">Tree view por niveles con paginación + debounce.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void tree.refresh()} disabled={tree.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button
            onClick={() => {
              setDialogMode("create");
              setSelected(null);
              setDialogOpen(true);
            }}
            variant="outline"
          >
            <Plus className="mr-2 size-4" />
            Nueva
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CategoriesNavHeader
            isSearching={isSearching}
            crumbs={crumbs}
            resultCount={isSearching ? tree.rows.length : undefined}
            onPickCrumb={(idx) => {
              if (isSearching) {
                tree.setSearch("");
                tree.openRoot();
                void tree.refresh();
                return;
              }
              tree.goToCrumb(idx);
            }}
            onCloseLast={() => tree.goUp()} // ✅ AQUÍ SALE LA X
            onExitSearch={() => {
              tree.setSearch("");
              tree.openRoot();
              void tree.refresh();
            }}
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {tree.error && (
            <Alert>
              <AlertDescription>{tree.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              value={tree.search}
              onChange={(e) => tree.setSearch(e.target.value)}
              placeholder="Buscar por nombre/slug… (debounce 300ms)"
            />
            <Button variant="outline" onClick={() => void tree.refresh()} disabled={tree.loading}>
              Aplicar
            </Button>
          </div>

          <CategoriesTreeTable
            rows={tree.rows}
            loading={tree.loading}
            hasMore={tree.hasMore}
            loadMore={() => void tree.loadMore()}
            onOpen={(c) => tree.openChild(c)}
            onEdit={(c) => {
              setDialogMode("edit");
              setSelected(c);
              setDialogOpen(true);
            }}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      <CategoryDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        loading={tree.loading}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
}
