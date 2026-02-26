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

export function DiscardChangesDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Descartar cambios</AlertDialogTitle>
          <AlertDialogDescription>Tienes cambios sin aplicar. Si cierras ahora, se perderán.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.onKeepEditing}>Seguir editando</AlertDialogCancel>
          <AlertDialogAction onClick={props.onDiscard}>Descartar y cerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}