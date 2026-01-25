"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>;
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

export function WarehousesTable({
  rows,
  loading,
  hasMore,
  loadMore,
  onEdit,
  onToggleActive,
  height = 520,
}: {
  rows: WarehouseListRow[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onEdit: (w: WarehouseListRow) => void;
  onToggleActive: (w: WarehouseListRow) => Promise<void> | void;
  height?: number;
}) {
  const columns = React.useMemo<VirtualColumnDef<WarehouseListRow>[]>(
    () => [
      {
        key: "name",
        header: "Warehouse",
        className: "col-span-5 font-medium truncate",
        render: (w) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">{w.name}</span>
            {w.isSystem ? <SystemBadge /> : null}
          </div>
        ),
      },
      {
        key: "meta",
        header: "Código / Ubicación",
        className: "col-span-4 truncate",
        render: (w) => (
          <div className="min-w-0">
            <div className="truncate">{w.code ?? "—"}</div>
            <div className="text-xs text-muted-foreground truncate">{w.location ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "state",
        header: "Estado",
        className: "col-span-2",
        render: (w) => <ActiveBadge isActive={w.isActive} />,
      },
      {
        key: "actions",
        header: <span className="block text-right">Acc.</span>,
        className: "col-span-1",
        render: (w) => (
          <RowActions
            onEdit={() => onEdit(w)}
            onToggle={() => onToggleActive(w)}
            loading={loading}
            hideToggle={w.isSystem} // ✅ SYSTEM: bloquea activar/desactivar
            toggleConfirm={{
              title: w.isActive ? "Desactivar warehouse" : "Reactivar warehouse",
              message: w.isActive
                ? "Este warehouse no podrá usarse para operaciones hasta ser reactivado."
                : "Este warehouse volverá a estar disponible.",
              confirmText: w.isActive ? "Desactivar" : "Reactivar",
              destructive: w.isActive,
            }}
          />
        ),
      },
    ],
    [loading, onEdit, onToggleActive],
  );

  return (
    <VirtualDataTable
      rows={rows}
      columns={columns}
      rowKey={(w) => w.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={hasMore}
      onEndReached={loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin warehouses.</span>}
    />
  );
}
