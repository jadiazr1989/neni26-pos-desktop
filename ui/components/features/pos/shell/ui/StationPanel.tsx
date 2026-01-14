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
  KeyRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/features/shell/ui/StatusChip";
import { cn } from "@/lib/utils";

export function StationPanel(props: {
  userName: string;
  role: string;

  terminalReady: boolean;
  xTerminalId: string | null;

  apiStatus: "online" | "offline" | "unknown";
  lastPingAt: string | null;

  cashOpen: boolean;

  onOpenCash: () => void;
  onRefresh: () => void;
}) {
  const apiChip =
    props.apiStatus === "offline" ? (
      <StatusChip tone="danger">
        <WifiOff className="size-3" /> Sin conexión
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
    <Card className="shadow-sm">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Monitor className="size-5 text-muted-foreground" />
          Estación
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {apiChip}

          <StatusChip tone={props.terminalReady ? "success" : "warning"}>
            <KeyRound className="size-3" />
            {props.terminalReady ? "Terminal OK" : "Sin terminal"}
          </StatusChip>

          <StatusChip tone={props.cashOpen ? "success" : "warning"}>
            {props.cashOpen ? <Unlock className="size-3" /> : <Lock className="size-3" />}
            {props.cashOpen ? "Caja abierta" : "Caja cerrada"}
          </StatusChip>
        </div>

        {/* Info box */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <InfoRow icon={<User className="size-4" />} label="Usuario" value={props.userName} />
          <InfoRow icon={<Shield className="size-4" />} label="Rol" value={props.role} />

          <InfoRow
            label="Terminal ID"
            value={props.xTerminalId ?? "—"}
            mono
          />

          <InfoRow label="Último ping" value={props.lastPingAt ?? "—"} />
        </div>

        {/* Acciones alineadas (mismo alto, mismo ancho) */}
    

        {/* Nota contextual pequeña (opcional) */}
        {!props.cashOpen && props.terminalReady && props.apiStatus === "online" && (
          <div className="text-xs text-muted-foreground">
            Para vender necesitas abrir una sesión de caja.
          </div>
        )}
      </CardContent>
    </Card>
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {props.icon}
        {props.label}
      </div>

      <div className={cn("text-sm text-right", props.mono && "font-mono")}>
        {props.value}
      </div>
    </div>
  );
}
