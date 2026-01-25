"use client";

import * as React from "react";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTerminalsScreen } from "./hooks/useTerminalsScreen";
import { TerminalsTable } from "./ui/TerminalsTable";
import { TerminalDialog } from "./ui/TerminalDialog";


export function TerminalsScreen(): React.JSX.Element {
  const vm = useTerminalsScreen();

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Terminales</h1>
          <p className="text-sm text-muted-foreground">
            Crea, edita, activa/desactiva y reasigna terminales a warehouses.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.refresh()} disabled={vm.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <Button onClick={vm.openCreate} variant="outline" disabled={vm.loading}>
            <Plus className="mr-2 size-4" />
            Nuevo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.error ? (
            <Alert>
              <AlertDescription>{vm.error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex gap-2">
            <Input
              value={vm.search}
              onChange={(e) => vm.setSearch(e.target.value)}
              placeholder="Buscar por nombre, código o warehouse…"
              disabled={vm.loading}
            />
            <Button variant="outline" onClick={() => void vm.refresh()} disabled={vm.loading}>
              Buscar
            </Button>
          </div>

          <TerminalsTable
            rows={vm.filtered}
            loading={vm.loading}
            onEdit={vm.openEdit}
            onToggleActive={vm.askToggleActive}
            height={560}
          />
        </CardContent>
      </Card>

      <TerminalDialog
        open={vm.dialogOpen}
        mode={vm.dialogMode}
        initial={vm.selected}
        warehouses={vm.warehouses}
        loading={vm.loading}
        onOpenChange={vm.onOpenChangeDialog}
        onSubmit={vm.onSubmit}
      />

      <ConfirmDialog
        open={!!vm.confirmToggle}
        onOpenChange={(v) => !v && vm.cancelToggle()}
        title={vm.confirmToggle?.nextActive ? "Activar terminal" : "Desactivar terminal"}
        description={
          vm.confirmToggle
            ? `¿Deseas ${vm.confirmToggle.nextActive ? "activar" : "desactivar"} “${vm.confirmToggle.name}”?`
            : undefined
        }
        confirmText={vm.confirmToggle?.nextActive ? "Activar" : "Desactivar"}
        destructive={!vm.confirmToggle?.nextActive}
        busy={vm.loading}
        onConfirm={vm.confirmToggleNow}
      />
    </div>
  );
}
