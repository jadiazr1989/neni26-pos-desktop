// src/lib/modules/settings/settings.port.ts

import type {
  GetCashBusinessHoursResponse,
  GetDashboardAlertsThresholdsResponse,
  GetDashboardHealthConfigResponse,
  GetInventoryDashboardWeaknessesResponse,
  GetInventoryLowStockThresholdsResponse,
  GetPosCheckoutResponse,
  GetPosGeneralResponse,
  GetPosReceiptResponse,
  GetStoreMetricsSettingsResponse,
  GetStoreSettingsResponse,
  UpdateCashBusinessHoursRequest,
  UpdateCashBusinessHoursResponse,
  UpdateDashboardAlertsThresholdsRequest,
  UpdateDashboardAlertsThresholdsResponse,
  UpdateDashboardHealthConfigRequest,
  UpdateDashboardHealthConfigResponse,
  UpdateInventoryDashboardWeaknessesRequest,
  UpdateInventoryDashboardWeaknessesResponse,
  UpdateInventoryLowStockThresholdsRequest,
  UpdateInventoryLowStockThresholdsResponse,
  UpdatePosCheckoutRequest,
  UpdatePosCheckoutResponse,
  UpdatePosGeneralRequest,
  UpdatePosGeneralResponse,
  UpdatePosReceiptRequest,
  UpdatePosReceiptResponse,
} from "./settings.dto";

export interface SettingsPort {
  getStoreSettings(): Promise<GetStoreSettingsResponse>;

  getCashBusinessHours(): Promise<GetCashBusinessHoursResponse>;
  updateCashBusinessHours(
    input: UpdateCashBusinessHoursRequest
  ): Promise<UpdateCashBusinessHoursResponse>;

  getPosGeneral(): Promise<GetPosGeneralResponse>;
  updatePosGeneral(
    input: UpdatePosGeneralRequest
  ): Promise<UpdatePosGeneralResponse>;

  getPosCheckout(): Promise<GetPosCheckoutResponse>;
  updatePosCheckout(
    input: UpdatePosCheckoutRequest
  ): Promise<UpdatePosCheckoutResponse>;

  getPosReceipt(): Promise<GetPosReceiptResponse>;
  updatePosReceipt(
    input: UpdatePosReceiptRequest
  ): Promise<UpdatePosReceiptResponse>;

  getStoreMetricsSettings(): Promise<GetStoreMetricsSettingsResponse>;

  getInventoryLowStockThresholds(): Promise<GetInventoryLowStockThresholdsResponse>;
  updateInventoryLowStockThresholds(
    input: UpdateInventoryLowStockThresholdsRequest
  ): Promise<UpdateInventoryLowStockThresholdsResponse>;

  getDashboardAlertsThresholds(): Promise<GetDashboardAlertsThresholdsResponse>;
  updateDashboardAlertsThresholds(
    input: UpdateDashboardAlertsThresholdsRequest
  ): Promise<UpdateDashboardAlertsThresholdsResponse>;

  getInventoryDashboardWeaknesses(): Promise<GetInventoryDashboardWeaknessesResponse>;
  updateInventoryDashboardWeaknesses(
    input: UpdateInventoryDashboardWeaknessesRequest
  ): Promise<UpdateInventoryDashboardWeaknessesResponse>;

  getDashboardHealthConfig(): Promise<GetDashboardHealthConfigResponse>;
  updateDashboardHealthConfig(
    input: UpdateDashboardHealthConfigRequest
  ): Promise<UpdateDashboardHealthConfigResponse>;
}