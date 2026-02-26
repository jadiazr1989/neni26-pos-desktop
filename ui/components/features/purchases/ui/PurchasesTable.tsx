"use client";

import * as React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";

import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { Button } from "@/components/ui/button";
import type { PurchaseDTO, PurchaseStatus } from "@/lib/modules/purchases/purchase.dto";
import { moneyStrToLabelCUP, type MoneyStr } from "@/lib/money/moneyStr";
import { minorToMoneyString } from "@/lib/money/money";

function shortId(id?: string | null) {
  if (!id) return "—";
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

/** Formatea Total (minor) sea number o MoneyStr */
function fmtTotal(v: number | MoneyStr | null | undefined) {
  if (v == null) return "—";
  if (typeof v === "string") return moneyStrToLabelCUP(v);
  return `${minorToMoneyString(v, { scale: 2 })} CUP`;
}

const STATUS_UI: Record<PurchaseStatus, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "bg-amber-100 text-amber-900 border border-amber-200" },
  ORDERED: { label: "Ordenada", className: "bg-sky-100 text-sky-900 border border-sky-200" },
  RECEIVED: { label: "Recibida", className: "bg-emerald-100 text-emerald-900 border border-emerald-200" },
  CANCELLED: { label: "Cancelada", className: "bg-rose-100 text-rose-900 border border-rose-200" },
};

function buildPurchaseColumns(args: { onReceive?: (p: PurchaseDTO) => void }): Array<VirtualColumnDef<PurchaseDTO>> {
  const { onReceive } = args;

  return [
    {
      key: "purchase",
      header: "Compra",
      className: "col-span-5",
      render: (p) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{p.invoiceNumber ?? `Compra ${shortId(p.id)}`}</div>
          <div className="text-xs text-muted-foreground truncate">WH {shortId(p.warehouseId)}</div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      className: "col-span-2 text-right",
      render: (p) => (
        <div className="tabular-nums font-semibold">
          {fmtTotal(p.totalBaseMinor as unknown as number | MoneyStr | null | undefined)}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Creada",
      className: "col-span-2 text-xs text-muted-foreground truncate",
      render: (p) => {
        const d = new Date(p.createdAt);
        return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
      },
    },
    {
      key: "actions",
      header: <span className="w-full text-right block">Estado</span>,
      className: "col-span-3",
      render: (p) => {
        const s = STATUS_UI[p.status] ?? {
          label: String(p.status ?? "—"),
          className: "bg-muted text-muted-foreground border border-border",
        };

        const canReceive = Boolean(onReceive) && p.status === "ORDERED";

        return (
          <div className="flex items-center justify-end gap-2">
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.className}`}>{s.label}</span>

            {canReceive ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onReceive?.(p);
                }}
              >
                <CheckCircle2 className="mr-1 size-4" />
                Recibir
              </Button>
            ) : null}

          </div>
        );
      },
    },
  ];
}

export function PurchasesTable(props: {
  rows: PurchaseDTO[];
  loading: boolean;
  hasMore?: boolean;
  loadMore?: () => void;

  onOpen: (p: PurchaseDTO) => void;
  onReceive?: (p: PurchaseDTO) => void;

  height?: number;
}) {
  const columns = React.useMemo(() => buildPurchaseColumns({ onReceive: props.onReceive }), [props.onReceive]);

  return (
    <VirtualDataTable<PurchaseDTO>
      rows={props.rows}
      columns={columns}
      rowKey={(p) => p.id}
      height={props.height ?? 520}
      estimateSize={60}
      overscan={10}
      isLoading={props.loading}
      hasMore={Boolean(props.hasMore)}
      onEndReached={props.loadMore}
      onRowClick={props.onOpen}
      getRowClassName={() => "cursor-pointer hover:bg-muted/50 transition-colors"}
      empty={<span className="text-sm text-muted-foreground">No hay compras con ese filtro/búsqueda.</span>}
    />
  );
}