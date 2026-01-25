"use client";

import * as React from "react";
import { warehouseService } from "@/lib/modules/warehouses/warehouse.service";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";
import { notify } from "@/lib/notify/notify";
import type { WarehouseDialogSubmitPayload } from "../ui/WarehouseDialog";
import type { TriState } from "@/components/shared/TriStateFilterBar";

type Mode = "create" | "edit";

type Vm = {
  rows: WarehouseListRow[];
  loading: boolean;
  error: string | null;

  // UI state
  search: string;
  setSearch: (v: string) => void;

  filter: TriState;
  setFilter: (v: TriState) => void;

  // derived
  counts: { all: number; active: number; inactive: number };

  // actions
  submitSearch: () => Promise<void>;
  setFilterAndRefresh: (v: TriState) => Promise<void>;
  refresh: () => Promise<void>;

  dialogOpen: boolean;
  dialogMode: Mode;
  selected: WarehouseListRow | null;

  openCreate: () => void;
  openEdit: (w: WarehouseListRow) => void;
  onOpenChangeDialog: (v: boolean) => void;

  onSubmit: (p: WarehouseDialogSubmitPayload) => Promise<void>;
  onToggleActive: (w: WarehouseListRow) => Promise<void>;

  hasMore: boolean;
  loadMore: () => void;
};

function applyFilter(rows: WarehouseListRow[], filter: TriState): WarehouseListRow[] {
  if (filter === "active") return rows.filter((r) => r.isActive);
  if (filter === "inactive") return rows.filter((r) => !r.isActive);
  return rows;
}

export function useWarehousesScreen(): Vm {
  const [baseRows, setBaseRows] = React.useState<WarehouseListRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [appliedSearch, setAppliedSearch] = React.useState<string>("");

  const [filter, setFilter] = React.useState<TriState>("all");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<Mode>("create");
  const [selected, setSelected] = React.useState<WarehouseListRow | null>(null);

  const [hasMore, setHasMore] = React.useState(false);
  const loadMore = React.useCallback(() => {}, []);

  const counts = React.useMemo(() => {
    const active = baseRows.filter((r) => r.isActive).length;
    const inactive = baseRows.filter((r) => !r.isActive).length;
    return { all: baseRows.length, active, inactive };
  }, [baseRows]);

  const rows = React.useMemo(() => applyFilter(baseRows, filter), [baseRows, filter]);

  const fetchBase = React.useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const out = await warehouseService.listMy({
        limit: 200,
        search: q ? q : undefined,
      });

      setBaseRows(out.rows);
      setHasMore(Boolean(out.nextCursor));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo cargar warehouses.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = React.useCallback(async () => {
    await fetchBase(appliedSearch);
  }, [fetchBase, appliedSearch]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitSearch = React.useCallback(async () => {
    const q = search.trim();
    setAppliedSearch(q);
    await fetchBase(q);
  }, [fetchBase, search]);

  const setFilterAndRefresh = React.useCallback(async (v: TriState) => {
    // ✅ filtros locales: NO pegamos a la API (para que counts no se rompan)
    setFilter(v);
  }, []);

  function openCreate() {
    setSelected(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  function openEdit(w: WarehouseListRow) {
    setSelected(w);
    setDialogMode("edit");
    setDialogOpen(true);
  }

  function onOpenChangeDialog(v: boolean) {
    setDialogOpen(v);
    if (!v) setSelected(null);
  }

  const onSubmit = React.useCallback(
    async (p: WarehouseDialogSubmitPayload) => {
      setLoading(true);
      try {
        if (p.mode === "create") {
          await warehouseService.create({
            name: p.name,
            code: p.code ?? null,
            location: p.location ?? null,
          });

          notify.success({
            title: "Warehouse creado",
            description: "El warehouse fue creado correctamente.",
          });
        } else {
          await warehouseService.update(p.id, {
            ...(p.name !== undefined ? { name: p.name } : {}),
            ...(p.code !== undefined ? { code: p.code } : {}),
            ...(p.location !== undefined ? { location: p.location } : {}),
          });

          notify.success({
            title: "Warehouse actualizado",
            description: "Los cambios fueron guardados.",
          });
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
    [refresh],
  );

  const onToggleActive = React.useCallback(
    async (w: WarehouseListRow) => {
      if (w.isSystem) {
        notify.warning({
          title: "Acción bloqueada",
          description: "Este warehouse es SYSTEM y no se puede desactivar.",
        });
        return;
      }

      setLoading(true);
      try {
        if (w.isActive) await warehouseService.deactivate(w.id);
        else await warehouseService.activate(w.id);

        notify.success({
          title: w.isActive ? "Warehouse desactivado" : "Warehouse activado",
          description: "Listo.",
        });

        await refresh();
      } catch (e: unknown) {
        notify.error({
          title: "No se pudo cambiar estado",
          description: e instanceof Error ? e.message : "Error desconocido",
        });
      } finally {
        setLoading(false);
      }
    },
    [refresh],
  );

  return {
    rows,
    loading,
    error,

    search,
    setSearch,

    filter,
    setFilter,

    counts,

    submitSearch,
    setFilterAndRefresh,
    refresh,

    dialogOpen,
    dialogMode,
    selected,

    openCreate,
    openEdit,
    onOpenChangeDialog,

    onSubmit,
    onToggleActive,

    hasMore,
    loadMore,
  };
}
