"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useBrandsScreen } from "./hooks/useBrandsScreen";
import { BrandDialog } from "./ui/BrandDialog";
import { BrandsTable } from "./ui/BrandsTable";

export function BrandsScreen() {
  const vm = useBrandsScreen();
  const selectedId = vm.selected?.id ?? null;

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

          <Button onClick={vm.openCreate} variant="outline" disabled={vm.pager.loading}>
            <Plus className="mr-2 size-4" />
            Nueva
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.pager.error ? (
            <Alert>
              <AlertDescription>{vm.pager.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-2">
            <Input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Buscar por nombre/slug…"
              disabled={vm.pager.loading}
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
            height={520}
            selectedId={selectedId}
            onRowClick={(b) => vm.openEdit(b)} // ✅ click fila = edit
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
        // ✅ delete desde el dialog
        onRequestDelete={(b) => vm.onDelete(b.id, b.name)}
      />

      <ConfirmDialog
        open={!!vm.confirmDelete}
        onOpenChange={(v) => !v && vm.onCancelDelete()}
        title="Eliminar marca"
        description={
          vm.confirmDelete
            ? `Eliminar “${vm.confirmDelete.name}” de forma permanente. Si tiene productos asociados, no se podrá eliminar. ¿Deseas continuar?`
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