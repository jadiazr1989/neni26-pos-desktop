"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import type { PurchaseDetailVm } from "../../hooks/purchaseDetail.types";
import { cn } from "@/lib/utils";

export function PurchaseWorkflowActions({ vm }: { vm: PurchaseDetailVm }) {
  const f = vm.flags;
  const busy = vm.loading;

  const [cancelOpen, setCancelOpen] = React.useState(false);

  const primary =
    f.status === "DRAFT"
      ? {
          key: "ORDER",
          label: "Ordenar",
          Icon: Truck,
          canRun: f.canOrder,
          onClick: vm.order.order,
          className: cn(
            "bg-accent/40 text-foreground",
            "hover:bg-accent",
            "transition-colors"
          ),
          disabledHint: "Agrega items y guarda antes de continuar",
        }
      : f.status === "ORDERED"
      ? {
          key: "RECEIVE",
          label: "Recibir",
          Icon: CheckCircle2,
          canRun: f.canReceive,
          onClick: vm.receive.request,
          className: cn(
            "bg-emerald-500/90 text-white",
            "hover:bg-emerald-600",
            "transition-colors"
          ),
          disabledHint: "Guarda los cambios antes de recibir",
        }
      : null;

  const primaryDisabled = !primary?.canRun || busy;

  return (
    <>
      <div className="flex items-center gap-2">
        {primary ? (
          <Button
            variant="default"
            disabled={primaryDisabled}
            onClick={primary.onClick}
            title={!primary.canRun ? primary.disabledHint : primary.label}
            className={cn(
              primary.className,
              primaryDisabled
                ? "opacity-60 cursor-not-allowed"
                : "cursor-pointer"
            )}
          >
            <primary.Icon className="mr-2 size-4" />
            {primary.label}
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">
            {f.status === "RECEIVED"
              ? "Compra cerrada (RECEIVED)"
              : f.status === "CANCELLED"
              ? "Compra cancelada"
              : "—"}
          </div>
        )}

        <Button
          variant="destructive"
          disabled={!f.canCancel || busy}
          onClick={() => setCancelOpen(true)}
          title={!f.canCancel ? "No se puede cancelar" : "Cancelar compra"}
          className={cn(
            !f.canCancel || busy
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer"
          )}
        >
          <XCircle className="mr-2 size-4" />
          Cancelar
        </Button>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(v) => !v && setCancelOpen(false)}
        title="Cancelar compra"
        description="La compra será marcada como CANCELLED. Esta acción no afecta inventario. ¿Continuar?"
        confirmText="Cancelar"
        destructive
        busy={busy}
        onConfirm={async () => {
          await vm.order.cancel();
          setCancelOpen(false);
        }}
      />
    </>
  );
}
