"use client";

import * as React from "react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";

function rowClassName(args: { selected: boolean }) {
  return [
    "cursor-pointer",
    "hover:bg-muted/40",
    args.selected ? "bg-muted/60 ring-1 ring-ring" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function BrandsTable(props: {
  rows: BrandDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;

  height?: number;

  selectedId?: string | null;
  onRowClick?: (b: BrandDTO) => void;
}) {
  const columns = React.useMemo<Array<VirtualColumnDef<BrandDTO>>>(() => {
    return [
      {
        key: "img",
        header: "",
        className: "col-span-1",
        render: (b) => <EntityAvatar src={b.imageUrl} alt={b.name} size={36} />,
      },
      {
        key: "name",
        header: "Nombre",
        className: "col-span-6",
        render: (b) => <span className="font-medium truncate block">{b.name}</span>,
      },
      {
        key: "slug",
        header: "Slug",
        className: "col-span-5",
        render: (b) => <span className="text-sm text-muted-foreground truncate block">{b.slug}</span>,
      },
    ];
  }, []);

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
      onRowClick={(b) => props.onRowClick?.(b)}
      getRowClassName={(b) =>
        rowClassName({
          selected: Boolean(props.selectedId && b.id === props.selectedId),
        })
      }
    />
  );
}