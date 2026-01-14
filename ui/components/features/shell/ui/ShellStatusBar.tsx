"use client";

import { Button } from "@/components/ui/button";
import { StatusChip } from "./StatusChip";
import { cn } from "@/lib/utils";
import { Info, Wifi, WifiOff, Monitor, Lock, CheckCircle2 } from "lucide-react";

type Props = {
  area: "pos" | "admin";
  offline: boolean;
  terminalReady: boolean;
  cashOpen: boolean;
  onOpenDetails: () => void;
};

function getPrimaryStatus(p: Props) {
  // Prioridad (lo más grave primero)
  if (p.offline) {
    return { tone: "danger" as const, icon: WifiOff, label: "Sin conexión" };
  }
  if (p.area === "pos" && !p.terminalReady) {
    return { tone: "warning" as const, icon: Monitor, label: "Sin terminal" };
  }
  if (p.area === "pos" && !p.cashOpen) {
    return { tone: "warning" as const, icon: Lock, label: "Caja cerrada" };
  }
  return { tone: "success" as const, icon: CheckCircle2, label: "Listo" };
}

export function ShellStatusBar(props: Props) {
  const primary = getPrimaryStatus(props);
  const Icon = primary.icon;

  return (
    <div className="h-14 border-b border-border bg-card flex items-center px-6 gap-3">
      {/* Área (POS / Admin) */}
      <StatusChip tone="neutral" className="gap-2">
        <span className={cn("size-2 rounded-full bg-current opacity-70")} />
        {props.area === "admin" ? "Admin" : "POS"}
      </StatusChip>

      {/* Estado principal único */}
      <button
        type="button"
        onClick={props.onOpenDetails}
        className="flex items-center"
        aria-label="Ver detalles de estación"
      >
        <StatusChip tone={primary.tone} className="gap-2 cursor-pointer hover:opacity-90">
          <Icon className="size-3" />
          {primary.label}
        </StatusChip>
      </button>

      <div className="flex-1" />

      <Button variant="secondary" className="h-9" onClick={props.onOpenDetails}>
        <Info className="mr-2 size-4" />
        Detalles
      </Button>
    </div>
  );
}
