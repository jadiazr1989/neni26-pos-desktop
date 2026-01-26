// src/modules/terminals/ui/TerminalDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";

import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";
import { AsyncComboboxSingle } from "@/components/shared/AsyncComboboxSingle";

import { useTerminalDialogVM } from "../hooks/useTerminalDialogVM";

type Mode = "create" | "edit";

export type SubmitPayload =
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
  const vm = useTerminalDialogVM({
    open: props.open,
    mode: props.mode,
    initial: props.initial,
    warehouses: props.warehouses,
    loading: props.loading,
    onSubmit: props.onSubmit,
    onClose: () => props.onOpenChange(false),
  });

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">{vm.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">{vm.subtitle}</div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          {/* ✅ SYSTEM CARD (igual estilo UserDialog) */}
          {props.mode === "edit" && vm.isSystem ? (
            <div className="grid gap-2 rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono truncate">{props.initial?.id}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Código</span>
                <span className="font-medium">{props.initial?.code ?? "—"}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Warehouse</span>
                <span className="font-medium truncate">{vm.selectedWarehouseLabel}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium">{props.initial?.isActive ? "ACTIVE" : "INACTIVE"}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                System: no se permite desactivar ni reasignar warehouse desde UI.
              </div>
            </div>
          ) : null}

          {/* ✅ name always editable */}
          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input
              value={vm.name}
              onChange={(e) => vm.setName(e.target.value)}
              placeholder="Ej: Front Counter"
              disabled={vm.disabled}
            />
          </div>

          {/* CREATE: code editable. EDIT: code readonly */}
          {props.mode === "create" ? (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Código</div>
              <Input
                value={vm.code}
                onChange={(e) => vm.setCode(e.target.value)}
                placeholder="Ej: POS-01"
                disabled={vm.disabled}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Código</div>
              <Input value={props.initial?.code ?? "—"} disabled />
            </div>
          )}

          {/* ✅ Warehouse: oculto en system (solo se ve en card) */}
          {!vm.isSystem ? (
            <div className="grid gap-2">
              <div className="text-sm font-medium">Warehouse</div>

              <AsyncComboboxSingle
                className="w-full"
                value={vm.warehouseId ? vm.warehouseId : null}
                onChange={(v) => vm.setWarehouseId(v ?? "")}
                placeholder={props.warehouses.length === 0 ? "— sin warehouses —" : "Seleccionar warehouse…"}
                searchPlaceholder="Buscar warehouse…"
                emptyText="Sin resultados."
                disabled={vm.disabled || props.warehouses.length === 0}
                loadState="ready"
                loadError={null}
                items={vm.whFiltered}
                search={vm.whSearch}
                setSearch={vm.setWhSearch}
                ensureLoaded={() => {}}
              />
            </div>
          ) : null}

          {/* ✅ Active toggle: solo en edit normal */}
          {props.mode === "edit" && !vm.isSystem ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={vm.isActive}
                onChange={(e) => vm.setIsActive(e.target.checked)}
                disabled={vm.disabled}
              />
              Activo
            </label>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={vm.disabled}>
            Cancelar
          </Button>

          <ButtonSpinner
            type="button"
            onClick={() => void vm.submit()}
            busy={props.loading} // o vm internal? mejor vm.disabled ya cubre
            disabled={vm.disabled || !vm.name.trim() || (props.mode === "create" ? !vm.code.trim() || !vm.warehouseId.trim() : false)}
          >
            Guardar
          </ButtonSpinner>
        </div>
      </DialogContent>
    </Dialog>
  );
}
