// src/modules/catalog/categories/ui/CategoriesScreen.tsx
"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CategoriesTreeTable } from "./ui/CategoriesTreeTable";
import { CategoryDialog } from "./ui/CategoryDialog";
import { CategoriesNavHeader } from "./ui/CategoriesNavHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCategoriesScreen } from "./hooks/useCategoriesScreen";

export function CategoriesScreen() {
  const vm = useCategoriesScreen();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Categorías</h1>
          <p className="text-sm text-muted-foreground">Tree view por niveles con paginación + debounce.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.tree.refresh()} disabled={vm.tree.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={vm.openCreate} variant="outline">
            <Plus className="mr-2 size-4" />
            Nueva
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CategoriesNavHeader
            isSearching={vm.isSearching}
            crumbs={vm.crumbs}
            resultCount={vm.isSearching ? vm.tree.rows.length : undefined}
            onPickCrumb={vm.onPickCrumb}
            onCloseLast={vm.onCloseLast}
            onExitSearch={vm.onExitSearch}
          />
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.tree.error && (
            <Alert>
              <AlertDescription>{vm.tree.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              value={vm.tree.search}
              onChange={(e) => vm.tree.setSearch(e.target.value)}
              placeholder="Buscar por nombre/slug… (debounce 300ms)"
            />
            <Button variant="outline" onClick={() => void vm.tree.refresh()} disabled={vm.tree.loading}>
              Buscar
            </Button>
          </div>

          <CategoriesTreeTable
            rows={vm.tree.rows}
            loading={vm.tree.loading}
            hasMore={vm.tree.hasMore}
            loadMore={() => void vm.tree.loadMore()}
            onOpen={(c) => vm.tree.openChild(c)}
            onEdit={vm.openEdit}
            onDelete={vm.onDelete}
          />
        </CardContent>
      </Card>

      <CategoryDialog
        open={vm.dialogOpen}
        mode={vm.dialogMode}
        initial={vm.selected}
        loading={vm.tree.loading}
        onOpenChange={vm.onOpenChangeDialog}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        open={!!vm.confirmDelete}
        onOpenChange={(v) => !v && vm.onCancelDelete()}
        title="Eliminar categoría"
        description={
          vm.confirmDelete
            ? `Eliminar “${vm.confirmDelete.name}” de forma permanente. ¿Deseas continuar?`
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
