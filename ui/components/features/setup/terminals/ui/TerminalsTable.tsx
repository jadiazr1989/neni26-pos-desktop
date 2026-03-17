"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>;
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

function shortId(id: string): string {
  return id.length >= 8 ? id.slice(0, 8) : id;
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
  rows: TerminalDTO[];
  loading: boolean;
  height?: number;

  selectedId?: string | null;
  onRowClick?: (t: TerminalDTO) => void;
};

export function TerminalsTable({ rows, loading, height = 560, selectedId, onRowClick }: Props) {
  const columns = React.useMemo<VirtualColumnDef<TerminalDTO>[]>(
    () => [
      {
        key: "name",
        header: "Terminal",
        className: "col-span-4",
        render: (t) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium truncate">{t.name}</span>
            {t.isSystem ? <SystemBadge /> : null}
          </div>
        ),
      },
      {
        key: "warehouse",
        header: "Warehouse",
        className: "col-span-4",
        render: (t) => (
          <div className="min-w-0">
            <div className="truncate">{t.warehouse?.name ?? `WH ${shortId(t.warehouseId)}`}</div>
            <div className="text-xs text-muted-foreground font-mono truncate">{shortId(t.warehouseId)}</div>
          </div>
        ),
      },
      {
        key: "state",
        header: "Estado",
        className: "col-span-4",
        render: (t) => <ActiveBadge isActive={t.isActive} />,
      },
    ],
    []
  );

  return (
    <VirtualDataTable<TerminalDTO>
      rows={rows}
      columns={columns}
      rowKey={(t) => t.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={false}
      onEndReached={undefined}
      empty={<span className="text-sm text-muted-foreground">Sin terminales.</span>}
      onRowClick={onRowClick}
      getRowClassName={(t) =>
        rowClassName({
          selected: Boolean(selectedId && t.id === selectedId),
          inactive: !t.isActive,
        })
      }
    />
  );
}