"use client";

import * as React from "react";
import { AlertTriangle, MinusCircle, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosSaleStore } from "@/stores/posSale.store";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function Row(props: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">{props.label}</div>
      <div className={cn("tabular-nums", props.strong && "font-semibold text-foreground")}>{props.value}</div>
    </div>
  );
}

export function TicketAdjustmentsDialog() {
  const open = usePosSaleStore((s) => s.adjustmentsOpen);
  const close = usePosSaleStore((s) => s.closeAdjustments);
  const items = usePosSaleStore((s) => s.lastAdjustments);

  const removed = items.filter((x) => x.action === "REMOVE").length;
  const clamped = items.filter((x) => x.action === "CLAMP").length;

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : close())}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Ajustes por stock
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {items.length} productos ajustados {removed ? `(${removed} eliminados, ${clamped} reducidos)` : ""}
          </div>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No hay ajustes recientes.</div>
          ) : (
            <div className="max-h-[320px] overflow-auto rounded-xl border">
              <ul className="divide-y">
                {items.map((x) => {
                  const isRemove = x.action === "REMOVE";
                  return (
                    <li key={`${x.variantId}:${x.action}`} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{x.label}</div>
                          <div className="mt-1 space-y-1">
                            <Row label="Pedido" value={`${x.requestedDisplay} ${x.unit}`} />
                            <Row label="Disponible" value={`${x.availableDisplay} ${x.unit}`} />
                            <Row
                              label={isRemove ? "Resultado" : "Nuevo"}
                              value={isRemove ? `Eliminado` : `${x.newQtyDisplay} ${x.unit}`}
                              strong
                            />
                          </div>
                        </div>

                        <div className="shrink-0 pt-1">
                          {isRemove ? (
                            <MinusCircle className="size-5 text-rose-600" />
                          ) : (
                            <Scissors className="size-5 text-amber-600" />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="mt-3">
          <Button onClick={close} className="rounded-xl">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}