// src/modules/catalog/brands/ui/BrandsTable.tsx
"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import { RowActions } from "@/components/shared/RowActions";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";

export function BrandsTable(props: {
  rows: BrandDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;

  onEdit: (b: BrandDTO) => void;
  onDelete: (id: string) => Promise<void>;

  height?: number;
}) {
  const columns = React.useMemo<Array<VirtualColumnDef<BrandDTO>>>(() => {
    return [
      { key: "img", header: "Img", className: "col-span-1", render: (b) => <EntityAvatar src={b.imageUrl} alt={b.name} size={36} /> },
      { key: "name", header: "Nombre", className: "col-span-5 font-medium truncate", render: (b) => b.name },
      { key: "slug", header: "Slug", className: "col-span-5 text-sm text-muted-foreground truncate", render: (b) => b.slug },
      {
        key: "actions",
        header: <span className="w-full text-right block">Acc.</span>,
        className: "col-span-1",
        render: (b) => (
          <RowActions
            onEdit={() => props.onEdit(b)}
            onDelete={() => props.onDelete(b.id)}
            deleteConfirm={{ title: "Eliminar marca", message: "Esto es hard delete. ¿Continuar?" }}
            disabled={props.loading}
          />
        ),
      },
    ];
  }, [props]);

  return (
    <VirtualDataTable<BrandDTO>
      rows={props.rows}
      columns={columns}
      rowKey={(b) => b.id}
      height={props.height ?? 520}
      estimateSize={56}
      overscan={10}
      isLoading={props.loading}
      hasMore={props.hasMore}
      onEndReached={props.loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin marcas.</span>}
    />
  );
}
