"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";

import { TriStateFilterBar } from "@/components/shared/TriStateFilterBar";
import { useWarehousesScreen } from "./hooks/useWarehousesScreen";
import { WarehouseDialog } from "./ui/WarehouseDialog";
import { WarehousesTable } from "./ui/WarehousesTable";

export function WarehousesScreen() {
    const vm = useWarehousesScreen();

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Warehouses</h1>
                    <p className="text-sm text-muted-foreground">
                        Gestiona warehouses del store actual (contexto por terminal).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => void vm.refresh()} disabled={vm.loading}>
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
                    <CardTitle className="">Listado</CardTitle>
                </CardHeader>

                <CardContent className="grid gap-3">

                    <TriStateFilterBar
                        search={vm.search}
                        onSearchChange={vm.setSearch}
                        onSearchSubmit={() => void vm.submitSearch()} // ✅ ENTER o botón Buscar
                        searchButtonText="Buscar"
                        placeholder="Buscar por nombre, código o ubicación…"
                        filter={vm.filter}
                        onFilterChange={(v) => void vm.setFilterAndRefresh(v)} // ✅ aplica filtro server-side
                        counts={vm.counts}
                        busy={vm.loading}
                    />


                    {vm.error ? <div className="text-sm text-destructive">{vm.error}</div> : null}

                    <WarehousesTable
                        rows={vm.rows}
                        loading={vm.loading}
                        hasMore={vm.hasMore}
                        loadMore={vm.loadMore}
                        onEdit={vm.openEdit}
                        onToggleActive={vm.onToggleActive}
                        height={560}
                    />

                </CardContent>
            </Card>

            <WarehouseDialog
                open={vm.dialogOpen}
                mode={vm.dialogMode}
                initial={vm.selected}
                loading={vm.loading}
                onOpenChange={vm.onOpenChangeDialog}
                onSubmit={vm.onSubmit}
            />
        </div>
    );
}
