"use client";

import { useCallback, useEffect, useMemo, useState, type UIEvent } from "react";

import { usePosWorkspaceUi } from "@/stores/posWorkspaceUi.store";
import { usePosCatalogUi } from "@/stores/posCatalogUi.store";
import { useFavorites } from "@/stores/favorites.store";

import { useTicket } from "../hooks/useTicket";
import { usePosCategories } from "../hooks/usePosCategories";
import { usePosCatalog } from "../hooks/usePosCatalog";
import { posCatalogPort } from "../hooks/posCatalog.port";

import type { Product, Category, DetailConfirmPayload } from "../types";
import type { PosCatalogRowDTO } from "@/lib/modules/catalog/products/product.dto";

import { fromBaseMinorToPricingQty, type Unit, type SellUnit } from "@/lib/quantity/sellUnit";
import { usePosSaleStore } from "@/stores/posSale.store";
import { SaleLine, TicketTotals } from "@/stores/helpers/posSale.store.types";


export type SaleWorkspaceVM = {
  // data
  categories: Category[];
  categoriesLoading: boolean;
  categoriesHasMore: boolean;
  loadCategoriesMore?: () => void;

  catalog: Product[];
  items: SaleLine[];
  totals: TicketTotals;

  // ui state
  categoryId: string;
  query: string;

  setCategoryId: (id: string) => void;
  setQuery: (q: string) => void;

  onCatalogScroll: (e: UIEvent<HTMLDivElement>) => void;
  onPickProduct: (p: Product) => void;
  onEditTicketLine: (lineId: string) => void;

  // modals
  editLineId: string | null;
  measureProduct: Product | null;
  detailProduct: Product | null;

  closeQty: () => void;
  confirmQty: (qty: number) => void;

  closeDetail: () => void;
  confirmDetail: (payload: DetailConfirmPayload) => void;

  activeLineId?: string | null;
};

const FAVORITES_ID = "favorites";

function resolveCategoryLabel(categories: { id: string; name: string }[], id: string): string {
  if (id === "all") return "Todas";
  if (id === FAVORITES_ID) return "Favoritos";
  return categories.find((c) => c.id === id)?.name ?? "Todas";
}

function mapRowToProduct(r: PosCatalogRowDTO): Product {
  const soldBy: Product["soldBy"] = r.baseUnit === "UNIT" ? "UNIT" : "MEASURE";

  const availableHuman = fromBaseMinorToPricingQty({
    baseMinor: Number(r.availableQty ?? 0),
    pricingUnit: r.pricingUnit,
    baseUnit: r.baseUnit,
  });

  return {
    id: r.variantId,
    variantId: r.variantId,
    productId: r.productId,
    categoryId: r.categoryId,
    name: r.title ? `${r.productName} - ${r.title}` : r.productName,

    baseUnit: r.baseUnit,
    pricingUnit: r.pricingUnit,

    soldBy,
    pricePerUnitMinor: Number(r.priceBaseMinor ?? 0),
    imageUrl: r.imageUrl,
    optionGroups: [],

    availableQty: Number.isFinite(availableHuman) ? availableHuman : 0,
  };
}

// fallback si el producto no está en el catálogo filtrado
function fallbackUnitsFromLine(line: Pick<SaleLine, "soldBy"> & { unitInput?: SellUnit | null }): {
  baseUnit: Unit;
  pricingUnit: SellUnit;
} {
  if (line.soldBy === "UNIT") return { baseUnit: "UNIT", pricingUnit: "UNIT" };

  // Si la línea es MEASURE y no sabemos el unitInput, elige LB por default
  // (solo para que el modal sea consistente; no afecta el backend si luego resuelves por variant)
  return { baseUnit: "G", pricingUnit: (line.unitInput ?? "LB") as SellUnit };
}

export function useSaleWorkspaceController(): SaleWorkspaceVM {
  // ========= UI state (category/query) =========
  const uiSetCategory = usePosWorkspaceUi((s) => s.setCategory);
  const uiSetQuery = usePosWorkspaceUi((s) => s.setQuery);
  const catalogRev = usePosCatalogUi((s) => s.rev);
  const activeLineId = usePosSaleStore((s) => s.lastTouchedLineId);

  // ========= Favorites (subscribe) =========
  // Guardas favoritos por variantId (en tu ProductCard pasas p.id que es variantId)
  const favIds = useFavorites((s) => s.ids);
  const favHydrated = useFavorites((s) => s.hydrated);

  const favWantedCount = useMemo(() => Object.keys(favIds).length, [favIds]);

  // ========= Categories =========
  const {
    rows: categoriesRows,
    loading: categoriesLoading,
    hasMore: categoriesHasMore,
    loadFirst: loadCategoriesFirst,
    loadMore: loadCategoriesMore,
  } = usePosCategories({
    pageSize: 8,
    inStock: true,
    rev: catalogRev,
  });

  const categories = useMemo<Category[]>(
    () => categoriesRows.map((c) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl })),
    [categoriesRows]
  );

  useEffect(() => {
    loadCategoriesFirst();
  }, [loadCategoriesFirst]);

  // ========= Ticket + modals =========
  const [editLineId, setEditLineId] = useState<string | null>(null);
  const { items, totals, addItem, updateItem } = useTicket();

  const [measureProduct, setMeasureProduct] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [categoryId, setCategoryId] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    uiSetCategory({ id: categoryId, label: resolveCategoryLabel(categories, categoryId) });
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

  // ========= Catalog =========
  // ✅ si estás en "favorites", NO mandes "favorites" al backend
  const effectiveCategoryId = categoryId === FAVORITES_ID ? "all" : categoryId;

  const {
    rows: baseRows,
    hasMore: baseHasMore,
    loading: baseLoading,
    loadMore: baseLoadMore,
    loadFirst: baseLoadFirst,
  } = usePosCatalog(posCatalogPort, {
    categoryId: effectiveCategoryId,
    q: query,
    pageSize: 24,
    inStock: true,
    rev: catalogRev,
  });

  // cuántos favoritos ya aparecen en lo cargado
  const favFoundCount = useMemo(() => {
    if (favWantedCount === 0) return 0;
    let n = 0;
    for (const r of baseRows) if (favIds[r.variantId]) n++;
    return n;
  }, [baseRows, favIds, favWantedCount]);

  // ✅ Al entrar a Favoritos: re-cargar desde primera página (para cubrir cambios de filtro/query)
  useEffect(() => {
    if (categoryId !== FAVORITES_ID) return;
    if (!favHydrated) return;
    void baseLoadFirst();
  }, [categoryId, favHydrated, baseLoadFirst]);

  // ✅ Auto-paginación en Favoritos hasta encontrar todos los favoritos (si hay más páginas)
  useEffect(() => {
    if (categoryId !== FAVORITES_ID) return;
    if (!favHydrated) return;
    if (favWantedCount === 0) return;

    if (favFoundCount >= favWantedCount) return; // ya están todos
    if (!baseHasMore) return;
    if (baseLoading) return;

    baseLoadMore();
  }, [
    categoryId,
    favHydrated,
    favWantedCount,
    favFoundCount,
    baseHasMore,
    baseLoading,
    baseLoadMore,
  ]);

  // rows visibles (filtra local si estás en favoritos)
  const visibleRows = useMemo(() => {
    if (categoryId !== FAVORITES_ID) return baseRows;
    if (!favHydrated) return [];
    if (favWantedCount === 0) return [];
    return baseRows.filter((r) => Boolean(favIds[r.variantId]));
  }, [categoryId, baseRows, favIds, favHydrated, favWantedCount]);

  const catalog = useMemo<Product[]>(() => visibleRows.map(mapRowToProduct), [visibleRows]);

  // ✅ En favoritos, no uses el scroll para paginar manual (la paginación es automática)
  const hasMore = categoryId === FAVORITES_ID ? false : baseHasMore;
  const loading = baseLoading;
  const loadMore = baseLoadMore;

  const onCatalogScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 240;
      if (!nearBottom) return;
      if (!hasMore) return;
      if (loading) return;
      loadMore();
    },
    [hasMore, loading, loadMore]
  );

  // ========= Pick & edit =========
  const onPickProduct = useCallback((p: Product) => {
    const hasOptions = (p.optionGroups?.length ?? 0) > 0;

    if (hasOptions) {
      setDetailProduct(p);
      return;
    }

    setMeasureProduct(p);
  }, []);

  const onEditTicketLine = useCallback(
    (lineId: string) => {
      setEditLineId(lineId);

      const line = items.find((x) => x.id === lineId);
      if (!line) return;

      const product = catalog.find((p) => p.variantId === line.variantId);

      if (!product) {
        const u = fallbackUnitsFromLine({
          soldBy: line.soldBy,
          unitInput: (line as unknown as { unitInput?: SellUnit | null }).unitInput ?? null,
        });

        const fallback: Product = {
          id: line.variantId,
          variantId: line.variantId,
          productId: line.productId,
          categoryId: "all",
          name: line.nameSnapshot,

          soldBy: line.soldBy,
          baseUnit: u.baseUnit,
          pricingUnit: u.pricingUnit,

          pricePerUnitMinor: line.pricePerUnitMinor,
          imageUrl: null,
          optionGroups: [],
          availableQty: 0,
        };

        setMeasureProduct(fallback);
        return;
      }

      const hasOptions = (product.optionGroups?.length ?? 0) > 0;
      if (hasOptions) {
        setDetailProduct(product);
        return;
      }

      setMeasureProduct(product);
    },
    [items, catalog]
  );

  // ========= Modal handlers =========
  const closeQty = useCallback(() => {
    setMeasureProduct(null);
    setEditLineId(null);
  }, []);

  const confirmQty = useCallback(
    (qty: number) => {
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
    },
    [measureProduct, editLineId, items, addItem, updateItem]
  );

  const closeDetail = useCallback(() => {
    setDetailProduct(null);
    setEditLineId(null);
  }, []);

  const confirmDetail = useCallback(
    (payload: DetailConfirmPayload) => {
      if (!detailProduct) return;

      if (editLineId) updateItem(editLineId, payload.qty, payload.optionsSnapshot);
      else addItem(detailProduct, payload.qty, payload.optionsSnapshot);

      setDetailProduct(null);
      setEditLineId(null);
    },
    [detailProduct, editLineId, addItem, updateItem]
  );

  return {
    categories,
    categoriesLoading,
    categoriesHasMore,
    loadCategoriesMore: categoriesHasMore ? loadCategoriesMore : undefined,

    catalog,
    items,
    totals,

    categoryId,
    query,
    setCategoryId,
    setQuery,

    onCatalogScroll,
    onPickProduct,
    onEditTicketLine,

    editLineId,
    measureProduct,
    detailProduct,

    closeQty,
    confirmQty,

    closeDetail,
    confirmDetail,

    activeLineId,
  };
}
