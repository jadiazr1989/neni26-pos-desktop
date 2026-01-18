// src/modules/catalog/brands/ui/BrandsScreen.tsx
"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";
import { brandService } from "@/lib/modules/catalog/brands/brand.service";
import { useInfiniteBrands } from "./hooks/useInfiniteBrands";
import { BrandsTable } from "./ui/BrandsTable";
import { BrandDialog } from "./ui/BrandDialog";

export function BrandsScreen() {
  const [search, setSearch] = React.useState("");
  const pager = useInfiniteBrands({ search });

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [selected, setSelected] = React.useState<BrandDTO | null>(null);

  // carga inicial
  React.useEffect(() => {
    void pager.loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pager.reset]); // o usa un flag local; lo importante es 1 sola vez.

  async function refresh() {
    pager.reset();
    await pager.loadMore();
  }

  async function onSubmit(payload: { name: string; slug: string }) {
    pager.setError(null);

    if (dialogMode === "create") {
      await brandService.create({ name: payload.name, slug: payload.slug });
    } else if (selected) {
      await brandService.update(selected.id, { name: payload.name, slug: payload.slug });
    }

    setDialogOpen(false);
    setSelected(null);
    await refresh();
  }

  async function onDelete(id: string) {
    pager.setError(null);
    const ok = window.confirm("Eliminar marca (hard delete). ¿Continuar?");
    if (!ok) return;

    await brandService.remove(id);
    await refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Marcas</h1>
          <p className="text-sm text-muted-foreground">Listado con virtualización + paginación.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void refresh()} disabled={pager.loading}>
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
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {pager.error && (
            <Alert>
              <AlertDescription>{pager.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre/slug…" />
            <Button variant="outline" onClick={() => void refresh()} disabled={pager.loading}>
              Buscar
            </Button>
          </div>

          <BrandsTable
            rows={pager.items}
            loading={pager.loading}
            hasMore={pager.hasMore}
            loadMore={() => void pager.loadMore()}
            onEdit={(b) => {
              setDialogMode("edit");
              setSelected(b);
              setDialogOpen(true);
            }}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      <BrandDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={selected}
        loading={pager.loading}
        onOpenChange={setDialogOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
}
