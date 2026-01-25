"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { notify } from "@/lib/notify/notify";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";

type Mode = "create" | "edit";

export type WarehouseDialogSubmitPayload =
  | { mode: "create"; name: string; code?: string | null; location?: string | null }
  | { mode: "edit"; id: string; name?: string; code?: string | null; location?: string | null };

export function WarehouseDialog(props: {
  open: boolean;
  mode: Mode;
  initial: WarehouseListRow | null;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: WarehouseDialogSubmitPayload) => Promise<void>;
}): React.JSX.Element {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [location, setLocation] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const disabled = Boolean(props.loading) || submitting;

  const isSystem = props.mode === "edit" && props.initial?.isSystem === true;

  React.useEffect(() => {
    if (!props.open) return;
    const w = props.initial;
    setName(w?.name ?? "");
    setCode(w?.code ?? "");
    setLocation(w?.location ?? "");
  }, [props.open, props.initial]);

  function validate(): { ok: true; value: WarehouseDialogSubmitPayload } | { ok: false; error: string } {
    const nameNorm = name.trim();
    if (!nameNorm) return { ok: false, error: "Nombre requerido." };

    if (props.mode === "create") {
      return {
        ok: true,
        value: {
          mode: "create",
          name: nameNorm,
          code: code.trim() ? code.trim() : null,
          location: location.trim() ? location.trim() : null,
        },
      };
    }

    if (!props.initial?.id) return { ok: false, error: "Warehouse inválido." };

    if (isSystem) {
      return { ok: true, value: { mode: "edit", id: props.initial.id, name: nameNorm } };
    }

    return {
      ok: true,
      value: {
        mode: "edit",
        id: props.initial.id,
        name: nameNorm,
        code: code.trim() ? code.trim() : null,
        location: location.trim() ? location.trim() : null,
      },
    };
  }

  async function submit() {
    const v = validate();
    if (!v.ok) {
      notify.warning({ title: "Revisa el formulario", description: v.error });
      return;
    }

    setSubmitting(true);
    try {
      await props.onSubmit(v.value);
      props.onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">
            {props.mode === "create" ? "Nuevo warehouse" : isSystem ? "Warehouse del sistema" : "Editar warehouse"}
          </DialogTitle>

          <div className="text-sm text-muted-foreground">
            {props.mode === "create"
              ? "Crea un warehouse para el store actual (contexto por terminal)."
              : isSystem
                ? "Este warehouse viene por defecto (seed). Solo se permite cambiar el nombre."
                : "Actualiza nombre/código/ubicación."}
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {props.mode === "edit" && isSystem ? (
            <div className="grid gap-2 rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono">{props.initial?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium">{props.initial?.isActive ? "ACTIVE" : "INACTIVE"}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                System: no se permite desactivar ni cambiar code/location desde UI.
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Main Warehouse" disabled={disabled} />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Código</div>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: WH-01"
              disabled={disabled || isSystem}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Ubicación</div>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Local Dev"
              disabled={disabled || isSystem}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
            Cancelar
          </Button>

          <ButtonSpinner type="button" onClick={() => void submit()} busy={submitting} disabled={disabled || !name.trim()}>
            {submitting ? "Guardando..." : "Guardar"}
          </ButtonSpinner>
        </div>
      </DialogContent>
    </Dialog>
  );
}
