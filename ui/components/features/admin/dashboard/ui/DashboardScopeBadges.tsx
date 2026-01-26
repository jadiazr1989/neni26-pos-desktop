"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

function shortId(id: string, left = 4, right = 4) {
  if (id.length <= left + right + 1) return id;
  return `${id.slice(0, left)}…${id.slice(-right)}`;
}

export function DashboardScopeBadges(props: { storeId: string; warehouseId: string | null }) {
  const store = shortId(props.storeId);
  const wh = props.warehouseId ? shortId(props.warehouseId) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="secondary" className="rounded-full">
        Store: {store}
      </Badge>
      {wh && (
        <Badge variant="outline" className="rounded-full">
          Warehouse: {wh}
        </Badge>
      )}
    </div>
  );
}
