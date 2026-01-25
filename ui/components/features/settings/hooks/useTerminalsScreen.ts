"use client";

import * as React from "react";
import { terminalService } from "@/lib/modules/terminals/terminal.service";
import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";

import { warehouseService } from "@/lib/modules/warehouses/warehouse.service";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";

import { notify } from "@/lib/notify/notify";

type Mode = "create" | "edit";

type ConfirmToggle = {
  id: string;
  name: string;
  nextActive: boolean;
};

type SubmitPayload =
  | { mode: "create"; warehouseId: string; code: string; name: string }
  | { mode: "edit"; id: string; warehouseId: string; name: string; isActive: boolean };

type Vm = {
  terminals: TerminalDTO[];
  warehouses: WarehouseListRow[];

  loading: boolean;
  error: string | null;

  search: string;
  setSearch: (v: string) => void;
  filtered: TerminalDTO[];

  dialogOpen: boolean;
  dialogMode: Mode;
  selected: TerminalDTO | null;

  openCreate: () => void;
  openEdit: (t: TerminalDTO) => void;
  onOpenChangeDialog: (v: boolean) => void;

  refresh: () => Promise<void>;
  onSubmit: (p: SubmitPayload) => Promise<void>;

  confirmToggle: ConfirmToggle | null;
  askToggleActive: (t: TerminalDTO) => void;
  cancelToggle: () => void;
  confirmToggleNow: () => Promise<void>;
};

function norm(v: string): string {
  return v.trim().toLowerCase();
}

function matchesTerminal(t: TerminalDTO, q: string): boolean {
  if (!q) return true;
  const hay = `${t.name ?? ""} ${t.code ?? ""} ${t.warehouse?.name ?? ""} ${t.warehouseId ?? ""}`.toLowerCase();
  return hay.includes(q);
}

export function useTerminalsScreen(): Vm {
  const [terminals, setTerminals] = React.useState<TerminalDTO[]>([]);
  const [warehouses, setWarehouses] = React.useState<WarehouseListRow[]>([]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>("create");
  const [selected, setSelected] = React.useState<TerminalDTO | null>(null);

  const [confirmToggle, setConfirmToggle] = React.useState<ConfirmToggle | null>(null);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [tRes, wRows] = await Promise.all([
        terminalService.list(),
        warehouseService.listMyActive({ limit: 200 }), // ✅ storeId viene por terminal context
      ]);

      setTerminals(tRes.terminals);
      setWarehouses(wRows);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo cargar datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = React.useMemo(() => {
    const q = norm(search);
    return terminals.filter((t) => matchesTerminal(t, q));
  }, [terminals, search]);

  function openCreate() {
    setSelected(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEdit(t: TerminalDTO) {
    setSelected(t);
    setDialogMode("edit");
    setDialogOpen(true);
  }

  function onOpenChangeDialog(v: boolean) {
    setDialogOpen(v);
    if (!v) setSelected(null);
  }

  const onSubmit = React.useCallback(
    async (p: SubmitPayload) => {
      setLoading(true);
      try {
        if (p.mode === "create") {
          await terminalService.create({
            warehouseId: p.warehouseId,
            code: p.code,
            name: p.name,
          });

          notify.success({
            title: "Terminal creado",
            description: "El terminal fue creado correctamente.",
          });
        } else {
          // 👇 EDIT
          const current = terminals.find((t) => t.id === p.id);

          if (current?.isSystem) {
            // 🔒 SYSTEM: solo name
            await terminalService.patch(p.id, {
              name: p.name,
            });

            notify.success({
              title: "Terminal del sistema actualizado",
              description: "Solo se actualizó el nombre.",
            });
          } else {
            // ✅ NORMAL
            await terminalService.patch(p.id, {
              warehouseId: p.warehouseId,
              name: p.name,
              isActive: p.isActive,
            });

            notify.success({
              title: "Terminal actualizado",
              description: "Los cambios fueron guardados.",
            });
          }
        }

        setDialogOpen(false);
        setSelected(null);
        await refresh();
      } catch (e: unknown) {
        notify.error({
          title: "No se pudo guardar",
          description: e instanceof Error ? e.message : "Error desconocido",
        });
      } finally {
        setLoading(false);
      }
    },
    [refresh, terminals],
  );


  function askToggleActive(t: TerminalDTO) {
    if (t.isSystem) {
      notify.warning({
        title: "Acción no permitida",
        description: "Este terminal viene por defecto (seed) y no se puede activar/desactivar.",
      });
      return;
    }
    setConfirmToggle({ id: t.id, name: t.name, nextActive: !t.isActive });
  }

  function cancelToggle() {
    setConfirmToggle(null);
  }

  const confirmToggleNow = React.useCallback(async () => {
    if (!confirmToggle) return;

    const t = terminals.find((x) => x.id === confirmToggle.id);
    if (t?.isSystem) {
      notify.warning({
        title: "Acción no permitida",
        description: "Terminal del sistema.",
      });
      setConfirmToggle(null);
      return;
    }

    setLoading(true);
    try {
      await terminalService.patch(confirmToggle.id, { isActive: confirmToggle.nextActive });
      notify.success({
        title: confirmToggle.nextActive ? "Terminal activado" : "Terminal desactivado",
        description: "Listo.",
      });

      setConfirmToggle(null);
      await refresh();
    } catch (e: unknown) {
      notify.error({
        title: "No se pudo cambiar estado",
        description: e instanceof Error ? e.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  }, [confirmToggle, refresh, terminals]);


  return {
    terminals,
    warehouses,
    loading,
    error,
    search,
    setSearch,
    filtered,
    dialogOpen,
    dialogMode,
    selected,
    openCreate,
    openEdit,
    onOpenChangeDialog,
    refresh,
    onSubmit,
    confirmToggle,
    askToggleActive,
    cancelToggle,
    confirmToggleNow,
  };
}
