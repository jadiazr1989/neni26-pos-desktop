// src/modules/catalog/products/ui/ui/VariantsTable.tsx
"use client";

import * as React from "react";
import { RowActions } from "@/components/shared/RowActions";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { productService } from "@/lib/modules/catalog/products/product.service";
import { EntityAvatar } from "@/components/shared/EntityAvatar";

export function VariantsTable(props: {
  rows: ProductVariantDTO[];
  loading?: boolean;
  onEdit: (v: ProductVariantDTO) => void;
  onChanged: () => Promise<void> | void;
  height?: number;
}) {
  const cols = React.useMemo<Array<VirtualColumnDef<ProductVariantDTO>>>(() => {
    return [
      {
        key: "img",
        header: "Img",
        className: "col-span-1",
        render: (c) => <EntityAvatar src={c.imageUrl} alt={c.title ?? "-"} size={36} />,
      },
      {
        key: "sku",
        header: "SKU",
        className: "col-span-3",
        render: (v) => (
          <div className="min-w-0">
            <div className="font-medium truncate">{v.sku}</div>
            <div className="text-xs text-muted-foreground truncate">Barcode: {v.barcode ?? "—"}</div>
          </div>
        ),
      },
      {
        key: "price",
        header: "Precio",
        className: "col-span-2 text-xs text-muted-foreground",
        render: (v) => String(v.priceBaseMinor),
      },
      {
        key: "cost",
        header: "Costo",
        className: "col-span-2 text-xs text-muted-foreground",
        render: (v) => String(v.costBaseMinor),
      },
      {
        key: "active",
        header: "Activa",
        className: "col-span-2 text-xs text-muted-foreground",
        render: (v) => (v.isActive ? "Sí" : "No"),
      },
      {
        key: "actions",
        header: <span className="w-full text-right block">Acc.</span>,
        className: "col-span-2",
        render: (v) => (
          <div className="flex justify-end gap-2">
            <button
              className="text-xs underline"
              onClick={() => void (async () => {
                await productService.setVariantActive(v.id, !v.isActive);
                await props.onChanged();
              })()}
            >
              {v.isActive ? "Desactivar" : "Activar"}
            </button>

            <RowActions onEdit={() => props.onEdit(v)} disabled={Boolean(props.loading)} />
          </div>
        ),
      },
    ];
  }, [props]);

  // Nota: variantes ya vienen dentro del producto, no hacemos paging aquí (por ahora).
  return (
    <VirtualDataTable<ProductVariantDTO>
      rows={props.rows}
      columns={cols}
      rowKey={(v) => v.id}
      height={props.height ?? 420}
      estimateSize={58}
      overscan={10}
      isLoading={props.loading}
      hasMore={false}
      empty={<span className="text-sm text-muted-foreground">Este producto no tiene variantes aún.</span>}
    />
  );
}
