// src/modules/catalog/categories/ui/tree/CategoriesTreeTable.tsx
"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { VirtualDataTable, type VirtualColumnDef } from "@/components/shared/VirtualDataTable";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import { RowActions } from "@/components/shared/RowActions";
import type { CategoryDTO } from "@/lib/modules/catalog/categories/category.dto";

export function CategoriesTreeTable(props: {
  rows: CategoryDTO[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;

  onOpen: (c: CategoryDTO) => void;     // navegar a hijos
  onEdit: (c: CategoryDTO) => void;
  onDelete: (id: string) => Promise<void>;

  height?: number;
}) {
  const columns = React.useMemo<Array<VirtualColumnDef<CategoryDTO>>>(() => {
    return [
      {
        key: "img",
        header: "Img",
        className: "col-span-1",
        render: (c) => <EntityAvatar src={c.imageUrl} alt={c.name} size={36} />,
      },
      {
        key: "name",
        header: "Nombre",
        className: "col-span-4",
        render: (c) => (
          <button
            onClick={() => props.onOpen(c)}
            className="w-full flex items-center gap-2 text-left"
            title="Abrir subcategorías"
          >
            <span className="font-medium truncate">{c.name}</span>
            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
          </button>
        ),
      },
      {
        key: "slug",
        header: "Slug",
        className: "col-span-3 text-sm text-muted-foreground truncate",
        render: (c) => c.slug,
      },
      {
        key: "path",
        header: "Ruta (slugPath)",
        className: "col-span-3 text-xs text-muted-foreground truncate",
        render: (c) => c.slugPath ?? "—",
      },
      {
        key: "actions",
        header: <span className="w-full text-right block">Acc.</span>,
        className: "col-span-1",
        render: (c) => (
          <RowActions
            onEdit={() => props.onEdit(c)}
            onDelete={() => props.onDelete(c.id)}
            deleteConfirm={{ title: "Eliminar categoría", message: "Esto es hard delete. ¿Continuar?" }}
            disabled={props.loading}
          />
        ),
      },
    ];
  }, [props]);

  return (
    <VirtualDataTable<CategoryDTO>
      rows={props.rows}
      columns={columns}
      rowKey={(c) => c.id}
      height={props.height ?? 520}
      estimateSize={56}
      overscan={10}
      isLoading={props.loading}
      hasMore={props.hasMore}
      onEndReached={props.loadMore}
      empty={<span className="text-sm text-muted-foreground">Sin categorías en este nivel.</span>}
    />
  );
}
