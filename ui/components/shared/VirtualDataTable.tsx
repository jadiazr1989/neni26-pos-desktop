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

  className?: string;
}) {
  const hasMore = props.hasMore ?? false;

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
            renderRow={(row) => (
              <div key={props.rowKey(row)} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                {props.columns.map((c) => (
                  <div key={c.key} className={c.className}>
                    {c.render(row)}
                  </div>
                ))}
              </div>
            )}
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
