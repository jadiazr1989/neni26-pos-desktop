// src/modules/admin/device/ui/DeviceScreen.tsx
"use client";

import { Laptop, RefreshCw, Trash2 } from "lucide-react";
import * as React from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDeviceScreen } from "./hooks/useDeviceScreen";

import { AsyncComboboxSingle, type ComboboxOption } from "@/components/shared/AsyncComboboxSingle";

export function DeviceScreen() {
  const vm = useDeviceScreen();

  const terminalReady = Boolean(vm.xTerminalId);

  // ✅ options (label pro: Name (CODE) · WH: xxxx…)
  const options = React.useMemo<ComboboxOption[]>(() => {
    return vm.terminals.map((t) => ({
      value: t.id,
      label: `${t.name}${t.code ? ` (${t.code})` : ""} · WH: ${t.warehouseId.slice(0, 8)}`,
    }));
  }, [vm.terminals]);

  // ✅ local search
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((x) => x.label.toLowerCase().includes(q));
  }, [options, search]);

  const selectedLabel = React.useMemo(() => {
    if (!vm.selectedId) return null;
    return options.find((o) => o.value === vm.selectedId)?.label ?? null;
  }, [options, vm.selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Dispositivo</h1>
          <p className="text-sm text-muted-foreground">
            Asigna el terminal a este equipo (controla el header{" "}
            <span className="font-mono">x-terminal-id</span>).
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void vm.refresh()} disabled={vm.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>
        </div>
      </div>

      {!terminalReady && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-950">
          <AlertDescription>
            <span className="font-medium">Terminal no configurado.</span>{" "}
            Sin terminal, este dispositivo no puede vender ni ejecutar operaciones del POS.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="">Estado actual</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {vm.error && (
            <Alert>
              <AlertDescription>{vm.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-10 rounded-xl border bg-muted/30">
              <Laptop className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <div className="text-sm font-medium">Terminal del dispositivo</div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                {vm.hydrated ? (vm.xTerminalId ?? "— no asignado —") : "cargando…"}
              </div>
            </div>

            <div className="ml-auto">
              <Button
                variant="destructive"
                onClick={() => void vm.clearDeviceTerminal()}
                disabled={!terminalReady || vm.loading}
              >
                <Trash2 className="mr-2 size-4" />
                Quitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NIVEL DIOS: combobox */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="">Asignar desde lista</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Terminal</div>

            <AsyncComboboxSingle
              className="w-full"
              value={vm.selectedId ? vm.selectedId : null}
              onChange={(v) => vm.setSelectedId(v ?? "")}
              placeholder={vm.terminals.length === 0 ? "— sin terminales —" : "Seleccionar terminal…"}
              searchPlaceholder="Buscar por nombre o código…"
              emptyText="Sin resultados."
              disabled={vm.loading || vm.terminals.length === 0}
              loadState="ready"
              loadError={null}
              items={filtered}
              search={search}
              setSearch={setSearch}
              ensureLoaded={() => {}}
            />

            {selectedLabel ? (
              <div className="text-xs text-muted-foreground">
                Seleccionado: <span className="font-medium">{selectedLabel}</span>
              </div>
            ) : null}
          </div>

          <Button onClick={() => void vm.assignSelected()} disabled={vm.loading || !vm.selectedId}>
            Asignar a este dispositivo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="">Asignar manual</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <div className="text-sm font-medium">TerminalId (UUID)</div>
            <Input
              value={vm.manualId}
              onChange={(e) => vm.setManualId(e.target.value)}
              placeholder="Pega aquí el terminalId (UUID)"
              disabled={vm.loading}
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => void vm.assignManual()}
            disabled={vm.loading || !vm.manualId.trim()}
          >
            Validar y asignar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
