// src/modules/purchases/ui/PurchasesScreen.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw } from "lucide-react";

import type { DatePreset, PurchaseStatusFilter } from "./hooks/purchase.filters";
import { usePurchasesScreen } from "./hooks/usePurchasesScreen";
import { PurchaseFilter } from "./ui/PurchaseFilter";
import { PurchasesTable } from "./ui/PurchasesTable";

export function PurchasesScreen() {
  const vm = usePurchasesScreen();
  const f = vm.filters;

  const statusOptions: Array<{ value: PurchaseStatusFilter; label: string }> = [
    { value: "ALL", label: "Todas" },
    { value: "DRAFT", label: "Borrador" },
    { value: "ORDERED", label: "Ordenada" },
    { value: "RECEIVED", label: "Recibida" },
    { value: "CANCELLED", label: "Cancelada" },
  ];

  const presetOptions: Array<{ value: DatePreset; label: string }> = [
    { value: "TODAY", label: "Hoy" },
    { value: "LAST_7_DAYS", label: "Últimos 7 días" },
    { value: "LAST_30_DAYS", label: "Últimos 30 días" },
    { value: "THIS_MONTH", label: "Este mes" },
    { value: "RANGE", label: "Rango…" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Compras</h1>
          <p className="text-sm text-muted-foreground">Listado + filtros. Click abre detalle.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.refresh()} disabled={vm.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={() => void vm.createAndOpen()} variant="outline" disabled={vm.loading}>
            <Plus className="mr-2 size-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.error && (
            <Alert>
              <AlertDescription>{vm.error}</AlertDescription>
            </Alert>
          )}

          <PurchaseFilter<PurchaseStatusFilter, DatePreset>
            loading={vm.loading}
            search={f.search}
            onSearchChange={vm.setSearch}
            searchPlaceholder="Invoice / proveedor / notas…"
            chipOptions={statusOptions}
            chipValue={f.status}
            onChipChange={vm.setStatus}
            selectOptions={presetOptions}
            selectValue={f.datePreset}
            onSelectChange={vm.setDatePreset}
            rangeValue="RANGE"
            from={f.from}
            to={f.to}
            onFromChange={vm.setRangeFrom}
            onToChange={vm.setRangeTo}
            onClear={vm.clearFilters}
            enableQuickDates
          />



          <PurchasesTable rows={vm.rows} loading={vm.loading} onOpen={vm.onOpen} />
        </CardContent>
      </Card>
    </div>
  );
}
