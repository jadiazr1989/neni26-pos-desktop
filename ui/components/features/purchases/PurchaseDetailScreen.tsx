"use client";

import * as React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { usePurchaseDetailScreen } from "./hooks/usePurchaseDetailScreen";
import { PurchaseWorkflowActions } from "./ui/deatils/PurchaseWorkflowActions";
import { PurchaseSummaryInline } from "./ui/deatils/PurchaseSummaryInline";
import { PurchaseItemsCard } from "./ui/deatils/PurchaseItemsCard";

export function PurchaseDetailScreen({ purchaseId }: { purchaseId: string }) {
  const vm = usePurchaseDetailScreen(purchaseId);

  return (
    <div className="space-y-4">
      {/* Header simple */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={vm.goBack} title="Volver">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold truncate">
              {vm.purchase?.invoiceNumber ? `Compra ${vm.purchase.invoiceNumber}` : "Compra"}
            </h1>
          </div>

          <div className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{vm.purchaseId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void vm.reload()} disabled={vm.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

          <PurchaseWorkflowActions vm={vm} />
        </div>
      </div>

      {vm.error ? (
        <Alert>
          <AlertDescription>{vm.error}</AlertDescription>
        </Alert>
      ) : null}

      <PurchaseSummaryInline vm={vm} />

      <PurchaseItemsCard vm={vm} />

      {/* Confirm de recibir (lo mantiene tu hook) */}
      <ConfirmDialog
        open={vm.receive.confirmOpen}
        onOpenChange={(v) => !v && vm.receive.cancel()}
        title="Recibir compra"
        description="Esto aplicará inventario en el almacén de la compra y cerrará la compra (RECEIVED). ¿Continuar?"
        confirmText="Recibir"
        destructive={false}
        busy={vm.receive.receiving}
        onConfirm={vm.receive.confirm}
      />
    </div>
  );
}