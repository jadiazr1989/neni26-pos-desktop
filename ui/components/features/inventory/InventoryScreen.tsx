// src/modules/inventory/ui/InventoryScreen.tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InventoryAdjustDialog } from "./ui/InventoryAdjustDialog";
import { useInventoryWarehouseStockTable } from "./hooks/useInventoryWarehouseStockTable";
import { InventoryWarehouseStockTable } from "./ui/components/InventoryWarehouseStockTable";

export function InventoryScreen() {

  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(null);
  const table = useInventoryWarehouseStockTable({ pageSize: 50 });

  React.useEffect(() => {
    void table.loadFirst();
  }, [table.loadFirst]);

  function openAdjust(variantId: string) {
    setSelectedVariantId(variantId);
    setAdjustOpen(true);
  }


  async function refresh() {
    await table.loadFirst();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inventario</CardTitle>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void table.loadFirst()} disabled={table.loading}>
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3">
          

          {table.error ? <div className="text-sm text-destructive">{table.error}</div> : null}

          <InventoryWarehouseStockTable
            rows={table.rows}
            loading={table.loading}
            hasMore={table.hasMore}
            loadMore={table.loadMore}
            onPickVariant={openAdjust}
            height={560}
          />
        </CardContent>
      </Card>

      <InventoryAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        onApplied={refresh}
        initialVariantId={selectedVariantId}
      />
    </div>
  );
}
