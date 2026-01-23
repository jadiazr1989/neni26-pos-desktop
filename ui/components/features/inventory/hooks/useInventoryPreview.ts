// src/modules/inventory/ui/hooks/useInventoryPreview.ts
"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import type { InventoryAdjustLineInput, InventoryPreviewRowDTO } from "@/lib/modules/inventory/inventory.dto";

export function useInventoryPreview() {
  const [loading, setLoading] = React.useState(false);
  const [rows, setRows] = React.useState<InventoryPreviewRowDTO[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run(input: { reason: string | null; lines: InventoryAdjustLineInput[] }) {
    setLoading(true);
    setError(null);

    try {
      const res = await inventoryService.previewAdjustment({ reason: input.reason, lines: input.lines });
      setRows(res.rows);
      return res.rows;
    } catch (e: unknown) {
      setRows(null);
      setError(e instanceof Error ? e.message : "No se pudo previsualizar.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setRows(null);
    setError(null);
  }

  return { loading, rows, error, run, clear };
}
