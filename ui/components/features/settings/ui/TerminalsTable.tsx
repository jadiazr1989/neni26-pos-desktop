"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { TerminalDTO } from "@/lib/modules/terminals/terminal.dto";

// ✅ Si ya exportaste estos desde UsersTable, puedes importarlos.
// import { ActiveBadge, SystemBadge } from "../../users/ui/UsersTable";

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "ACTIVE" : "INACTIVE"}</Badge>;
}

export function SystemBadge() {
  return <Badge variant="outline">SYSTEM</Badge>;
}

function shortId(id: string): string {
  return id.length >= 8 ? id.slice(0, 8) : id;
}

export function TerminalsTable({
  rows,
  loading,
  onEdit,
  onToggleActive,
  height = 560,
}: {
  rows: TerminalDTO[];
  loading: boolean;
  onEdit: (t: TerminalDTO) => void;
  onToggleActive: (t: TerminalDTO) => void;
  height?: number;
}) {
  const columns = React.useMemo<VirtualColumnDef<TerminalDTO>[]>(() => [
    {
      key: "name",
      header: "Terminal",
      className: "col-span-4 font-medium truncate",
      render: (t) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate">{t.name}</span>
          {t.isSystem && <SystemBadge />}
        </div>
      ),
    },
    {
      key: "warehouse",
      header: "Warehouse",
      className: "col-span-4 truncate",
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
      className: "col-span-2",
      render: (t) => <ActiveBadge isActive={t.isActive} />,
    },
    {
      key: "actions",
      header: <span className="block text-right">Acc.</span>,
      className: "col-span-2",
      render: (t) => (
        <RowActions
          onEdit={() => onEdit(t)}
          onToggle={() => onToggleActive(t)}
          hideToggle={t.isSystem}
          loading={loading}
          toggleConfirm={{
            title: t.isActive ? "Desactivar terminal" : "Reactivar terminal",
            message: t.isActive
              ? "Este terminal no podrá usarse en el POS hasta ser activado nuevamente."
              : "Este terminal volverá a estar disponible para handshake y uso en POS.",
            confirmText: t.isActive ? "Desactivar" : "Reactivar",
            destructive: t.isActive,
          }}
        />
      ),
    },
  ], [loading, onEdit, onToggleActive]);

  return (
    <VirtualDataTable
      rows={rows}
      columns={columns}
      rowKey={(t) => t.id}
      height={height}
      estimateSize={56}
      overscan={10}
      isLoading={loading}
      hasMore={false}
      onEndReached={() => {}}
      empty={<span className="text-sm text-muted-foreground">Sin terminales.</span>}
    />
  );
}
