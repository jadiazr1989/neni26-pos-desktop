"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { WarehouseListRow } from "@/lib/modules/warehouses/warehouse.dto";

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>;
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

function rowClassName(args: { selected: boolean; inactive?: boolean }) {
  return [
    "cursor-pointer",
    "hover:bg-muted/40",
    args.inactive ? "opacity-70" : "",
    args.selected ? "bg-muted/60 ring-1 ring-ring" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type Props = {
  rows: WarehouseListRow[];
  loading: boolean;

  height?: number;

  hasMore?: boolean;
  loadMore?: () => void;

  selectedId?: string | null;
  onRowClick?: (w: WarehouseListRow) => void;
};

export function WarehousesTable({
  rows,
  loading,
  hasMore = false,
  loadMore,
  height = 520,
  selectedId,
  onRowClick,
}: Props) {
  const columns = React.useMemo<VirtualColumnDef<WarehouseListRow>[]>(
    () => [
      {
        key: "name",
        header: "Warehouse",
        className: "col-span-6",
        render: (w) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{w.name}</span>
            {w.isSystem ? <SystemBadge /> : null}
          </div>
        ),
      },
      {
        key: "meta",
        header: "Código / Ubicación",
        className: "col-span-4",
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
    ],
    []
  );

  return (
    <VirtualDataTable<WarehouseListRow>
      rows={rows}
      columns={columns}
      rowKey={(w) => w.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={hasMore}
      onEndReached={hasMore ? loadMore : undefined}
      empty={<span className="text-sm text-muted-foreground">Sin warehouses.</span>}
      onRowClick={onRowClick}
      getRowClassName={(w) =>
        rowClassName({
          selected: Boolean(selectedId && w.id === selectedId),
          inactive: !w.isActive,
        })
      }
    />
  );
}