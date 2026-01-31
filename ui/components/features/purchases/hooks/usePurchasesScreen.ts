"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify/notify";
import type { PurchaseDTO } from "@/lib/modules/purchases/purchase.dto";
import { purchaseService } from "@/lib/modules/purchases/purchase.service";
import type { ListPurchasesQuery, CreatePurchaseInput } from "@/lib/modules/purchases/purchase.dto";
import {
  DEFAULT_PURCHASE_FILTERS,
  type PurchaseFilters,
  type PurchaseStatusFilter,
  type DatePreset,
  computeDateRange,
} from "./purchase.filters";

type Vm = {
  rows: PurchaseDTO[];
  loading: boolean;
  error: string | null;

  filters: PurchaseFilters;
  setSearch: (v: string) => void;
  setStatus: (v: PurchaseStatusFilter) => void;
  setDatePreset: (v: DatePreset) => void;
  setRangeFrom: (v: string) => void;
  setRangeTo: (v: string) => void;
  clearFilters: () => void;

  refresh: () => Promise<void>;
  createAndOpen: () => Promise<void>;
  onOpen: (p: PurchaseDTO) => void;
};

function asErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Error desconocido";
}

export function usePurchasesScreen(): Vm {
  const router = useRouter();

  const [rows, setRows] = React.useState<PurchaseDTO[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [filters, setFilters] = React.useState<PurchaseFilters>(DEFAULT_PURCHASE_FILTERS);

  // ✅ draft del input (solo UI)
  const [searchDraft, setSearchDraft] = React.useState<string>(DEFAULT_PURCHASE_FILTERS.search);

  // ✅ SIEMPRE sincroniza draft cuando filters.search cambie (clear/reset/prefill)
  React.useEffect(() => {
    setSearchDraft(filters.search);
  }, [filters.search]);

  // ✅ debounce: aplica draft → filters.search
  React.useEffect(() => {
    const t = setTimeout(() => {
      setFilters((s) => (s.search === searchDraft ? s : { ...s, search: searchDraft }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  const setSearch = React.useCallback((v: string) => {
    setSearchDraft(v);
  }, []);

  const setStatus = React.useCallback((v: PurchaseStatusFilter) => {
    setFilters((s) => ({ ...s, status: v }));
  }, []);

  const setDatePreset = React.useCallback((v: DatePreset) => {
    setFilters((s) => {
      if (v !== "RANGE") {
        // ✅ al cambiar a preset, limpia range
        return { ...s, datePreset: v, from: null, to: null };
      }
      // ✅ RANGE: no toques from/to aquí (los pone el usuario)
      return { ...s, datePreset: "RANGE" };
    });
  }, []);

  const setRangeFrom = React.useCallback((v: string) => {
    setFilters((s) => ({ ...s, datePreset: "RANGE", from: v || null }));
  }, []);

  const setRangeTo = React.useCallback((v: string) => {
    setFilters((s) => ({ ...s, datePreset: "RANGE", to: v || null }));
  }, []);

  const clearFilters = React.useCallback(() => {
    // ✅ resetea ambos: draft + filtros
    setSearchDraft(DEFAULT_PURCHASE_FILTERS.search);
    setFilters(DEFAULT_PURCHASE_FILTERS);
  }, []);

  const buildListQuery = React.useCallback((f: PurchaseFilters): ListPurchasesQuery => {
    const q: ListPurchasesQuery = {};

    const s = f.search.trim();
    if (s) q.search = s;

    if (f.status !== "ALL") q.status = f.status;

    if (f.datePreset === "RANGE") {
      if (f.from) q.from = f.from;
      if (f.to) q.to = f.to;
    } else {
      const r = computeDateRange(f.datePreset);
      q.from = r.from;
      q.to = r.to;
    }

    return q;
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const q = buildListQuery(filters);
      const purchases = await purchaseService.list(q);
      setRows(purchases);
    } catch (e: unknown) {
      const msg = asErrorMessage(e);
      setError(msg);
      notify.error({ title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }, [buildListQuery, filters]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const onOpen = React.useCallback((p: PurchaseDTO) => router.push(`/admin/purchases/${p.id}`), [router]);

  const createAndOpen = React.useCallback(async () => {
    setLoading(true);
    try {
      const input: CreatePurchaseInput = { notes: null };
      const res = await purchaseService.create(input);
      notify.success({ title: "Compra creada", description: "Se creó en estado Borrador." });
      router.push(`/admin/purchases/${res.purchaseId}`);
    } catch (e: unknown) {
      notify.error({ title: "No se pudo crear", description: asErrorMessage(e) });
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    rows,
    loading,
    error,

    filters,
    setSearch,
    setStatus,
    setDatePreset,
    setRangeFrom,
    setRangeTo,
    clearFilters,

    refresh,
    createAndOpen,
    onOpen,
  };
}
