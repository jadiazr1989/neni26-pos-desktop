"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import { displayVariantTitle } from "@/lib/utils";

export function InventoryWarehouseStockTable(props: {
  rows: WarehouseStockRowUI[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;

  onPickRow: (row: WarehouseStockRowUI) => void;

  selectedVariantId?: string | null;
  height?: number;
}) {
  const columns = React.useMemo<Array<VirtualColumnDef<WarehouseStockRowUI>>>(() => {
    return [
      {
        key: "img",
        header: "",
        className: "col-span-1",
        render: (v) => <EntityAvatar src={v.imageUrl ?? undefined} alt={v.title ?? v.sku ?? "-"} size={36} />,
      },
      {
        key: "sku",
        header: "SKU",
        className: "col-span-2",
        render: (r) => <span className="font-medium truncate block">{r.sku}</span>,
      },
      {
        key: "title",
        header: "Producto",
        className: "col-span-6",
        render: (r) => (
          <div className="min-w-0">
            <span className="text-sm truncate block">{displayVariantTitle(r.title, r.sku)}</span>
            {r.productName ? (
              <span className="text-xs text-muted-foreground truncate block">{r.productName}</span>
            ) : null}
          </div>
        ),
      },
      // InventoryWarehouseStockTable.tsx (col qty)
      {
        key: "qty",
        header: <span className="w-full text-right block">Stock</span>,
        className: "col-span-2 text-right tabular-nums",
        render: (r) => r.availableDisplay ?? r.qtyDisplay ?? String(r.qtyBaseMinor),
      }
      ,
      {
        key: "active",
        header: <span className="w-full text-right block">Estado</span>,
        className: "col-span-1",
        render: (r) => (
          <div className="flex items-center justify-end">
            <span
              className={[
                "inline-block rounded-full",
                "size-4", // ✅ un poco más grande
                r.isActive ? "bg-emerald-500" : "bg-rose-500",
              ].join(" ")}
              title={r.isActive ? "Activa" : "Desactivada"}
            />
          </div>
        ),
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
      onRowClick={(r) => props.onPickRow(r)}
      getRowClassName={(r) => {
        const selected = props.selectedVariantId && r.variantId === props.selectedVariantId;
        return [
          "cursor-pointer",
          !r.isActive ? "opacity-70" : "",
          selected ? "bg-muted/60 ring-1 ring-ring" : "",
        ]
          .filter(Boolean)
          .join(" ");
      }}
    />
  );
}
