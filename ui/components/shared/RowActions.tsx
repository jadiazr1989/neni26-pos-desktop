// src/components/shared/RowActions.tsx
"use client";

import * as React from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
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
import { ButtonSpinner } from "@/components/ui/button-spinner";

export type RowActionsProps = {
  /** Backward-compatible alias (you said you already use this everywhere) */
  disabled?: boolean;

  /** Existing prop in your component */
  loading?: boolean;

  /** Edit */
  onEdit?: () => void;

  /** Toggle / Enable-Disable (existing behavior) */
  onToggle?: () => Promise<void> | void;
  hideToggle?: boolean;
  toggleConfirm?: {
    title: string;
    message: string;
    confirmText: string;
    destructive?: boolean;
  };

  /** Delete (new) */
  onDelete?: () => Promise<void> | void;
  hideDelete?: boolean;
  deleteConfirm?: {
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    destructive?: boolean;
  };
};

type DialogKind = "toggle" | "delete";

export function RowActions({
  disabled,
  loading,

  onEdit,

  onToggle,
  hideToggle,
  toggleConfirm,

  onDelete,
  hideDelete,
  deleteConfirm,
}: RowActionsProps) {
  const [open, setOpen] = React.useState<DialogKind | null>(null);
  const [busy, setBusy] = React.useState(false);

  const isDisabled = !!disabled || !!loading || busy;

  async function run(fn?: (() => Promise<void> | void), kind?: DialogKind) {
    if (!fn || busy) return;
    setBusy(true);
    try {
      await fn();
      if (kind) setOpen(null);
    } finally {
      setBusy(false);
    }
  }

  const canToggle = !hideToggle && !!onToggle && !!toggleConfirm;
  const canDelete = !hideDelete && !!onDelete && !!deleteConfirm;

  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          disabled={isDisabled}
          title="Editar"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {canToggle && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen("toggle")}
            disabled={isDisabled}
            title={toggleConfirm!.confirmText}
          >
            <Power
              className={
                toggleConfirm!.destructive
                  ? "size-4 text-destructive"
                  : "size-4"
              }
            />
          </Button>

          <AlertDialog
            open={open === "toggle"}
            onOpenChange={(v) => !busy && setOpen(v ? "toggle" : null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{toggleConfirm!.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {toggleConfirm!.message}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>
                  Cancelar
                </AlertDialogCancel>

                <AlertDialogAction asChild>
                  <ButtonSpinner
                    busy={busy}
                    onClick={() => void run(onToggle, "toggle")}
                    className={
                      toggleConfirm!.destructive
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : ""
                    }
                  >
                    {toggleConfirm!.confirmText}
                  </ButtonSpinner>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}

      {canDelete && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen("delete")}
            disabled={isDisabled}
            title={deleteConfirm!.confirmText}
          >
            <Trash2
              className={
                deleteConfirm!.destructive !== false
                  ? "size-4 text-destructive"
                  : "size-4"
              }
            />
          </Button>

          <AlertDialog
            open={open === "delete"}
            onOpenChange={(v) => !busy && setOpen(v ? "delete" : null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{deleteConfirm!.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {deleteConfirm!.message}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={busy}>
                  {deleteConfirm!.cancelText ?? "Cancelar"}
                </AlertDialogCancel>

                <AlertDialogAction asChild>
                  <ButtonSpinner
                    busy={busy}
                    onClick={() => void run(onDelete, "delete")}
                    className={
                      deleteConfirm!.destructive !== false
                        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        : ""
                    }
                  >
                    {deleteConfirm!.confirmText}
                  </ButtonSpinner>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
