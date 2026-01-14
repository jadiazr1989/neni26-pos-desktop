"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BannerTone = "danger" | "warning";

function GateBanner(props: {
  tone: BannerTone;
  title: string;
  desc: string;
  action: React.ReactNode;
}) {
  return (
    <div className="px-6 pt-4">
      <div
        className={cn(
          "rounded-2xl border p-4 flex items-center justify-between gap-4 bg-card",
          props.tone === "danger" && "border-destructive/30 bg-destructive/10",
          props.tone === "warning" &&
            "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10"
        )}
      >
        <div>
          <div className="text-sm font-semibold">{props.title}</div>
          <div className="text-xs text-muted-foreground">{props.desc}</div>
        </div>
        {props.action}
      </div>
    </div>
  );
}

export function ShellGateBanner(props: {
  area: "pos" | "admin";
  offline: boolean;
  terminalReady: boolean;
  showCashGate: boolean;
  onGoSetup: () => void;
  onOpenCash: () => void;
}) {
  if (props.area !== "pos") return null;

  if (props.offline) {
    return (
      <GateBanner
        tone="danger"
        title="Modo sin conexión"
        desc="El servidor no responde. Las operaciones quedan deshabilitadas."
        action={
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        }
      />
    );
  }

  if (!props.terminalReady) {
    return (
      <GateBanner
        tone="warning"
        title="Terminal no asignado"
        desc="Un administrador debe asignar este dispositivo a un terminal."
        action={<Button onClick={props.onGoSetup}>Ir a configuración</Button>}
      />
    );
  }

  if (props.showCashGate) {
    return (
      <GateBanner
        tone="warning"
        title="Caja cerrada"
        desc="Abre una sesión de caja para comenzar a vender."
        action={<Button onClick={props.onOpenCash}>Abrir caja</Button>}
      />
    );
  }

  return null;
}
