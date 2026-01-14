"use client";

import * as React from "react";
import {
  Wifi,
  WifiOff,
  Monitor,
  Lock,
  Unlock,
  User,
  Shield,
  RotateCw,
  Wallet,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusChip } from "./StatusChip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ApiStatus = "online" | "offline" | "unknown";

export function StationDrawer(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  area: "pos" | "admin";

  userName: string;
  role: string;

  apiStatus: ApiStatus;
  lastPingAt: string | null;

  terminalReady: boolean;
  xTerminalId: string | null;

  cashOpen: boolean;
  cashId: string | null;

  onOpenCash: () => void;
  onGoSetup: () => void;
  onRefresh: () => void;
}) {
  const apiChip =
    props.apiStatus === "offline" ? (
      <StatusChip tone="danger">
        <WifiOff className="size-3" /> API sin conexión
      </StatusChip>
    ) : props.apiStatus === "online" ? (
      <StatusChip tone="success">
        <Wifi className="size-3" /> API en línea
      </StatusChip>
    ) : (
      <StatusChip tone="info">
        <RotateCw className="size-3 animate-spin" /> Verificando
      </StatusChip>
    );

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="w-[440px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle>Detalles de estación</SheetTitle>
          <SheetDescription>
            Estado del dispositivo, conexión, terminal y caja.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {apiChip}

            <StatusChip tone={props.terminalReady ? "success" : "warning"}>
              <Monitor className="size-3" />
              {props.terminalReady ? "Terminal OK" : "Sin terminal"}
            </StatusChip>

            {props.area === "pos" && (
              <StatusChip tone={props.cashOpen ? "success" : "warning"}>
                {props.cashOpen ? <Unlock className="size-3" /> : <Lock className="size-3" />}
                {props.cashOpen ? "Caja abierta" : "Caja cerrada"}
              </StatusChip>
            )}
          </div>

          {/* Panel info */}
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <InfoRow icon={<User className="size-4" />} label="Usuario" value={props.userName} />
            <InfoRow icon={<Shield className="size-4" />} label="Rol" value={props.role} />

            <div className="h-px bg-border my-2" />

            <InfoRow
              label="Terminal ID"
              value={props.terminalReady ? (props.xTerminalId ?? "—") : "No asignado"}
              mono
            />
            <InfoRow label="Último ping" value={props.lastPingAt ?? "—"} />
            <InfoRow
              label="Caja"
              value={
                props.area !== "pos"
                  ? "—"
                  : props.cashOpen
                  ? `Abierta${props.cashId ? ` (${props.cashId})` : ""}`
                  : "Cerrada"
              }
              mono={Boolean(props.cashId)}
            />
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-3">
            {props.area === "pos" ? (
              <Button
                className="h-11"
                onClick={props.onOpenCash}
                disabled={props.cashOpen || props.apiStatus !== "online" || !props.terminalReady}
              >
                <Wallet className="mr-2 size-4" />
                Abrir caja
              </Button>
            ) : (
              <Button className="h-11" onClick={props.onGoSetup}>
                <Settings className="mr-2 size-4" />
                Configuración
              </Button>
            )}

            <Button variant="secondary" className="h-11" onClick={props.onRefresh}>
              <RotateCw className="mr-2 size-4" />
              Actualizar
            </Button>
          </div>

          {/* Hint */}
          <div
            className={cn(
              "text-xs text-muted-foreground",
              props.apiStatus === "offline" ? "text-destructive" : ""
            )}
          >
            {props.apiStatus === "offline"
              ? "Sin conexión: algunas operaciones están deshabilitadas."
              : "Tip: usa teclado (F2 Venta · F4 Devolución · F6 Catálogo · F9 Caja)."}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow(props: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        {props.icon}
        {props.label}
      </div>
      <div className={cn("text-sm text-right", props.mono ? "font-mono" : "")}>
        {props.value}
      </div>
    </div>
  );
}
