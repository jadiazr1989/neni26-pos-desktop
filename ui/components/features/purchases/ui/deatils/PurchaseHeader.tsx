// src/modules/purchases/ui/ui/detail/PurchaseHeader.tsx
"use client";

import * as React from "react";
import { ArrowLeft, RefreshCw, CheckCircle2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PurchaseDetailVm } from "../../hooks/purchaseDetail.types";
import { PurchaseWorkflowActions } from "./PurchaseWorkflowActions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  ORDERED: "bg-blue-100 text-blue-800",
  RECEIVED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[status] ?? "bg-muted"}`}
    >
      {status}
    </span>
  );
}


export function PurchaseHeader({ vm }: { vm: PurchaseDetailVm }) {
  const p = vm.purchase;

  return (
    <div className="flex items-start justify-between gap-4">
      {/* Left */}
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={vm.goBack}>
            <ArrowLeft className="size-4" />
          </Button>

          <h1 className="text-xl font-semibold truncate">
            {p?.invoiceNumber ? `Compra ${p.invoiceNumber}` : "Compra"}
          </h1>

          <StatusBadge status={p?.status} />
        </div>

        <p className="text-xs text-muted-foreground font-mono">
          {vm.purchaseId}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Meta */}
        <Button
          variant="secondary"
          onClick={vm.reload}
          disabled={vm.loading}
        >
          <RefreshCw className="mr-2 size-4" />
          Refrescar
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        {/* Edit */}
        <Button
          variant="outline"
          disabled={!vm.editor.canEditItems || !vm.editor.dirty || vm.loading}
          onClick={vm.editor.saveItems}
        >
          <Save className="mr-2 size-4" />
          Guardar
        </Button>

        {/* Workflow (paso 2) */}
        <PurchaseWorkflowActions vm={vm} />

      </div>
    </div>
  );
}

