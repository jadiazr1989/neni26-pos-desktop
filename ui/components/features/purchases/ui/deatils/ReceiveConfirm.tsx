// src/modules/purchases/ui/ui/detail/ReceiveConfirm.tsx
"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function ReceiveConfirm(props: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ConfirmDialog
      open={props.open}
      onOpenChange={(v) => !v && props.onClose()}
      title="Recibir compra"
      description="Esto aplicará inventario en el warehouse de la compra y cerrará la compra (RECEIVED). ¿Continuar?"
      confirmText="Recibir"
      destructive={false}
      busy={props.busy}
      onConfirm={props.onConfirm}
    />
  );
}
