// src/modules/catalog/brands/ui/BrandsScreen.tsx
"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { BrandsTable } from "./ui/BrandsTable";
import { BrandDialog } from "./ui/BrandDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useBrandsScreen } from "./hooks/useBrandsScreen";

export function BrandsScreen() {
  const vm = useBrandsScreen();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Marcas</h1>
          <p className="text-sm text-muted-foreground">Listado con virtualización + paginación.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.refresh()} disabled={vm.pager.loading}>
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
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.pager.error && (
            <Alert>
              <AlertDescription>{vm.pager.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Buscar por nombre/slug…"
            />
            <Button variant="outline" onClick={() => void vm.refresh()} disabled={vm.pager.loading}>
              Buscar
            </Button>
          </div>

          <BrandsTable
            rows={vm.pager.items}
            loading={vm.pager.loading}
            hasMore={vm.pager.hasMore}
            loadMore={() => void vm.pager.loadMore()}
            onEdit={vm.openEdit}
            onDelete={vm.onDelete}
          />
        </CardContent>
      </Card>

      <BrandDialog
        open={vm.dialogOpen}
        mode={vm.dialogMode}
        initial={vm.selected}
        loading={vm.pager.loading}
        onOpenChange={vm.onOpenChangeDialog}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        open={!!vm.confirmDelete}
        onOpenChange={(v) => !v && vm.onCancelDelete()}
        title="Eliminar marca"
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
