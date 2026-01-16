// src/components/shared/VirtualList.tsx
"use client";

import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export function VirtualList<T>(props: {
  items: T[];
  height: number;
  estimateSize?: number;
  overscan?: number;
  onEndReached?: () => void;
  renderRow: (item: T, index: number) => React.ReactNode;
}) {
  const parentRef = React.useRef<HTMLDivElement | null>(null);

  const estimate = props.estimateSize ?? 52;
  const overscan = props.overscan ?? 8;

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: props.items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimate,
    overscan,
  });

  // ✅ evita loadMore en mount + evita multi-fire
  const didInitRef = React.useRef(false);
  const endLockRef = React.useRef(false);

  React.useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    const onScroll = () => {
      const v = rowVirtualizer.getVirtualItems();
      if (v.length === 0) return;

      const last = v[v.length - 1];
      if (!last) return;

      // 1) evita auto-loadMore al montar
      if (!didInitRef.current) {
        didInitRef.current = true;
        return;
      }

      // 2) near end
      const nearEnd = last.index >= props.items.length - 10;
      if (!nearEnd) {
        endLockRef.current = false;
        return;
      }

      // 3) lock para que no dispare mil veces
      if (endLockRef.current) return;
      endLockRef.current = true;

      props.onEndReached?.();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [rowVirtualizer, props.items.length, props.onEndReached]);

  return (
    <div ref={parentRef} style={{ height: props.height, overflow: "auto" }}>
      <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = props.items[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {props.renderRow(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
