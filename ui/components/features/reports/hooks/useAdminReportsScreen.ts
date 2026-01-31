"use client";

import * as React from "react";
import { notify } from "@/lib/notify/notify";
import type { CashSessionStatusFilter, CashSessionListRowDTO } from "@/lib/modules/admin/reports";
import type { DatePreset } from "../ui/AdminReportsFilter";

type Filters = {
  warehouseId: string | null;
  terminalId: string | null;
  status: CashSessionStatusFilter;
  datePreset: DatePreset;
  from: string | null; // yyyy-mm-dd si RANGE
  to: string | null;
};

export function useAdminReportsScreen() {
  const [tab, setTab] = React.useState<"overview" | "sessions">("overview");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 🔧 defaults (tú luego los conectas con preset -> range ISO real)
  const [filters, setFilters] = React.useState<Filters>({
    warehouseId: null,
    terminalId: null,
    status: "closed",
    datePreset: "LAST_7_DAYS",
    from: null,
    to: null,
  });

  // options (por ahora mock)
  const warehouseOptions = React.useMemo(() => [{ value: "wh-1", label: "Main WH" }], []);
  const terminalOptions = React.useMemo(() => [{ value: "pos-1", label: "POS 1" }], []);

  // sessions state
  const [rows, setRows] = React.useState<CashSessionListRowDTO[]>([]);
  const [hasMore, setHasMore] = React.useState(false);

  const setWarehouseId = (v: string | null) => setFilters((p) => ({ ...p, warehouseId: v }));
  const setTerminalId = (v: string | null) => setFilters((p) => ({ ...p, terminalId: v }));
  const setStatus = (v: CashSessionStatusFilter) => setFilters((p) => ({ ...p, status: v }));
  const setDatePreset = (v: DatePreset) => setFilters((p) => ({ ...p, datePreset: v }));
  const setRangeFrom = (v: string) => setFilters((p) => ({ ...p, from: v }));
  const setRangeTo = (v: string) => setFilters((p) => ({ ...p, to: v }));

  const clearFilters = () => {
    setFilters({
      warehouseId: null,
      terminalId: null,
      status: "closed",
      datePreset: "LAST_7_DAYS",
      from: null,
      to: null,
    });
    notify.success({ title: "Filtros limpiados", description: "Volvimos a defaults." });
  };

  const refreshAll = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      // luego: llamar overview + daily + list
      // por ahora: placeholder
      setRows([]);
      setHasMore(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    // luego: cursor pagination
  };

  const openDetail = (row: CashSessionListRowDTO) => {
    // luego: abrir Sheet con detail
    notify.success({ title: "Abrir detalle", description: `CashSession ${row.id.slice(0, 8)}` });
  };

  return {
    tab,
    setTab,
    loading,
    error,

    filters,
    warehouseOptions,
    terminalOptions,

    setWarehouseId,
    setTerminalId,
    setStatus,
    setDatePreset,
    setRangeFrom,
    setRangeTo,
    clearFilters,

    refreshAll,

    sessions: {
      rows,
      loading,
      hasMore,
      loadMore,
      openDetail,
    },
  };
}
