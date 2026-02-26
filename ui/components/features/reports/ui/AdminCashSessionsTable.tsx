"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { CashSessionListRowDTO } from "@/lib/modules/admin/reports";
import { formatBaseMinorCUP } from "@/lib/money/formatBaseMoney";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString();
}

function statusLabel(closedAt: string | null) {
  if (!closedAt) return { label: "OPEN", className: "bg-yellow-100 text-yellow-800" };
  return { label: "CLOSED", className: "bg-emerald-100 text-emerald-800" };
}

function buildColumns(): Array<VirtualColumnDef<CashSessionListRowDTO>> {
  return [
    {
      key: "session",
      header: "Session",
      className: "col-span-5",
      render: (r) => (
        <div className="min-w-0">
          <div className="font-medium truncate">
            {r.terminalName ?? "Terminal"} • {r.warehouseName}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {r.id.slice(0, 8)} • {fmtDate(r.openedAt)}
          </div>
        </div>
      ),
    },
    {
      key: "tickets",
      header: "Tickets",
      className: "col-span-2 text-xs text-muted-foreground",
      render: (r) => String(r.ticketsCount),
    },
    {
      key: "gross",
      header: "Gross",
      className: "col-span-2 text-xs text-muted-foreground",
      render: (r) => formatBaseMinorCUP(r.grossSalesBaseMinor),
    },
    {
      key: "netCash",
      header: "Net Cash",
      className: "col-span-2 text-xs text-muted-foreground",
      render: (r) => formatBaseMinorCUP(r.netCashBaseMinor),
    },
    {
      key: "actions",
      header: <span className="w-full text-right block">Estado</span>,
      className: "col-span-1",
      render: (r) => {
        const s = statusLabel(r.closedAt);
        return (
          <div className="flex items-center justify-end gap-2">
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.className}`}>{s.label}</span>
          </div>
        );
      },
    },
  ];
}

export function AdminCashSessionsTable(props: {
  rows: CashSessionListRowDTO[];
  loading: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  onOpen: (row: CashSessionListRowDTO) => void;
  height?: number;
}) {
  const columns = React.useMemo(() => buildColumns(), []);

  return (
    <VirtualDataTable<CashSessionListRowDTO>
      rows={props.rows}
      columns={columns}
      rowKey={(r) => r.id}
      height={props.height ?? 520}
      estimateSize={64}
      overscan={10}
      isLoading={props.loading}
      hasMore={Boolean(props.hasMore)}
      onEndReached={props.loadMore}
      onRowClick={props.onOpen}
      getRowClassName={() => "cursor-pointer hover:bg-muted/50 transition-colors"}
      empty={<span className="text-sm text-muted-foreground">No hay sesiones con ese filtro.</span>}
    />
  );
}