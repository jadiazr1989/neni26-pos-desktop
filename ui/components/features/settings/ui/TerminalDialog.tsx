"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { notify } from "@/lib/notify/notify";

import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";

type Mode = "create" | "edit";

type SubmitPayload =
  | { mode: "create"; warehouseId: string; code: string; name: string }
  | { mode: "edit"; id: string; warehouseId: string; name: string; isActive: boolean };

export function TerminalDialog(props: {
  open: boolean;
  mode: Mode;
  initial: TerminalDTO | null;
  warehouses: WarehouseListRow[];
  loading: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: SubmitPayload) => Promise<void>;
}): React.JSX.Element {
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [warehouseId, setWarehouseId] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [submitting, setSubmitting] = React.useState(false);

  const isSystem = props.mode === "edit" && props.initial?.isSystem === true;
  const disabled = props.loading || submitting;

  React.useEffect(() => {
    if (!props.open) return;

    const t = props.initial;

    setName(t?.name ?? "");
    setCode(t?.code ?? "");
    setWarehouseId(t?.warehouseId ?? (props.warehouses[0]?.id ?? ""));
    setIsActive(t?.isActive ?? true);
  }, [props.open, props.initial, props.warehouses]);

  function validate(): { ok: true; value: SubmitPayload } | { ok: false; error: string } {
    const nameNorm = name.trim();
    if (!nameNorm) return { ok: false, error: "Nombre requerido." };

    // CREATE
    if (props.mode === "create") {
      const wh = warehouseId.trim();
      if (!wh) return { ok: false, error: "Warehouse requerido." };

      const c = code.trim();
      if (!c) return { ok: false, error: "Código requerido." };

      return { ok: true, value: { mode: "create", warehouseId: wh, code: c, name: nameNorm } };
    }

    // EDIT
    if (!props.initial?.id) return { ok: false, error: "Terminal inválido." };

    // SYSTEM: no permitir cambiar estado/warehouse (solo name)
    if (isSystem) {
      return {
        ok: true,
        value: {
          mode: "edit",
          id: props.initial.id,
          warehouseId: props.initial.warehouseId,
          name: nameNorm,
          isActive: props.initial.isActive,
        },
      };
    }

    // EDIT normal
    const wh = warehouseId.trim();
    if (!wh) return { ok: false, error: "Warehouse requerido." };

    return {
      ok: true,
      value: { mode: "edit", id: props.initial.id, warehouseId: wh, name: nameNorm, isActive },
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

  const title =
    props.mode === "create" ? "Nuevo terminal" : isSystem ? "Terminal del sistema" : "Editar terminal";

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">{title}</DialogTitle>

          <div className="text-sm text-muted-foreground">
            {props.mode === "create"
              ? "Crea un terminal y asígnalo a un warehouse."
              : isSystem
              ? "Este terminal viene por defecto (seed). No se permite desactivar ni reasignar warehouse."
              : "Actualiza nombre/estado y reasigna el warehouse si es necesario."}
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Front Counter"
              disabled={disabled}
            />
          </div>

          {props.mode === "create" ? (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Código</div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: POS-01"
                disabled={disabled}
              />
            </div>
          ) : (
            // EDIT: mostramos código read-only (especialmente útil para system)
            <div className="grid gap-2">
              <div className="text-sm font-medium">Código</div>
              <Input value={props.initial?.code ?? "—"} disabled />
            </div>
          )}

          <div className="grid gap-2">
            <div className="text-sm font-medium">Warehouse</div>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              disabled={disabled || isSystem || props.warehouses.length === 0} // ✅ bloquea en system
            >
              {props.warehouses.length === 0 ? <option value="">— sin warehouses —</option> : null}
              {props.warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            {isSystem ? (
              <div className="text-xs text-muted-foreground">
                Terminal del sistema: no se puede reasignar de warehouse.
              </div>
            ) : null}
          </div>

          {props.mode === "edit" && !isSystem ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={disabled}
              />
              Activo
            </label>
          ) : props.mode === "edit" && isSystem ? (
            <div className="text-sm">
              <span className="text-muted-foreground">Estado:</span>{" "}
              <span className="font-medium">{props.initial?.isActive ? "ACTIVE" : "INACTIVE"}</span>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
            Cancelar
          </Button>

          <ButtonSpinner
            type="button"
            onClick={() => void submit()}
            busy={submitting}
            disabled={disabled || !name.trim()} // system también requiere name
          >
            {submitting ? "Guardando..." : "Guardar"}
          </ButtonSpinner>
        </div>
      </DialogContent>
    </Dialog>
  );
}
