"use client";

import * as React from "react";
import type { JSX } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { SyncStatus } from "../domain/checkoutViewModel";

export function CheckoutHeader(props: { syncStatus: SyncStatus }): JSX.Element {
  const label =
    props.syncStatus === "ready"
      ? "Sincronizado"
      : props.syncStatus === "syncing"
      ? "Sincronizando…"
      : props.syncStatus === "error"
      ? "Error sync"
      : "Sin sync";

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-3xl font-extrabold tracking-tight">Cobrar</div>
        <div className="text-muted-foreground mt-1">Escribe lo que entrega el cliente y confirma.</div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-medium px-3 py-1 rounded-full border",
            props.syncStatus === "ready" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            props.syncStatus === "syncing" && "border-amber-200 bg-amber-50 text-amber-800",
            props.syncStatus === "error" && "border-red-200 bg-red-50 text-red-800",
            props.syncStatus === "idle" && "border-muted bg-muted/40 text-muted-foreground"
          )}
        >
          {label}
        </span>

      </div>
    </div>
  );
}
