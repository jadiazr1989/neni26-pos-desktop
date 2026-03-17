"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { settingsService } from "@/lib/modules/settings/settings.service";
import type {
  CashBusinessHoursDTO,
  PosCheckoutSettingsDTO,
  PosGeneralSettingsDTO,
  PosReceiptSettingsDTO,
  StoreSettingsDTO,
} from "@/lib/modules/settings/settings.dto";
import { notify } from "@/lib/notify/notify";

type UsePosSettingsResult = {
  settings: StoreSettingsDTO | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;

  updateCashBusinessHours: (
    input: Partial<CashBusinessHoursDTO>
  ) => Promise<CashBusinessHoursDTO>;

  updatePosGeneral: (
    input: Partial<PosGeneralSettingsDTO>
  ) => Promise<PosGeneralSettingsDTO>;

  updatePosCheckout: (
    input: Partial<PosCheckoutSettingsDTO>
  ) => Promise<PosCheckoutSettingsDTO>;

  updatePosReceipt: (
    input: Partial<PosReceiptSettingsDTO>
  ) => Promise<PosReceiptSettingsDTO>;
};

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function usePosSettings(): UsePosSettingsResult {
  const [settings, setSettings] = useState<StoreSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: "initial" | "refresh" = "refresh") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const next = await settingsService.getStoreSettings();
      setSettings(next);
    } catch (err: unknown) {
      const message = extractErrorMessage(err, "No se pudo cargar la configuración POS.");
      setError(message);
      notify.error({ title: "Error", description: message });
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

  const updateCashBusinessHours = useCallback(
    async (input: Partial<CashBusinessHoursDTO>): Promise<CashBusinessHoursDTO> => {
      const next = await settingsService.updateCashBusinessHours(input);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              cashBusinessHours: next,
            }
          : {
              cashBusinessHours: next,
              posGeneral: {
                storeNameOverride: null,
                defaultCurrency: "CUP",
                allowNegativeStockSale: false,
                requireTerminalAssigned: true,
              },
              posCheckout: {
                allowMixedPayments: true,
                allowSplitPayments: true,
                defaultPaymentMethod: "CASH",
                requireCustomerForSale: false,
                autoPrintReceipt: false,
              },
              posReceipt: {
                showStoreLogo: true,
                showTerminal: true,
                showCashier: true,
                footerText: "Gracias por su compra",
                paperWidth: "80mm",
              },
            }
      );

      return next;
    },
    []
  );

  const updatePosGeneral = useCallback(
    async (input: Partial<PosGeneralSettingsDTO>): Promise<PosGeneralSettingsDTO> => {
      const next = await settingsService.updatePosGeneral(input);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              posGeneral: next,
            }
          : {
              cashBusinessHours: {
                timeZone: "America/Havana",
                opensAt: "06:00",
                closesAt: "23:59",
                lastOpenAt: "22:30",
                warnBeforeMinutes: [120, 60, 30],
                allowMultipleSessionsPerDay: true,
              },
              posGeneral: next,
              posCheckout: {
                allowMixedPayments: true,
                allowSplitPayments: true,
                defaultPaymentMethod: "CASH",
                requireCustomerForSale: false,
                autoPrintReceipt: false,
              },
              posReceipt: {
                showStoreLogo: true,
                showTerminal: true,
                showCashier: true,
                footerText: "Gracias por su compra",
                paperWidth: "80mm",
              },
            }
      );

      return next;
    },
    []
  );

  const updatePosCheckout = useCallback(
    async (input: Partial<PosCheckoutSettingsDTO>): Promise<PosCheckoutSettingsDTO> => {
      const next = await settingsService.updatePosCheckout(input);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              posCheckout: next,
            }
          : {
              cashBusinessHours: {
                timeZone: "America/Havana",
                opensAt: "06:00",
                closesAt: "23:59",
                lastOpenAt: "22:30",
                warnBeforeMinutes: [120, 60, 30],
                allowMultipleSessionsPerDay: true,
              },
              posGeneral: {
                storeNameOverride: null,
                defaultCurrency: "CUP",
                allowNegativeStockSale: false,
                requireTerminalAssigned: true,
              },
              posCheckout: next,
              posReceipt: {
                showStoreLogo: true,
                showTerminal: true,
                showCashier: true,
                footerText: "Gracias por su compra",
                paperWidth: "80mm",
              },
            }
      );

      return next;
    },
    []
  );

  const updatePosReceipt = useCallback(
    async (input: Partial<PosReceiptSettingsDTO>): Promise<PosReceiptSettingsDTO> => {
      const next = await settingsService.updatePosReceipt(input);

      setSettings((prev) =>
        prev
          ? {
              ...prev,
              posReceipt: next,
            }
          : {
              cashBusinessHours: {
                timeZone: "America/Havana",
                opensAt: "06:00",
                closesAt: "23:59",
                lastOpenAt: "22:30",
                warnBeforeMinutes: [120, 60, 30],
                allowMultipleSessionsPerDay: true,
              },
              posGeneral: {
                storeNameOverride: null,
                defaultCurrency: "CUP",
                allowNegativeStockSale: false,
                requireTerminalAssigned: true,
              },
              posCheckout: {
                allowMixedPayments: true,
                allowSplitPayments: true,
                defaultPaymentMethod: "CASH",
                requireCustomerForSale: false,
                autoPrintReceipt: false,
              },
              posReceipt: next,
            }
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
      updateCashBusinessHours,
      updatePosGeneral,
      updatePosCheckout,
      updatePosReceipt,
    }),
    [
      settings,
      loading,
      refreshing,
      error,
      reload,
      updateCashBusinessHours,
      updatePosGeneral,
      updatePosCheckout,
      updatePosReceipt,
    ]
  );
}