// src/modules/catalog/products/ui/ui/ProductsTable.tsx
"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { RowActions } from "@/components/shared/RowActions";
import type { ProductDTO } from "@/lib/modules/catalog/products/product.dto";

function fmtCount(n: number) {
  return new Intl.NumberFormat().format(n);
}

export function ProductsTable(props: {
  rows: ProductDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;

  onOpen: (p: ProductDTO) => void;
  onEdit: (p: ProductDTO) => void;
  onDelete: (id: string, name: string) => Promise<void> | void;

  selectedId?: string | null;
  height?: number;
}) {
  const columns: Array<VirtualColumnDef<ProductDTO>> = [
    {
      key: "name",
      header: "Nombre",
      className: "col-span-4 min-w-0",
      render: (p) => (
        <div className="min-w-0">
          <div className="font-medium truncate">{p.name}</div>
          <div className="text-xs text-muted-foreground truncate">Barcode: {p.barcode ?? "—"}</div>
        </div>
      ),
    },
    {
      key: "brand",
      header: "BrandId",
      className: "col-span-2 text-xs text-muted-foreground truncate",
      render: (p) => p.brandId ?? "—",
    },
    {
      key: "cat",
      header: "CategoryId",
      className: "col-span-2 text-xs text-muted-foreground truncate",
      render: (p) => p.categoryId ?? "—",
    },
    {
      key: "variants",
      header: "#Vars",
      className: "col-span-1 text-xs text-muted-foreground",
      render: (p) => fmtCount(p.variants?.length ?? 0),
    },
    {
      key: "status",
      header: "Status",
      className: "col-span-2 text-xs text-muted-foreground truncate",
      render: (p) => String(p.status ?? "—"),
    },
    {
      key: "actions",
      header: <span className="w-full text-right block">Acc.</span>,
      className: "col-span-1",
      render: (p) => (
        <div
          className="flex justify-end"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <RowActions
            onEdit={() => props.onEdit(p)}
            onDelete={() => props.onDelete(p.id, p.name)}
            deleteConfirm={{
              title: "Confirmar",
              message: "Solo se puede eliminar si NO tiene variantes. ¿Deseas continuar?",
              confirmText: "Continuar",
              cancelText: "Cancelar",
              destructive: false,
            }}
            disabled={props.loading}
          />
        </div>
      ),
    },
  ];

  return (
    <VirtualDataTable<ProductDTO>
      rows={props.rows}
      columns={columns}
      rowKey={(p) => p.id}
      height={props.height ?? 520}
      estimateSize={60}
      overscan={10}
      isLoading={props.loading}
      hasMore={props.hasMore}
      onEndReached={props.loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin productos.</span>}
      onRowClick={(p) => props.onOpen(p)}
      getRowClassName={(row) => {
        const selected = props.selectedId && row.id === props.selectedId;
        return ["cursor-pointer", selected ? "bg-muted/60 ring-1 ring-ring" : ""].filter(Boolean).join(" ");
      }}
    />
  );
}