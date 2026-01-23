// src/modules/inventory/ui/components/InventoryWarehouseStockTable.tsx
"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

export function InventoryWarehouseStockTable(props: {
  rows: WarehouseStockRowUI[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onPickVariant: (variantId: string) => void;
  height?: number;
}) {
  const columns = React.useMemo<Array<VirtualColumnDef<WarehouseStockRowUI>>>(() => {
    return [
      { key: "sku", header: "SKU", className: "col-span-3 font-medium truncate", render: (r) => r.sku },
      { key: "title", header: "Título", className: "col-span-6 text-sm truncate", render: (r) => r.title ?? "—" },
      { key: "qty", header: "Stock", className: "col-span-2 text-right tabular-nums", render: (r) => String(r.qty) },
      {
        key: "active",
        header: "Estado",
        className: "col-span-1 text-xs text-muted-foreground text-right",
        render: (r) => (r.isActive ? "OK" : "OFF"),
      },
    ];
  }, []);

  return (
    <VirtualDataTable<WarehouseStockRowUI>
      rows={props.rows}
      columns={columns}
      rowKey={(r) => r.variantId}
      height={props.height ?? 520}
      estimateSize={56}
      overscan={10}
      isLoading={props.loading}
      hasMore={props.hasMore}
      onEndReached={props.loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin inventario.</span>}
      onRowClick={(r) => props.onPickVariant(r.variantId)}
    />
  );
}
