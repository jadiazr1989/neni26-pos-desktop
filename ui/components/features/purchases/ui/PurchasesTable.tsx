// src/modules/purchases/ui/ui/PurchasesTable.tsx
"use client";

import * as React from "react";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { Button } from "@/components/ui/button";
import type { PurchaseDTO } from "@/lib/modules/purchases/purchase.dto";

function fmtMoneyMinor(n: number) {
  return new Intl.NumberFormat().format(n);
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Borrador", className: "bg-yellow-100 text-yellow-800" },
  RECEIVED: { label: "Recibida", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Cancelada", className: "bg-rose-100 text-rose-800" },
};

function buildPurchaseColumns(args: {
  onReceive?: (p: PurchaseDTO) => void;
}): Array<VirtualColumnDef<PurchaseDTO>> {
  const { onReceive } = args;

  return [
    {
      key: "purchase",
      header: "Compra",
      className: "col-span-5",
      render: (p) => (
        <div className="min-w-0">
          <div className="font-medium truncate">
            {p.invoiceNumber ?? `Compra ${p.id.slice(0, 8)}`}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            WH {p.warehouseId.slice(0, 8)}
          </div>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      className: "col-span-2 text-xs text-muted-foreground",
      render: (p) => fmtMoneyMinor(p.totalBaseMinor),
    },
    {
      key: "createdAt",
      header: "Creada",
      className: "col-span-2 text-xs text-muted-foreground truncate",
      render: (p) => new Date(p.createdAt).toLocaleString(),
    },
    {
      key: "actions",
      header: <span className="w-full text-right block">Acc.</span>,
      className: "col-span-3",
      render: (p) => {
        const status =
          STATUS_LABEL[p.status] ?? { label: p.status, className: "bg-muted text-muted-foreground" };

        return (
          <div className="flex items-center justify-end gap-2">
            {/* Badge estado */}
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${status.className}`}>
              {status.label}
            </span>

            {/* Acción: Recibir (solo DRAFT) */}
            {onReceive && p.status === "DRAFT" && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation(); // ✅ evita abrir detalle por click de fila
                  onReceive(p);
                }}
              >
                <CheckCircle2 className="mr-1 size-4" />
                Recibir
              </Button>
            )}

            {/* Indicador navegación */}
            <ChevronRight className="size-4 text-muted-foreground" />
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
  const columns = buildPurchaseColumns({ onReceive: props.onReceive });

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
      onRowClick={props.onOpen} // ✅ click en toda la fila
      getRowClassName={() => "cursor-pointer hover:bg-muted/50 transition-colors"}
      empty={<span className="text-sm text-muted-foreground">No hay compras con ese filtro/búsqueda.</span>}
    />
  );
}
