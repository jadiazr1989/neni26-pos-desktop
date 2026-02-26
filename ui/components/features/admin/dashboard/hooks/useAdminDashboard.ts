// src/modules/admin/dashboard/ui/hooks/useAdminDashboard.ts
"use client";

import * as React from "react";
import type { AdminDashboardDataV2, AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { adminDashboardService } from "@/lib/modules/admin/dashboard/admin-dashboard.service";
import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";

export type UseAdminDashboardState = {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  error: string | null;

  range: AdminDashboardRange;
  rangeLabel: string;
  rangeLabelShort: string;
  setRange: React.Dispatch<React.SetStateAction<AdminDashboardRange>>;

  refresh: () => Promise<void>;
};

function getErrorMessage(e: unknown): string {
  if (isApiHttpError(e)) return e.message;
  if (e instanceof Error) return e.message;
  return "Error desconocido";
}

function rangeLabelEs(range: AdminDashboardRange): { label: string; short: string } {
  switch (range) {
    case "today":
      return { label: "Hoy", short: "Hoy" };
    case "7d":
      return { label: "Últimos 7 días", short: "7 días" };
    case "30d":
      return { label: "Últimos 30 días", short: "30 días" };
    default: {
      const r = String(range);
      return { label: r, short: r };
    }
  }
}

export function useAdminDashboard(initialRange: AdminDashboardRange): UseAdminDashboardState {
  const [range, setRange] = React.useState<AdminDashboardRange>(initialRange);

  const rangeUi = React.useMemo(() => rangeLabelEs(range), [range]);
  const rangeLabel = rangeUi.label;
  const rangeLabelShort = rangeUi.short;

  const [data, setData] = React.useState<AdminDashboardDataV2 | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const requestSeq = React.useRef(0);

  const refresh = React.useCallback(async () => {
    const current = ++requestSeq.current;

    try {
      setLoading(true);
      setError(null);

      const env = await adminDashboardService.getDashboard({ range });

      if (current !== requestSeq.current) return;

      setData(env.dashboard);
    } catch (e) {
      if (current !== requestSeq.current) return;

      const msg = getErrorMessage(e);
      setError(msg);

      notify.error({
        title: "No se pudo cargar el dashboard",
        description: msg,
      });
    } finally {
      if (current !== requestSeq.current) return;
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, error, range, rangeLabel, rangeLabelShort, setRange, refresh };
}