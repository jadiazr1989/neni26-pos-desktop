// src/modules/inventory/ui/hooks/useInventoryWarehouseStockTable.ts
"use client";

import * as React from "react";
import { inventoryService } from "@/lib/modules/inventory/inventory.service";
import type { WarehouseStockRowDTO, WarehouseStockRowUI } from "@/lib/modules/inventory/inventory.dto";

type State = {
    rows: WarehouseStockRowUI[];
    loading: boolean;
    error: string | null;
    nextCursor: string | null;
};

function mapRow(dto: WarehouseStockRowDTO & { variant?: { sku?: string; title?: string | null; isActive?: boolean } | null }): WarehouseStockRowUI {
    const sku = dto.variant?.sku ?? "—";
    const title = dto.variant?.title ?? null;
    const isActive = dto.variant?.isActive ?? true;

    return {
        variantId: dto.productVariantId,
        sku,
        title,
        qty: Number(dto.quantity ?? 0),
        isActive,
    };
}

function mergeUnique(prev: WarehouseStockRowUI[], next: WarehouseStockRowUI[]): WarehouseStockRowUI[] {
    const m = new Map<string, WarehouseStockRowUI>();
    for (const r of prev) m.set(r.variantId, r);
    for (const r of next) m.set(r.variantId, r);
    return Array.from(m.values());
}
export function useInventoryWarehouseStockTable(params: { pageSize?: number }) {
    const [state, setState] = React.useState<State>({
        rows: [],
        loading: false,
        error: null,
        nextCursor: null,
    });

    const pageSize = params.pageSize ?? 50;

    const loadFirst = React.useCallback(async () => {
        setState({ rows: [], loading: true, error: null, nextCursor: null });
        try {
            const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor: null });

            const uiRows = (res.rows as Array<
                WarehouseStockRowDTO & { variant?: { sku?: string; title?: string | null; isActive?: boolean } | null }
            >).map(mapRow);

            setState({ rows: uiRows, loading: false, error: null, nextCursor: res.nextCursor });
        } catch (e: unknown) {
            setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "No se pudo cargar inventario." }));
        }
    }, [pageSize]);

    const loadMore = React.useCallback(async () => {
        setState((s) => {
            if (s.loading) return s;
            if (!s.nextCursor) return s;
            return { ...s, loading: true, error: null };
        });

        try {
            const cursor = state.nextCursor;
            if (!cursor) return;

            const res = await inventoryService.getMyWarehouseStock({ limit: pageSize, cursor });

            const uiRows = (res.rows as Array<
                WarehouseStockRowDTO & { variant?: { sku?: string; title?: string | null; isActive?: boolean } | null }
            >).map(mapRow);

            setState((s) => ({
                ...s,
                loading: false,
                error: null,
                rows: mergeUnique(s.rows, uiRows),
                nextCursor: res.nextCursor,
            }));
        } catch (e: unknown) {
            setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : "No se pudo cargar más." }));
        }
    }, [pageSize, state.nextCursor]);

    return {
        rows: state.rows,
        loading: state.loading,
        error: state.error,
        hasMore: Boolean(state.nextCursor),
        loadFirst,
        loadMore,
    };
}
