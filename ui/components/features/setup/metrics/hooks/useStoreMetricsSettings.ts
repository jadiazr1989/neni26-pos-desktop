"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { settingsService } from "@/lib/modules/settings/settings.service";
import type {
  DashboardAlertsThresholdsDTO,
  DashboardHealthConfigDTO,
  InventoryDashboardWeaknessesDTO,
  InventoryLowStockThresholdsDTO,
  StoreMetricsSettingsDTO,
} from "@/lib/modules/settings/settings.dto";
import { notify } from "@/lib/notify/notify";

type UseStoreMetricsSettingsResult = {
  settings: StoreMetricsSettingsDTO | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;

  updateInventoryLowStockThresholds: (
    input: Partial<InventoryLowStockThresholdsDTO>
  ) => Promise<InventoryLowStockThresholdsDTO>;

  updateDashboardAlertsThresholds: (
    input: Partial<DashboardAlertsThresholdsDTO>
  ) => Promise<DashboardAlertsThresholdsDTO>;

  updateInventoryDashboardWeaknesses: (
    input: Partial<InventoryDashboardWeaknessesDTO>
  ) => Promise<InventoryDashboardWeaknessesDTO>;

  updateDashboardHealthConfig: (
    input: Partial<DashboardHealthConfigDTO>
  ) => Promise<DashboardHealthConfigDTO>;
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function useStoreMetricsSettings(): UseStoreMetricsSettingsResult {
  const [settings, setSettings] = useState<StoreMetricsSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "initial" | "refresh" = "refresh") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);

    setError(null);

    try {
      const next = await settingsService.getStoreMetricsSettings();
      setSettings(next);
    } catch (error: unknown) {
      const message = getErrorMessage(
        error,
        "No se pudo cargar la configuración de métricas."
      );
      setError(message);
      notify.error({
        title: "No se pudo cargar la configuración",
        description: message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load("initial");
  }, [load]);

  const reload = useCallback(async () => {
    await load("refresh");
  }, [load]);

  const updateInventoryLowStockThresholds = useCallback(
    async (
      input: Partial<InventoryLowStockThresholdsDTO>
    ): Promise<InventoryLowStockThresholdsDTO> => {
      const next = await settingsService.updateInventoryLowStockThresholds(input);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              inventoryLowStockThresholds: next,
            }
          : prev
      );

      return next;
    },
    []
  );

  const updateDashboardAlertsThresholds = useCallback(
    async (
      input: Partial<DashboardAlertsThresholdsDTO>
    ): Promise<DashboardAlertsThresholdsDTO> => {
      const next = await settingsService.updateDashboardAlertsThresholds(input);

      setSettings((prev) =>
        prev
          ? { ...prev, dashboardAlertsThresholds: next }
          : null
      );

      return next;
    },
    []
  );

  const updateInventoryDashboardWeaknesses = useCallback(
    async (
      input: Partial<InventoryDashboardWeaknessesDTO>
    ): Promise<InventoryDashboardWeaknessesDTO> => {
      const next = await settingsService.updateInventoryDashboardWeaknesses(input);

      setSettings((prev) =>
        prev
          ? { ...prev, inventoryDashboardWeaknesses: next }
          : null
      );

      return next;
    },
    []
  );

  const updateDashboardHealthConfig = useCallback(
    async (
      input: Partial<DashboardHealthConfigDTO>
    ): Promise<DashboardHealthConfigDTO> => {
      const next = await settingsService.updateDashboardHealthConfig(input);

      setSettings((prev) =>
        prev
          ? { ...prev, dashboardHealthConfig: next }
          : null
      );

      return next;
    },
    []
  );

  return useMemo(
    () => ({
      settings,
      loading,
      refreshing,
      error,
      reload,
      updateInventoryLowStockThresholds,
      updateDashboardAlertsThresholds,
      updateInventoryDashboardWeaknesses,
      updateDashboardHealthConfig,
    }),
    [
      settings,
      loading,
      refreshing,
      error,
      reload,
      updateInventoryLowStockThresholds,
      updateDashboardAlertsThresholds,
      updateInventoryDashboardWeaknesses,
      updateDashboardHealthConfig,
    ]
  );
}