"use client";

import type { JSX, UIEvent } from "react";

import { CategoryNav } from "../ui/CategoryNav";
import { ProductGrid } from "../ui/ProductGrid";
import { QuantityModal } from "../ui/QuantityModal";
import { TicketListPanel } from "../ui/TicketListPanel";
import { ProductDetailModal } from "./modal/productDetail/ProductDetailModal";

import type { Category, DetailConfirmPayload, Product } from "../types";
import { TicketAdjustmentsDialog } from "./modal/ticketModalAdjustment/TicketAdjustmentsDialog";
import type { SaleLine, TicketTotals } from "@/stores/helpers/posSale.store.types";

type Props = {
  categories: Category[];
  categoriesLoading: boolean;
  categoriesHasMore: boolean;
  loadCategoriesMore?: () => void;

  catalog: Product[];
  items: SaleLine[];
  totals: TicketTotals;

  categoryId: string;
  query: string;

  setCategoryId: (id: string) => void;
  setQuery: (q: string) => void;

  onCatalogScroll: (e: UIEvent<HTMLDivElement>) => void;
  onPickProduct: (p: Product) => void;
  onEditTicketLine: (lineId: string) => void;

  editLineId: string | null;
  measureProduct: Product | null;
  detailProduct: Product | null;

  closeQty: () => void;
  confirmQty: (qty: number) => void;

  closeDetail: () => void;
  confirmDetail: (payload: DetailConfirmPayload) => void;

  // ✅ REQUIRED
  activeLineId?: string | null;
};

export function SaleWorkspaceView(props: Props): JSX.Element {
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div
        className="grid h-full min-h-0 overflow-hidden gap-0"
        style={{ gridTemplateColumns: "260px 1fr 400px" }}
      >
        {/* LEFT */}
        <aside className="min-h-0 overflow-hidden border-r border-border">
          <CategoryNav
            className="h-full min-h-0"
            items={props.categories.map((c) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl ?? null }))}
            activeId={props.categoryId}
            onSelect={props.setCategoryId}
            allId="all"
            allLabel="Todas"
            showAll
            loading={props.categoriesLoading}
            hasMore={props.categoriesHasMore}
            onEndReached={props.categoriesHasMore ? props.loadCategoriesMore : undefined}
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
                value={props.query}
                onChange={(e) => props.setQuery(e.target.value)}
              />
              <div className="text-xs text-muted-foreground whitespace-nowrap">F2</div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 pt-0" onScroll={props.onCatalogScroll}>
            <ProductGrid products={props.catalog} onPick={props.onPickProduct} />
          </div>
        </section>

        {/* RIGHT */}
        <aside className="min-h-0 overflow-hidden">
          <TicketListPanel
            className="h-full min-h-0 rounded-none border-0"
            items={props.items}
            totals={props.totals}
            onEdit={props.onEditTicketLine}
            activeLineId={props.activeLineId ?? null} // ✅ REQUIRED
            showTaxAndDiscount={false}
          />
        </aside>
      </div>

      {/* Quantity */}
      <QuantityModal
        key={
          props.measureProduct
            ? props.editLineId
              ? `qty:edit:${props.editLineId}`
              : `qty:add:${props.measureProduct.id}`
            : "qty:closed"
        }
        open={Boolean(props.measureProduct)}
        product={props.measureProduct}
        title={props.editLineId ? "Editar cantidad" : "Cantidad"}
        initialQty={(() => {
          if (!props.editLineId) return 1;
          const line = props.items.find((x) => x.id === props.editLineId);
          return line?.qty ?? 1;
        })()}
        onClose={props.closeQty}
        onConfirm={props.confirmQty}
      />

      {/* Detail / options */}
      <ProductDetailModal
        key={
          props.detailProduct
            ? props.editLineId
              ? `detail:edit:${props.editLineId}`
              : `detail:add:${props.detailProduct.id}`
            : "detail:closed"
        }
        open={Boolean(props.detailProduct)}
        product={props.detailProduct}
        initialQty={(() => {
          if (!props.editLineId) return 1;
          const line = props.items.find((x) => x.id === props.editLineId);
          return line?.qty ?? 1;
        })()}
        initialOptionsSnapshot={(() => {
          if (!props.editLineId) return [];
          const line = props.items.find((x) => x.id === props.editLineId);
          return line?.optionsSnapshot ?? [];
        })()}
        onClose={props.closeDetail}
        onConfirm={props.confirmDetail}
      />

      <TicketAdjustmentsDialog />
    </div>
  );
}