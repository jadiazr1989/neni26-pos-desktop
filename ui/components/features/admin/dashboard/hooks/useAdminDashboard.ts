// src/modules/admin/dashboard/ui/hooks/useAdminDashboard.ts
"use client";

import * as React from "react";
import type { AdminDashboardData, AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { adminDashboardService } from "@/lib/modules/admin/dashboard/admin-dashboard.service";
import { notify } from "@/lib/notify/notify";
import { isApiHttpError } from "@/lib/api/envelope";

export function useAdminDashboard(range: AdminDashboardRange) {
  const [data, setData] = React.useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true);
      const env = await adminDashboardService.getDashboard({ range });
      setData(env.dashboard);
    } catch (e) {
      const description =
        isApiHttpError(e) ? e.message : e instanceof Error ? e.message : "Error desconocido";

      notify.error({
        title: "No se pudo cargar el dashboard",
        description,
      });
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh };
}
