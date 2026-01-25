// src/modules/admin/device/ui/DeviceScreen.tsx
"use client";

import * as React from "react";
import { RefreshCw, Trash2, Laptop } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useDeviceScreen } from "./hooks/useDeviceScreen";

export function DeviceScreen() {
  const vm = useDeviceScreen();

  const terminalReady = Boolean(vm.xTerminalId);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Dispositivo</h1>
          <p className="text-sm text-muted-foreground">
            Asigna el terminal a este equipo (controla el header <span className="font-mono">x-terminal-id</span>).
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
          <CardTitle className="text-base">Estado actual</CardTitle>
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
              <Button variant="destructive" onClick={() => void vm.clearDeviceTerminal()} disabled={!terminalReady || vm.loading}>
                <Trash2 className="mr-2 size-4" />
                Quitar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Asignar desde lista</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={vm.selectedId}
            onChange={(e) => vm.setSelectedId(e.target.value)}
            disabled={vm.loading}
          >
            {vm.terminals.length === 0 ? <option value="">— sin terminales —</option> : null}
            {vm.terminals.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {t.code ? `(${t.code})` : ""} · WH: {t.warehouseId.slice(0, 8)}
              </option>
            ))}
          </select>

          <Button onClick={() => void vm.assignSelected()} disabled={vm.loading || !vm.selectedId}>
            Asignar a este dispositivo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Asignar manual</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            value={vm.manualId}
            onChange={(e) => vm.setManualId(e.target.value)}
            placeholder="Pega aquí el terminalId (UUID)"
            disabled={vm.loading}
          />

          <Button variant="secondary" onClick={() => void vm.assignManual()} disabled={vm.loading || !vm.manualId.trim()}>
            Validar y asignar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
