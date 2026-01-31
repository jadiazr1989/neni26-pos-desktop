"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "./types";

import { useFavorites } from "@/stores/favorites.store";
import { usePosWorkspaceUi } from "@/stores/posWorkspaceUi.store";
import { useTicket } from "./hooks/useTicket";
import { CategoryNav } from "./ui/CategoryNav";
import { ProductDetailModal } from "./ui/ProductDetailModal";
import { ProductGrid } from "./ui/ProductGrid";
import { QuantityModal } from "./ui/QuantityModal";
import { TicketListPanel } from "./ui/TicketListPanel";
import { usePosCategories } from "./hooks/usePosCategories";

import { usePosCatalog } from "./hooks/usePosCatalog";
import { posCatalogPort } from "./hooks/posCatalog.port";
import type { PosCatalogRowDTO } from "@/lib/modules/catalog/products/product.dto";

function resolveCategoryLabel(categories: { id: string; name: string }[], id: string): string {
  if (id === "favorites") return "Favoritos";
  if (id === "all") return "Todas";
  return categories.find((c) => c.id === id)?.name ?? "Todas";
}

function mapRowToProduct(r: PosCatalogRowDTO): Product {
  const soldBy: Product["soldBy"] = r.unit === "UNIT" ? "UNIT" : "MEASURE";
  const unit: Product["unit"] = r.unit === "UNIT" ? "unit" : r.unit.toLowerCase();

  return {
    id: r.variantId,
    name: r.title ? `${r.productName} - ${r.title}` : r.productName,
    categoryId: r.categoryId,
    soldBy,
    unit,
    pricePerUnit: Number(r.priceBaseMinor ?? 0) / 100,
    imageUrl: r.imageUrl,
    optionGroups: [],
  };
}

export function SaleWorkspaceScreen() {
  // =========================
  // Favorites: hydrate + rev
  // =========================
  const favHydrated = useFavorites((s) => s.hydrated);
  const favHydrate = useFavorites((s) => s.hydrate);
  const favRev = useFavorites((s) => s.rev);
  const favCount = useFavorites((s) => Object.keys(s.ids).length);

  useEffect(() => {
    if (favHydrated) return;
    void favHydrate();
  }, [favHydrated, favHydrate]);

  // =========================
  // Categories
  // =========================
  const {
    rows: categories,
    loading: categoriesLoading,
    hasMore: categoriesHasMore,
    loadFirst: loadCategoriesFirst,
    loadMore: loadCategoriesMore,
  } = usePosCategories({ pageSize: 8, inStock: true });

  useEffect(() => {
    loadCategoriesFirst();
  }, [loadCategoriesFirst]);

  // =========================
  // Ticket & modals
  // =========================
  const [editLineId, setEditLineId] = useState<string | null>(null);
  const { items, totals, addItem, updateItem } = useTicket();

  const [measureProduct, setMeasureProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // =========================
  // UI state (category/query)
  // =========================
  const uiSetCategory = usePosWorkspaceUi((s) => s.setCategory);
  const uiSetQuery = usePosWorkspaceUi((s) => s.setQuery);

  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const label = resolveCategoryLabel(categories, categoryId);
    uiSetCategory({ id: categoryId, label });
  }, [categoryId, categories, uiSetCategory]);

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

  // =========================
  // Catalog
  // =========================
  const isFavorites = categoryId === "favorites";

  const catalogHook = usePosCatalog(posCatalogPort, {
    categoryId: isFavorites ? "all" : categoryId,
    q: query,
    pageSize: 24,
    inStock: true,
  });

  const { rows, hasMore, loading, loadMore } = catalogHook;

  const showFavoritesLoading = isFavorites && !favHydrated;

  const catalog = useMemo<Product[]>(() => {
    // ✅ trigger explícito para recalcular al cambiar favoritos (lint-friendly)
    void favRev;

    const mapped = rows.map(mapRowToProduct);
    if (!isFavorites) return mapped;

    // ✅ snapshot actual (no dependemos de referencias del objeto ids)
    const ids = useFavorites.getState().ids;
    return mapped.filter((p) => Boolean(ids[p.id]));
  }, [rows, isFavorites, favRev]);

  // Infinite scroll (desactivado para favoritos)
  const onCatalogScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isFavorites) return;
      const el = e.currentTarget;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 240;
      if (!nearBottom) return;
      if (!hasMore) return;
      if (loading) return;
      loadMore();
    },
    [isFavorites, hasMore, loading, loadMore]
  );

  // =========================
  // Pick & edit flows
  // =========================
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

  const onEditTicketLine = useCallback(
    (lineId: string) => {
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

      setMeasureProduct(product);
    },
    [items, catalog]
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div className="grid h-full min-h-0 overflow-hidden gap-0" style={{ gridTemplateColumns: "260px 1fr 400px" }}>
        {/* LEFT */}
        <aside className="min-h-0 overflow-hidden border-r border-border">
          <CategoryNav
            className="h-full min-h-0"
            items={categories.map((c) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }))}
            activeId={categoryId}
            onSelect={setCategoryId}
            favoritesId="favorites"
            favoritesLabel={`Favoritos (${favCount - 1})`}
            allId="all"
            allLabel="Todas"
            showAll
            loading={categoriesLoading}
            hasMore={categoriesHasMore}
            onEndReached={categoriesHasMore ? loadCategoriesMore : undefined}
          />
        </aside>

        {/* CENTER */}
        <section className="min-h-0 overflow-hidden flex flex-col border-r border-border">
          <div className="shrink-0 bg-background p-3">
            <div className="flex items-center gap-2">
              <input
                id="pos-search"
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Buscar producto (nombre / código)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="text-xs text-muted-foreground whitespace-nowrap">F2</div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 pt-0" onScroll={onCatalogScroll}>
            {showFavoritesLoading ? (
              <div className="text-sm text-muted-foreground p-2">Cargando favoritos…</div>
            ) : (
              <ProductGrid products={catalog} onPick={onPickProduct} />
            )}
          </div>
        </section>

        {/* RIGHT */}
        <aside className="min-h-0 overflow-hidden">
          <TicketListPanel
            className="h-full min-h-0 rounded-none border-0"
            items={items}
            totals={totals}
            onEdit={onEditTicketLine}
          />
        </aside>
      </div>

      {/* Quantity */}
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
            const line = items.find((x) => x.id === editLineId);
            if (!line) return;
            updateItem(editLineId, qty, line.optionsSnapshot);
          } else {
            addItem(measureProduct, qty, []);
          }

          setMeasureProduct(null);
          setEditLineId(null);
        }}
      />

      {/* Detail / options */}
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

          if (editLineId) updateItem(editLineId, payload.qty, payload.optionsSnapshot);
          else addItem(detailProduct, payload.qty, payload.optionsSnapshot);

          setDetailProduct(null);
          setEditLineId(null);
        }}
      />
    </div>
  );
}
