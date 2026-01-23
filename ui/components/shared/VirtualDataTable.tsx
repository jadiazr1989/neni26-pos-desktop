// src/components/shared/VirtualDataTable.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { VirtualList } from "@/components/shared/VirtualList";

export type VirtualColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  className?: string; // usa col-span-* aquí
  render: (row: T) => React.ReactNode;
};

export function VirtualDataTable<T>(props: {
  rows: T[];
  columns: Array<VirtualColumnDef<T>>;
  rowKey: (row: T) => string;

  height: number; // px del scroll container
  estimateSize?: number;
  overscan?: number;

  isLoading?: boolean;
  empty?: React.ReactNode;

  hasMore?: boolean;
  onEndReached?: () => void;

  // ✅ NUEVO
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string; // opcional por si quieres custom per-row

  className?: string;
}) {
  const hasMore = props.hasMore ?? false;
  const clickable = typeof props.onRowClick === "function";

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", props.className)}>
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30">
        {props.columns.map((c) => (
          <div key={c.key} className={c.className}>
            {c.header}
          </div>
        ))}
      </div>

      {/* Body */}
      {props.rows.length === 0 && !props.isLoading ? (
        <div className="px-3 py-6">
          {props.empty ?? <span className="text-sm text-muted-foreground">Sin datos.</span>}
        </div>
      ) : (
        <div className="divide-y divide-border">
          <VirtualList
            items={props.rows}
            height={props.height}
            estimateSize={props.estimateSize ?? 56}
            overscan={props.overscan ?? 10}
            onEndReached={() => {
              if (!props.isLoading && hasMore) props.onEndReached?.();
            }}
            renderRow={(row) => {
              const key = props.rowKey(row);

              return (
                <div
                  key={key}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-disabled={clickable ? props.isLoading : undefined}
                  className={cn(
                    "grid grid-cols-12 gap-2 px-3 py-2 items-center outline-none",
                    clickable &&
                      "cursor-pointer hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    props.isLoading && clickable && "opacity-60 pointer-events-none",
                    props.getRowClassName?.(row)
                  )}
                  onClick={() => {
                    if (!clickable || props.isLoading) return;
                    props.onRowClick?.(row);
                  }}
                  onKeyDown={(e) => {
                    if (!clickable || props.isLoading) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      props.onRowClick?.(row);
                    }
                  }}
                >
                  {props.columns.map((c) => (
                    <div key={c.key} className={c.className}>
                      {c.render(row)}
                    </div>
                  ))}
                </div>
              );
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-background">
        {props.isLoading ? "Cargando…" : hasMore ? "Scroll para cargar más…" : "Fin del listado."}
      </div>
    </div>
  );
}
