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
  ReportsAlertsDTO,
} from "@/lib/modules/admin/reports";

import type { DatePreset } from "../ui/AdminReportsFilter";

type TabKey = "overview" | "sessions";
type RangeYmd = { from: string; to: string }; // [from, to) (to exclusive)

export type AdminReportsFilters = {
  warehouseId: string | null;
  terminalId: string | null;
  preset: DatePreset;
  from: string | null; // inclusive day when RANGO
  to: string | null; // inclusive day when RANGO
};

type Opts = {
  tab: TabKey;
  initialTake?: number;
  warehouseOptions?: Array<{ value: string; label: string }>;
  terminalOptions?: Array<{ value: string; label: string }>;
};

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Error inesperado";
}

function clampTake(n: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return 30;
  return Math.min(Math.max(Math.floor(x), 1), 100);
}

function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toYmdLocal(dt);
}

function computeRangeYmd(preset: DatePreset, from: string | null, to: string | null): RangeYmd {
  const today = toYmdLocal(new Date());

  if (preset === "RANGO") {
    const f = from ?? today;
    const endInclusive = to ?? today;
    return { from: f, to: addDaysYmd(endInclusive, 1) }; // ✅ to exclusive
  }

  if (preset === "HOY") return { from: today, to: addDaysYmd(today, 1) };
  if (preset === "ULTIMOS_7_DIAS") return { from: addDaysYmd(today, -6), to: addDaysYmd(today, 1) };
  if (preset === "ULTIMOS_30_DIAS") return { from: addDaysYmd(today, -29), to: addDaysYmd(today, 1) };

  const now = new Date();
  const firstDay = toYmdLocal(new Date(now.getFullYear(), now.getMonth(), 1));
  return { from: firstDay, to: addDaysYmd(today, 1) };
}

export function useAdminReportsQuery(opts: Opts) {
  const router = useRouter();

  const tab = opts.tab;
  const warehouseOptions = opts.warehouseOptions ?? [];
  const terminalOptions = opts.terminalOptions ?? [];
  const initialTake = opts.initialTake ?? 30;

  const DEFAULT_FILTERS = React.useMemo<AdminReportsFilters>(
    () => ({
      warehouseId: null,
      terminalId: null,
      preset: "HOY",
      from: null,
      to: null,
    }),
    []
  );

  const [filters, setFilters] = React.useState<AdminReportsFilters>(DEFAULT_FILTERS);

  // sessions-only
  const [sessionStatus, setSessionStatus] = React.useState<CashSessionStatusFilter>("closed");
  const [take, setTake] = React.useState<number>(clampTake(initialTake));

  // data
  const [overview, setOverview] = React.useState<ReportsOverviewDTO | null>(null);
  const [dailyRows, setDailyRows] = React.useState<ReportsDailyRowDTO[]>([]);
  const [alerts, setAlerts] = React.useState<ReportsAlertsDTO | null>(null);
  const [list, setList] = React.useState<CashSessionsListDTO | null>(null);

  // loading flags (UI)
  const [loadingOverview, setLoadingOverview] = React.useState(false);
  const [loadingAlerts, setLoadingAlerts] = React.useState(false);
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingNext, setLoadingNext] = React.useState(false);

  // loading gates (NO re-render)
  const loadingRef = React.useRef({
    overview: false,
    alerts: false,
    list: false,
    next: false,
  });

  // dedupe
  const inflightRef = React.useRef<Map<string, Promise<unknown>>>(new Map());

  // tokens: cancel-by-staleness (sin AbortController)
  const tokenRef = React.useRef({
    overview: 0,
    alerts: 0,
    list: 0,
    next: 0,
  });

  function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const hit = inflightRef.current.get(key);
    if (hit) return hit as Promise<T>;
    const p = fn().finally(() => inflightRef.current.delete(key));
    inflightRef.current.set(key, p);
    return p;
  }

  // ---------------- setters ----------------
  const setWarehouseId = React.useCallback((v: string | null) => {
    setFilters((s) => (s.warehouseId === v ? s : { ...s, warehouseId: v }));
  }, []);

  const setTerminalId = React.useCallback((v: string | null) => {
    setFilters((s) => (s.terminalId === v ? s : { ...s, terminalId: v }));
  }, []);

  const setPreset = React.useCallback((v: DatePreset) => {
    setFilters((s) => {
      if (v === "RANGO") return s.preset === "RANGO" ? s : { ...s, preset: "RANGO" };
      if (s.preset === v && !s.from && !s.to) return s;
      return { ...s, preset: v, from: null, to: null };
    });
  }, []);

  const setFrom = React.useCallback((v: string) => {
    setFilters((s) => ({ ...s, preset: "RANGO", from: v || null }));
  }, []);

  const setTo = React.useCallback((v: string) => {
    setFilters((s) => ({ ...s, preset: "RANGO", to: v || null }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [DEFAULT_FILTERS]);

  // ---------------- loaders (ESTABLES) ----------------
  const loadOverviewFor = React.useCallback(async (f: AdminReportsFilters) => {
    if (loadingRef.current.overview) return;

    const range = computeRangeYmd(f.preset, f.from, f.to);
    const myToken = ++tokenRef.current.overview;

    loadingRef.current.overview = true;
    setLoadingOverview(true);

    try {
      const keyOv = `ov:${range.from}:${range.to}`;
      const keyDy = `dy:${range.from}:${range.to}`;

      const [ov, daily] = await Promise.all([
        dedupe(keyOv, () => adminReportsService.overview({ from: range.from, to: range.to })),
        dedupe(keyDy, () => adminReportsService.dailySummary({ from: range.from, to: range.to })),
      ]);

      if (myToken !== tokenRef.current.overview) return;

      setOverview(ov);
      setDailyRows(daily);
    } catch (e: unknown) {
      if (myToken !== tokenRef.current.overview) return;
      notify.error({ title: "Error cargando resumen", description: errMsg(e) });
    } finally {
      if (myToken === tokenRef.current.overview) {
        loadingRef.current.overview = false;
        setLoadingOverview(false);
      }
    }
  }, []);

  const loadAlertsFor = React.useCallback(async (f: AdminReportsFilters) => {
    if (loadingRef.current.alerts) return;

    const range = computeRangeYmd(f.preset, f.from, f.to);
    const myToken = ++tokenRef.current.alerts;

    loadingRef.current.alerts = true;
    setLoadingAlerts(true);

    try {
      const key = `alerts:${range.from}:${range.to}`;
      const res = await dedupe(key, () => adminReportsService.alerts({ from: range.from, to: range.to }));

      if (myToken !== tokenRef.current.alerts) return;

      setAlerts(res);
    } catch (e: unknown) {
      if (myToken !== tokenRef.current.alerts) return;
      notify.error({ title: "Error cargando alertas", description: errMsg(e) });
    } finally {
      if (myToken === tokenRef.current.alerts) {
        loadingRef.current.alerts = false;
        setLoadingAlerts(false);
      }
    }
  }, []);

  const loadListFor = React.useCallback(
    async (f: AdminReportsFilters, status: CashSessionStatusFilter, cursor: string | null, takeNow: number) => {
      const mode: "list" | "next" = cursor === null ? "list" : "next";

      if (mode === "list" && loadingRef.current.list) return;
      if (mode === "next" && loadingRef.current.next) return;

      const range = computeRangeYmd(f.preset, f.from, f.to);
      const myToken = ++tokenRef.current[mode];

      const q: ListCashSessionsQuery = { status, from: range.from, to: range.to, take: takeNow, cursor };

      if (mode === "list") {
        loadingRef.current.list = true;
        setLoadingList(true);
      } else {
        loadingRef.current.next = true;
        setLoadingNext(true);
      }

      try {
        const key = `list:${status}:${range.from}:${range.to}:${takeNow}:${cursor ?? "null"}`;
        const res = await dedupe(key, () => adminReportsService.listCashSessions(q));

        if (myToken !== tokenRef.current[mode]) return;

        if (mode === "list") {
          setList(res);
        } else {
          setList((prev) => ({
            items: [...(prev?.items ?? []), ...res.items],
            nextCursor: res.nextCursor,
          }));
        }
      } catch (e: unknown) {
        if (myToken !== tokenRef.current[mode]) return;
        notify.error({
          title: mode === "next" ? "Error cargando más" : "Error cargando sesiones",
          description: errMsg(e),
        });
      } finally {
        if (myToken === tokenRef.current[mode]) {
          if (mode === "list") {
            loadingRef.current.list = false;
            setLoadingList(false);
          } else {
            loadingRef.current.next = false;
            setLoadingNext(false);
          }
        }
      }
    },
    []
  );

  const refreshOverview = React.useCallback(async () => {
    await Promise.all([loadOverviewFor(filters), loadAlertsFor(filters)]);
  }, [filters, loadOverviewFor, loadAlertsFor]);

  const refreshSessions = React.useCallback(async () => {
    await loadListFor(filters, sessionStatus, null, take);
  }, [filters, sessionStatus, take, loadListFor]);

  // ✅ effect key estable (no depende de identidad de funciones)
  const effectKey = React.useMemo(() => {
    return [
      tab,
      filters.warehouseId ?? "",
      filters.terminalId ?? "",
      filters.preset,
      filters.from ?? "",
      filters.to ?? "",
      sessionStatus,
      take,
    ].join("|");
  }, [tab, filters.warehouseId, filters.terminalId, filters.preset, filters.from, filters.to, sessionStatus, take]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (tab === "overview") {
        void loadOverviewFor(filters);
        void loadAlertsFor(filters);
      } else {
        void loadListFor(filters, sessionStatus, null, take);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [effectKey, tab, filters, sessionStatus, take, loadOverviewFor, loadAlertsFor, loadListFor]);

  const refreshAll = React.useCallback(async () => {
    if (tab === "overview") await refreshOverview();
    else await refreshSessions();
  }, [tab, refreshOverview, refreshSessions]);

  const loadNextPage = React.useCallback(async () => {
    const cursor = list?.nextCursor ?? null;
    if (!cursor) return;
    await loadListFor(filters, sessionStatus, cursor, take);
  }, [list?.nextCursor, loadListFor, filters, sessionStatus, take]);

  const onOpen = React.useCallback(
    (row: { id: string }) => {
      router.push(`/admin/reports/${row.id}`);
    },
    [router]
  );

  return {
    warehouseOptions,
    terminalOptions,

    filters,
    sessionStatus,

    setWarehouseId,
    setTerminalId,
    setPreset,
    setFrom,
    setTo,
    setSessionStatus,
    clearFilters,

    overview,
    dailyRows,
    alerts,
    list,

    loadingOverview,
    loadingAlerts,
    loadingList,
    loadingNext,

    refreshAll,
    loadNextPage,
    onOpen,

    take,
    setTake: (n: number) => setTake(clampTake(n)),
  };
}