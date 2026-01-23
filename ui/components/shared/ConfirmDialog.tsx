// src/components/shared/ConfirmDialog.tsx
"use client";

import * as React from "react";
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

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  busy?: boolean;
  destructive?: boolean;
};

export function ConfirmDialog(p: ConfirmDialogProps) {
  return (
    <AlertDialog open={p.open} onOpenChange={p.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{p.title}</AlertDialogTitle>
          {p.description ? <AlertDialogDescription>{p.description}</AlertDialogDescription> : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={p.busy}>{p.cancelText ?? "Cancelar"}</AlertDialogCancel>

          <AlertDialogAction
            disabled={p.busy}
            className={p.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            onClick={(e) => {
              e.preventDefault();
              p.onConfirm();
            }}
          >
            {p.confirmText ?? "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
