// src/components/shared/RowActions.tsx
"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RowActions(props: {
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirm?: { title: string; message: string };
  disabled?: boolean;
}) {
  async function handleDelete() {
    if (!props.onDelete) return;

    if (props.deleteConfirm) {
      const ok = window.confirm(`${props.deleteConfirm.title}\n\n${props.deleteConfirm.message}`);
      if (!ok) return;
    }
    await props.onDelete();
  }

  return (
    <div className="flex justify-end gap-1">
      {props.onEdit && (
        <Button
          size="icon"
          variant="ghost"
          onClick={props.onEdit}
          disabled={props.disabled}
          title="Editar"
        >
          <Pencil className="size-4" />
        </Button>
      )}

      {props.onDelete && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => void handleDelete()}
          disabled={props.disabled}
          title="Eliminar"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
