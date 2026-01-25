// src/modules/catalog/products/ui/variants/VariantsTable.tsx
"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import type { ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { displayVariantTitle } from "@/lib/utils";

export function VariantsTable(props: {
  rows: ProductVariantDTO[];
  loading?: boolean;

  onEdit: (v: ProductVariantDTO) => void;

  // Screen decide confirm + ejecuta la acción
  onToggleActiveRequest: (v: ProductVariantDTO, nextActive: boolean) => void;

  height?: number;
}) {
  const disabled = Boolean(props.loading);

  const cols = React.useMemo<Array<VirtualColumnDef<ProductVariantDTO>>>(() => {
    return [
      {
        key: "img",
        header: "Img",
        className: "col-span-1",
        render: (v) => <EntityAvatar src={v.imageUrl} alt={v.title ?? v.sku ?? "-"} size={36} />,
      },
      {
        key: "sku",
        header: "SKU",
        className: "col-span-2",
        render: (v) => (
          <div className="min-w-0">
            <div className="font-medium truncate">{v.sku}</div>
            <div className="text-xs text-muted-foreground truncate">
              Barcode: {v.barcode ?? "—"}
            </div>
          </div>
        ),
      },
      {
        key: "title",
        header: "Título",
        className: "col-span-2",
        render: (r) => (
          <span className="text-sm truncate block">
            {displayVariantTitle(r.title, r.sku)}
          </span>
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
        header: "Estado",
        className: "col-span-1",
        render: (v) => (
          <div className="flex items-center justify-center">
            <span
              className={[
                "inline-block rounded-full",
                "size-3.5",
                v.isActive ? "bg-emerald-500" : "bg-rose-500",
              ].join(" ")}
              title={v.isActive ? "Activa" : "Desactivada"}
            />
          </div>
        ),
      },
      {
        key: "actions",
        header: <span className="w-full text-right block">Acc.</span>,
        className: "col-span-2",
        render: (v) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => props.onToggleActiveRequest(v, !v.isActive)}
              disabled={disabled}
              title={v.isActive ? "Ocultar variante" : "Activar variante"}
            >
              {v.isActive ? (
                <>
                  <EyeOff className="mr-1 size-4" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="mr-1 size-4" />
                  Activar
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => props.onEdit(v)}
              disabled={disabled}
              title="Editar variante"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        ),
      },
    ];
  }, [disabled, props]);

  return (
    <VirtualDataTable<ProductVariantDTO>
      rows={props.rows}
      columns={cols}
      rowKey={(v) => v.id}
      height={props.height ?? 420}
      estimateSize={58}
      overscan={10}
      isLoading={disabled}
      hasMore={false}
      getRowClassName={(row) => (!row.isActive ? "opacity-70" : "")}
      empty={<span className="text-sm text-muted-foreground">No hay variantes con ese filtro/búsqueda.</span>}
    />
  );
}
