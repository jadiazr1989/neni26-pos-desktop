// src/components/shared/VirtualDataTable.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { VirtualList } from "@/components/shared/VirtualList";

export type VirtualColumnDef<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  render: (row: T) => React.ReactNode;
};

export function VirtualDataTable<T>(props: {
  rows: T[];
  columns: Array<VirtualColumnDef<T>>;
  rowKey: (row: T) => string;

  height: number;
  estimateSize?: number;
  overscan?: number;

  isLoading?: boolean;
  empty?: React.ReactNode;

  hasMore?: boolean;
  onEndReached?: () => void;

  // row interaction
  onRowClick?: (row: T) => void;
  rowClickScope?: "row" | "cell"; // ✅ NEW
  getRowClassName?: (row: T) => string;

  className?: string;
  stickyHeader?: boolean;
}) {
  const hasMore = props.hasMore ?? false;
  const sticky = props.stickyHeader ?? true;

  const rowClickScope = props.rowClickScope ?? "row";
  const rowClickable = rowClickScope === "row" && typeof props.onRowClick === "function";

  const baseRow =
    "grid grid-cols-12 gap-2 px-3 py-2 items-center outline-none transition-colors";

  const clickableRow =
    "cursor-pointer hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", props.className)}>
      {/* Header */}
      <div
        className={cn(
          "grid grid-cols-12 gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/30 border-b border-border",
          sticky && "sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-muted/60"
        )}
      >
        {props.columns.map((c) => (
          <div key={c.key} className={cn("min-w-0", c.className)}>
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
        <VirtualList
          items={props.rows}
          height={props.height}
          estimateSize={props.estimateSize ?? 56}
          overscan={props.overscan ?? 10}
          onEndReached={() => {
            if (!props.isLoading && hasMore) props.onEndReached?.();
          }}
          renderRow={(row, idx) => {
            const key = props.rowKey(row);
            const zebra = idx % 2 === 0 ? "bg-background" : "bg-muted/10";
            const rowCls = props.getRowClassName?.(row) ?? "";
            const disabledRowClick = rowClickable && Boolean(props.isLoading);

            return (
              <div
                key={key}
                role={rowClickable ? "button" : undefined}
                tabIndex={rowClickable ? 0 : undefined}
                aria-disabled={rowClickable ? props.isLoading : undefined}
                className={cn(
                  baseRow,
                  zebra,
                  "border-b border-border/60 last:border-b-0",
                  rowClickable && clickableRow,
                  disabledRowClick && "opacity-60 pointer-events-none",
                  rowCls
                )}
                onClick={() => {
                  if (!rowClickable || props.isLoading) return;
                  props.onRowClick?.(row);
                }}
                onKeyDown={(e) => {
                  if (!rowClickable || props.isLoading) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    props.onRowClick?.(row);
                  }
                }}
              >
                {props.columns.map((c) => (
                  <div key={c.key} className={cn("min-w-0", c.className)}>
                    {c.render(row)}
                  </div>
                ))}
              </div>
            );
          }}
        />
      )}

      {/* Footer */}
      <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-background">
        {props.isLoading ? "Cargando…" : hasMore ? "Scroll para cargar más…" : "Fin del listado."}
      </div>
    </div>
  );
}
