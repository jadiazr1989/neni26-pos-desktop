// src/components/shared/RowActions.tsx
"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { ButtonSpinner } from "../ui/button-spinner";

export type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
  disabled?: boolean;

  deleteConfirm?: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean; // default true
  };
};

export function RowActions(p: RowActionsProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const canEdit = Boolean(p.onEdit);
  const canDelete = Boolean(p.onDelete);

  async function runDelete() {
    if (!p.onDelete) return;

    // si NO hay confirm config => borra directo
    if (!p.deleteConfirm) {
      setBusy(true);
      try {
        await p.onDelete();
      } finally {
        setBusy(false);
      }
      return;
    }

    // con confirm dialog
    setBusy(true);
    try {
      await p.onDelete();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {canEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={p.onEdit}
          disabled={p.disabled || busy}
          title="Editar"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {canDelete && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (p.deleteConfirm ? setOpen(true) : void runDelete())}
            disabled={p.disabled || busy}
            title="Eliminar"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>

          {p.deleteConfirm && (
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{p.deleteConfirm.title}</AlertDialogTitle>
                  <AlertDialogDescription>{p.deleteConfirm.message}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel disabled={busy}>
                    {p.deleteConfirm.cancelText ?? "Cancelar"}
                  </AlertDialogCancel>

                  {/* Usamos ButtonSpinner para busy */}
                  <AlertDialogAction asChild>
                    <ButtonSpinner
                      type="button"
                      busy={busy}
                      onClick={() => void runDelete()}
                      className={
                        (p.deleteConfirm.destructive ?? true)
                          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          : ""
                      }
                      icon={<Trash2 className="size-4" />}
                    >
                      {busy ? "Eliminando..." : p.deleteConfirm.confirmText ?? "Eliminar"}
                    </ButtonSpinner>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </>
      )}
    </div>
  );
}
