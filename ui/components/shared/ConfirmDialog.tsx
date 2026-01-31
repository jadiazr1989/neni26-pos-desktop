// src/components/shared/ConfirmDialog.tsx
"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonSpinner } from "@/components/ui/button-spinner";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog(p: ConfirmDialogProps) {
  const destructive = p.destructive ?? true;

  const lockRef = React.useRef(false);

  async function handleConfirm() {
    if (p.busy) return;
    if (lockRef.current) return;

    lockRef.current = true;
    try {
      await p.onConfirm();
    } finally {
      lockRef.current = false;
    }
  }

  return (
    <AlertDialog
      open={p.open}
      onOpenChange={(v) => {
        if (p.busy) return;
        p.onOpenChange(v);
      }}
    >
      {/* ✅ CLAVE: subir z-index por encima del modal POS z-[120] */}
      <AlertDialogContent className="z-[220]">
        <AlertDialogHeader>
          <AlertDialogTitle>{p.title}</AlertDialogTitle>
          {p.description ? <AlertDialogDescription>{p.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={p.busy}>
            {p.cancelText ?? "Cancelar"}
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <ButtonSpinner
              type="button"
              busy={!!p.busy}
              disabled={!!p.busy}
              onClick={() => void handleConfirm()}
              className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
              icon={destructive ? <Trash2 className="size-4" /> : undefined}
            >
              {p.busy
                ? destructive
                  ? "Eliminando..."
                  : "Procesando..."
                : p.confirmText ?? (destructive ? "Eliminar" : "Confirmar")}
            </ButtonSpinner>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
