// src/modules/admin/reports/ui/hooks/useAdminCashReports.ts
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify/notify";
import { adminReportsService } from "@/lib/modules/admin/reports";

import type {
  CashSessionStatusFilter,
  CashSessionsListDTO,
  ReportsDailyRowDTO,
  ReportsOverviewDTO,
  ListCashSessionsQuery,
} from "@/lib/modules/admin/reports";

import type { DatePreset } from "../ui/AdminReportsFilter";

type RangeISO = { from: string; to: string };

export type AdminReportsFilters = {
  warehouseId: string | null;
  terminalId: string | null;
  status: CashSessionStatusFilter;
  preset: DatePreset;
  from: string | null; // yyyy-mm-dd (cuando preset = "RANGO")
  to: string | null;   // yyyy-mm-dd (cuando preset = "RANGO")
};

type Opts = {
  initialWarehouseId?: string | null;
  initialTerminalId?: string | null;
  initialStatus?: CashSessionStatusFilter;
  initialPreset?: DatePreset;
  initialFrom?: string | null;
  initialTo?: string | null;
  initialTake?: number;

  setLoading?: (v: boolean) => void;

  warehouseOptions?: Array<{ value: string; label: string }>;
  terminalOptions?: Array<{ value: string; label: string }>;
};

type RowId = { id: string };

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Error inesperado";
}

function clampTake(n: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 30;
  return Math.min(Math.max(Math.floor(x), 1), 100);
}

function computeRangeISO(
  preset: DatePreset,
  from: string | null,
  to: string | null,
  status: CashSessionStatusFilter
): RangeISO {
  const now = new Date();

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // ✅ si estás viendo "Cerradas", evita incluir HOY (día en curso) excepto en preset HOY o RANGO manual
  const effectiveTo =
    status === "closed" && preset !== "HOY" && preset !== "RANGO"
      ? endOfDay(yesterday)
      : endOfDay(now);

  if (preset === "RANGO") {
    const f = from ? new Date(from) : startOfDay(new Date(now.getTime() - 7 * 86400000));
    const t = to ? endOfDay(new Date(to)) : effectiveTo;
    return { from: startOfDay(f).toISOString(), to: t.toISOString() };
  }

  if (preset === "HOY") {
    return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() };
  }

  if (preset === "ULTIMOS_7_DIAS") {
    const f = startOfDay(new Date(effectiveTo.getTime() - 7 * 86400000));
    return { from: f.toISOString(), to: effectiveTo.toISOString() };
  }

  if (preset === "ULTIMOS_30_DIAS") {
    const f = startOfDay(new Date(effectiveTo.getTime() - 30 * 86400000));
    return { from: f.toISOString(), to: effectiveTo.toISOString() };
  }

  // ESTE_MES
  const f = new Date(effectiveTo.getFullYear(), effectiveTo.getMonth(), 1);
  return { from: startOfDay(f).toISOString(), to: effectiveTo.toISOString() };
}

function buildListQuery(params: {
  status: CashSessionStatusFilter;
  range: RangeISO;
  take: number;
  cursor: string | null;
}): ListCashSessionsQuery {
  return {
    status: params.status,
    from: params.range.from,
    to: params.range.to,
    take: params.take,
    cursor: params.cursor,
  };
}

export function useAdminReportsQuery(opts: Opts = {}) {
  const router = useRouter();

  const DEFAULT_FILTERS = React.useMemo<AdminReportsFilters>(
    () => ({
      warehouseId: opts.initialWarehouseId ?? null,
      terminalId: opts.initialTerminalId ?? null,
      status: opts.initialStatus ?? "closed",
      preset: opts.initialPreset ?? "ULTIMOS_7_DIAS",
      from: opts.initialFrom ?? null,
      to: opts.initialTo ?? null,
    }),
    [
      opts.initialWarehouseId,
      opts.initialTerminalId,
      opts.initialStatus,
      opts.initialPreset,
      opts.initialFrom,
      opts.initialTo,
    ]
  );

  // draft (UI) vs applied (query)
  const [draft, setDraft] = React.useState<AdminReportsFilters>(DEFAULT_FILTERS);
  const [applied, setApplied] = React.useState<AdminReportsFilters>(DEFAULT_FILTERS);

  const [take, setTake] = React.useState<number>(clampTake(opts.initialTake ?? 30));

  // data
  const [overview, setOverview] = React.useState<ReportsOverviewDTO | null>(null);
  const [dailyRows, setDailyRows] = React.useState<ReportsDailyRowDTO[]>([]);
  const [list, setList] = React.useState<CashSessionsListDTO | null>(null);

  // loading flags
  const [loadingOverview, setLoadingOverview] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingNext, setLoadingNext] = React.useState(false);

  // ---------------- draft setters ----------------
  const setWarehouseId = React.useCallback((v: string | null) => {
    setDraft((s) => ({ ...s, warehouseId: v }));
  }, []);

  const setTerminalId = React.useCallback((v: string | null) => {
    setDraft((s) => ({ ...s, terminalId: v }));
  }, []);

  const setStatus = React.useCallback((v: CashSessionStatusFilter) => {
    setDraft((s) => ({ ...s, status: v }));
  }, []);

  const setPreset = React.useCallback((v: DatePreset) => {
    setDraft((s) => {
      if (v !== "RANGO") return { ...s, preset: v, from: null, to: null };
      return { ...s, preset: "RANGO" };
    });
  }, []);

  const setFrom = React.useCallback((v: string) => {
    setDraft((s) => ({ ...s, preset: "RANGO", from: v || null }));
  }, []);

  const setTo = React.useCallback((v: string) => {
    setDraft((s) => ({ ...s, preset: "RANGO", to: v || null }));
  }, []);

  const clearDraft = React.useCallback(() => {
    setDraft(DEFAULT_FILTERS);
  }, [DEFAULT_FILTERS]);

  // ---------------- loaders (reciben filtros) ----------------
  const loadOverviewFor = React.useCallback(
    async (f: AdminReportsFilters) => {
      if (loadingOverview) return;

      const range = computeRangeISO(f.preset, f.from, f.to, f.status);

      setLoadingOverview(true);
      opts.setLoading?.(true);

      try {
        const [ov, daily] = await Promise.all([
          adminReportsService.overview({ from: range.from, to: range.to }),
          adminReportsService.dailySummary({  from: range.from, to: range.to }),
        ]);

        setOverview(ov);
        setDailyRows(daily);
      } catch (e: unknown) {
        notify.error({ title: "Error cargando resumen", description: errMsg(e) });
      } finally {
        opts.setLoading?.(false);
        setLoadingOverview(false);
      }
    },
    [loadingOverview, opts]
  );

  const loadListFor = React.useCallback(
    async (f: AdminReportsFilters, cursor: string | null) => {
      if (cursor === null && loadingList) return;
      if (cursor !== null && loadingNext) return;

      const range = computeRangeISO(f.preset, f.from, f.to, f.status);

      const q = buildListQuery({
        status: f.status,
        range,
        take,
        cursor,
      });

      if (cursor === null) {
        setLoadingList(true);
        opts.setLoading?.(true);
      } else {
        setLoadingNext(true);
      }

      try {
        const res = await adminReportsService.listCashSessions(q);

        if (cursor === null) {
          setList(res);
        } else {
          setList((prev) => ({
            items: [...(prev?.items ?? []), ...res.items],
            nextCursor: res.nextCursor,
          }));
        }
      } catch (e: unknown) {
        notify.error({
          title: cursor ? "Error cargando más" : "Error cargando sesiones",
          description: errMsg(e),
        });
      } finally {
        if (cursor === null) {
          opts.setLoading?.(false);
          setLoadingList(false);
        } else {
          setLoadingNext(false);
        }
      }
    },
    [loadingList, loadingNext, opts, take]
  );

  const refreshAllFor = React.useCallback(
    async (f: AdminReportsFilters) => {
      await Promise.all([loadOverviewFor(f), loadListFor(f, null)]);
    },
    [loadOverviewFor, loadListFor]
  );

  // ---------------- actions ----------------

  // ✅ Apply: FIX doble click (consulta con snapshot)
  const apply = React.useCallback(async () => {
    const next = draft;
    setApplied(next);
    await refreshAllFor(next);
  }, [draft, refreshAllFor]);

  const refreshAll = React.useCallback(async () => {
    await refreshAllFor(applied);
  }, [applied, refreshAllFor]);

  const loadNextPage = React.useCallback(async () => {
    const cursor = list?.nextCursor ?? null;
    if (!cursor) return;
    await loadListFor(applied, cursor);
  }, [list?.nextCursor, loadListFor, applied]);

  // ✅ cargar 1 vez al entrar (sin loop)
  React.useEffect(() => {
    void refreshAllFor(applied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpen = React.useCallback(
    (row: RowId) => {
      router.push(`/admin/reports/${row.id}`);
    },
    [router]
  );

  return {
    warehouseOptions: opts.warehouseOptions ?? [],
    terminalOptions: opts.terminalOptions ?? [],

    draft,
    setWarehouseId,
    setTerminalId,
    setStatus,
    setPreset,
    setFrom,
    setTo,
    clearDraft,

    applied,

    overview,
    dailyRows,
    list,

    loadingOverview,
    loadingList,
    loadingNext,

    apply,
    refreshAll,
    loadNextPage,
    onOpen,

    take,
    setTake: (n: number) => setTake(clampTake(n)),
  };
}
