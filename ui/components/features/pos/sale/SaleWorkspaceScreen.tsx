"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import type { Product } from "./types";

import { CategoryNav } from "./ui/CategoryNav";
import { ProductGrid } from "./ui/ProductGrid";
import { QuantityModal } from "./ui/QuantityModal";
import { ProductDetailModal } from "./ui/ProductDetailModal";
import { useTicket } from "./hooks/useTicket";
import { TicketListPanel } from "./ui/TicketListPanel";
import { usePosWorkspaceUi } from "@/stores/posWorkspaceUi.store";
import { useFavorites } from "@/stores/favorites.store";

// dentro de SaleWorkspaceScreen (arriba)

function resolveCategoryLabel(
  categories: { id: string; name: string }[],
  id: string
): string {
  if (id === "favorites") return "Favoritos";
  if (id === "all") return "Todas";
  return categories.find((c) => c.id === id)?.name ?? "Todas";
}


export function SaleWorkspaceScreen() {

  const favIds = useFavorites((s) => s.ids);

  // TODO luego: mover esto a hook/useCatalog para datos reales
  const catalog = useMemo<Product[]>(
    () => [
      {
        id: "rice-1",
        name: "Arroz Jazmín",
        soldBy: "MEASURE",
        unit: "lb",
        pricePerUnit: 2.99,
        categoryId: "cat-rice",
      },
      {
        id: "care-9",
        name: "Shampoo Suave",
        soldBy: "UNIT",
        unit: "unit",
        pricePerUnit: 5.0,
        categoryId: "cat-care",
      },
      {
        id: "perf-1",
        name: "Perfume Demo (con variantes)",
        soldBy: "UNIT",
        unit: "unit",
        pricePerUnit: 50,
        categoryId: "cat-perf",
        optionGroups: [
          {
            id: "g-size",
            name: "Tamaño",
            display: "radio",
            min: 1,
            max: 1,
            options: [
              { id: "o-50", name: "50ml", priceDelta: 0 },
              { id: "o-100", name: "100ml", priceDelta: 10 },
            ],
          },
        ],
      },
    ],
    []
  );


  const categories = useMemo(
    () => [
      { id: "all", name: "Todas" },
      { id: "cat-rice", name: "Arroz" },
      { id: "cat-perf", name: "Perfumes" },
      { id: "cat-cerv", name: "Cervezas" },
      { id: "cat-zasin", name: "Sazon" },
      { id: "cat-care", name: "Cuidado Personal" },
      { id: "cat-drink", name: "Bebidas" },
      { id: "cat-fast", name: "Comida Rápida" },
    ],
    []
  );

  const [editLineId, setEditLineId] = useState<string | null>(null);

  const { items, totals, addItem, updateItem } = useTicket();

  const [measureProduct, setMeasureProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const uiSetCategory = usePosWorkspaceUi((s) => s.setCategory);
  const uiSetQuery = usePosWorkspaceUi((s) => s.setQuery);

  // categoryId local
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");

  // ✅ cuando cambie categoryId => store
  useEffect(() => {
    const label = resolveCategoryLabel(categories, categoryId);
    uiSetCategory({ id: categoryId, label });
  }, [categoryId, categories, uiSetCategory]);

  // ✅ cuando cambie query => store
  useEffect(() => {
    uiSetQuery(query);
  }, [query, uiSetQuery]);

  // F2 focus search
  useEffect(() => {
    const handler = () => {
      const el = document.getElementById("pos-search") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    };
    window.addEventListener("pos:focusSearch", handler as EventListener);
    return () => window.removeEventListener("pos:focusSearch", handler as EventListener);
  }, []);



  const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();

  return catalog.filter((p) => {
    const passCategory =
      categoryId === "all"
        ? true
        : categoryId === "favorites"
          ? Boolean(favIds[p.id])   // ⭐ store manda
          : p.categoryId === categoryId;

    if (!passCategory) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q);
  });
}, [catalog, categoryId, query, favIds]);



  const onPickProduct = useCallback(
    (p: Product) => {
      const hasOptions = (p.optionGroups?.length ?? 0) > 0;
      if (hasOptions) {
        setDetailProduct(p);
        return;
      }
      if (p.soldBy === "MEASURE") {
        setMeasureProduct(p);
        return;
      }
      addItem(p, 1, []);
    },
    [addItem]
  );

  const onEditTicketLine = useCallback((lineId: string) => {
    setEditLineId(lineId);

    const line = items.find((x) => x.id === lineId);
    if (!line) return;

    const product = catalog.find((p) => p.id === line.productId);
    if (!product) return;

    const hasOptions = (product.optionGroups?.length ?? 0) > 0;

    if (hasOptions) {
      setDetailProduct(product);
      return;
    }

    // si no tiene options: usamos QuantityModal (UNIT o MEASURE)
    setMeasureProduct(product);
  }, [items, catalog]);


  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div
        className="grid h-full min-h-0 overflow-hidden gap-0"
        style={{ gridTemplateColumns: "260px 1fr 400px" }}
      >
        {/* LEFT (fijo) */}
        <aside className="min-h-0 overflow-hidden border-r border-border">
          {/* CategoryNav debe ser h-full y manejar su scroll interno */}
          <CategoryNav
            items={categories}         // tus categorías normales
            activeId={categoryId}
            onSelect={setCategoryId}
            favoritesId="favorites"
            favoritesLabel="Favoritos"
            className="h-full min-h-0"
          />

        </aside>

        {/* CENTER (header fijo + grid scrolleable) */}
        <section className="min-h-0 overflow-hidden flex flex-col border-r border-border">
          {/* Header fijo */}
          <div className="shrink-0 bg-background p-3">
            <div className="flex items-center gap-2">
              <input
                id="pos-search"
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Buscar producto (nombre / código)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="text-xs text-muted-foreground whitespace-nowrap">F2</div>
            </div>
          </div>

          {/* Grid scrolleable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 pt-0">
            <ProductGrid products={filtered} onPick={onPickProduct} />
          </div>
        </section>

        {/* RIGHT (fijo; el ticket hace scroll interno y footer fijo) */}
        {/* RIGHT (fijo; lista del ticket) */}
        <aside className="min-h-0 overflow-hidden">
          <TicketListPanel
            className="h-full min-h-0 rounded-none border-0"
            items={items}
            totals={totals}
            onEdit={onEditTicketLine}
          />

        </aside>

      </div>

      {/* Overlay A: cantidad para MEASURE */}
      <QuantityModal
        key={
          measureProduct
            ? editLineId
              ? `qty:edit:${editLineId}`
              : `qty:add:${measureProduct.id}`
            : "qty:closed"
        }
        open={Boolean(measureProduct)}
        product={measureProduct}
        title={editLineId ? "Editar cantidad" : "Cantidad"}
        initialQty={(() => {
          if (!editLineId) return 1;
          const line = items.find((x) => x.id === editLineId);
          return line?.qty ?? 1;
        })()}
        onClose={() => {
          setMeasureProduct(null);
          setEditLineId(null);
        }}
        onConfirm={(qty) => {
          if (!measureProduct) return;

          if (editLineId) {
            // ✅ EDIT
            const line = items.find((x) => x.id === editLineId);
            if (!line) return;
            updateItem(editLineId, qty, line.optionsSnapshot); // mantiene options
          } else {
            // ✅ ADD
            addItem(measureProduct, qty, []);
          }

          setMeasureProduct(null);
          setEditLineId(null);
        }}
      />


      {/* Overlay B: detalle/variantes */}
      <ProductDetailModal
        key={
          detailProduct
            ? editLineId
              ? `detail:edit:${editLineId}`
              : `detail:add:${detailProduct.id}`
            : "detail:closed"
        }
        open={Boolean(detailProduct)}
        product={detailProduct}
        initialQty={(() => {
          if (!editLineId) return 1;
          const line = items.find((x) => x.id === editLineId);
          return line?.qty ?? 1;
        })()}
        initialOptionsSnapshot={(() => {
          if (!editLineId) return [];
          const line = items.find((x) => x.id === editLineId);
          return line?.optionsSnapshot ?? [];
        })()}
        onClose={() => {
          setDetailProduct(null);
          setEditLineId(null);
        }}
        onConfirm={(payload) => {
          if (!detailProduct) return;

          if (editLineId) {
            // ✅ EDIT: qty + options
            updateItem(editLineId, payload.qty, payload.optionsSnapshot);
          } else {
            // ✅ ADD
            addItem(detailProduct, payload.qty, payload.optionsSnapshot);
          }

          setDetailProduct(null);
          setEditLineId(null);
        }}
      />

    </div>
  );
}
