"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

import { useInventoryWarehouseStockTable } from "./hooks/useInventoryWarehouseStockTable";
import { InventoryWarehouseStockTable } from "./ui/components/InventoryWarehouseStockTable";
import type { WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

import { productService } from "@/lib/modules/catalog/products/product.service";
import { isApiHttpError } from "@/lib/api/envelope";
import { notify } from "@/lib/notify/notify";

import { InventoryQuickAdjustDialog } from "./ui/InventoryAdjustDialog";
import { TriStateFilterBar } from "@/components/shared/TriStateFilterBar";
import { useTerminalStore } from "@/stores";

type StockFilter = "all" | "active" | "inactive";

function includesQ(r: WarehouseStockRowUI, q: string) {
  if (!q) return true;
  const hay = `${r.sku ?? ""} ${r.title ?? ""} ${r.productName ?? ""}`.toLowerCase();
  return hay.includes(q);
}

export function InventoryScreen() {
  const table = useInventoryWarehouseStockTable({ pageSize: 50 });

  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<StockFilter>("all");
  const termHydrated = useTerminalStore((s) => s.hydrated);
  const xTerminalId = useTerminalStore((s) => s.xTerminalId);

  React.useEffect(() => {
    if (!termHydrated) return;
    if (!xTerminalId) return;
    void table.loadFirst();
  }, [termHydrated, xTerminalId, table.loadFirst]);

  // ✅ guardar row completo
  const [selectedRow, setSelectedRow] = React.useState<WarehouseStockRowUI | null>(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);

  const counts = React.useMemo(() => {
    const rows = table.rows;
    const active = rows.filter((r) => r.isActive).length;
    const inactive = rows.filter((r) => !r.isActive).length;
    return { all: rows.length, active, inactive };
  }, [table.rows]);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return table.rows
      .filter((r) => (filter === "active" ? r.isActive : filter === "inactive" ? !r.isActive : true))
      .filter((r) => includesQ(r, q));
  }, [table.rows, search, filter]);

  // ✅ abrir con row completo
  function openAdjust(row: WarehouseStockRowUI) {
    if (!row?.variantId) {
      notify.error({
        title: "Fila inválida",
        description: "La fila no tiene variantId. Revisa el mapper del warehouse stock.",
      });
      return;
    }
    setSelectedRow(row);
    setAdjustOpen(true);
  }

  async function refresh() {
    await table.loadFirst();
  }

  /**
   * ✅ Resolver por código y abrir:
   * 1) resuelve a una variante (id)
   * 2) busca ese id dentro de la tabla actual del warehouse
   * 3) si no está, avisa (no es inventario de este warehouse)
   */
  async function onResolveAndOpen(code: string) {
    const q = code.trim();
    if (!q) return;

    try {
      const v = await productService.resolve(q);

      const row = table.rows.find((r) => r.variantId === v.id) ?? null;

      if (!row) {
        notify.warning({
          title: "No está en este almacén",
          description: "La variante existe, pero no aparece en el inventario de este warehouse.",
        });
        return;
      }

      setSelectedRow(row);
      setAdjustOpen(true);
    } catch (e: unknown) {
      const msg = isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "No se pudo resolver el código.";
      notify.error({ title: "No encontrado", description: msg });
    }
  }

  const selectedVariantId = selectedRow?.variantId ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            Controla existencias por almacén, registra movimientos, ajusta stock y supervisa niveles mínimos.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void table.loadFirst()} disabled={table.loading}>
            <RefreshCw className="mr-2 size-4" />
            Refrescar
          </Button>

        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-3">
          <TriStateFilterBar
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => void onResolveAndOpen(search)} // Enter o botón Buscar
            placeholder="Buscar por SKU / barcode / título… (Enter para abrir)"
            searchButtonText="Buscar"
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            busy={table.loading}

          />

          {table.error ? <div className="text-sm text-destructive">{table.error}</div> : null}

          <InventoryWarehouseStockTable
            rows={filteredRows}
            loading={table.loading}
            hasMore={filter === "all" && !search.trim() ? table.hasMore : false}
            loadMore={filter === "all" && !search.trim() ? table.loadMore : () => { }}
            onPickRow={openAdjust}
            height={560}
            selectedVariantId={selectedVariantId}
          />
        </CardContent>
      </Card>

      <InventoryQuickAdjustDialog
        open={adjustOpen}
        onOpenChange={(v) => {
          setAdjustOpen(v);
          if (!v) setSelectedRow(null);
        }}
        onApplied={refresh}
        row={selectedRow}
      />
    </div>
  );
}
