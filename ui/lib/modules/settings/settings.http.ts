// src/lib/modules/settings/settings.http.ts

import { apiClient } from "@/lib/api/apiClient";
import type { SettingsPort } from "./settings.port";
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

export class SettingsHttpAdapter implements SettingsPort {
  getStoreSettings(): Promise<GetStoreSettingsResponse> {
    return apiClient.json(`/api/v1/settings/store`, {
      method: "GET",
    });
  }

  getCashBusinessHours(): Promise<GetCashBusinessHoursResponse> {
    return apiClient.json(`/api/v1/settings/store/cash-business-hours`, {
      method: "GET",
    });
  }

  updateCashBusinessHours(
    input: UpdateCashBusinessHoursRequest
  ): Promise<UpdateCashBusinessHoursResponse> {
    return apiClient.json(`/api/v1/settings/store/cash-business-hours`, {
      method: "PUT",
      body: input,
    });
  }

  getPosGeneral(): Promise<GetPosGeneralResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-general`, {
      method: "GET",
    });
  }

  updatePosGeneral(
    input: UpdatePosGeneralRequest
  ): Promise<UpdatePosGeneralResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-general`, {
      method: "PUT",
      body: input,
    });
  }

  getPosCheckout(): Promise<GetPosCheckoutResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-checkout`, {
      method: "GET",
    });
  }

  updatePosCheckout(
    input: UpdatePosCheckoutRequest
  ): Promise<UpdatePosCheckoutResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-checkout`, {
      method: "PUT",
      body: input,
    });
  }

  getPosReceipt(): Promise<GetPosReceiptResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-receipt`, {
      method: "GET",
    });
  }

  updatePosReceipt(
    input: UpdatePosReceiptRequest
  ): Promise<UpdatePosReceiptResponse> {
    return apiClient.json(`/api/v1/settings/store/pos-receipt`, {
      method: "PUT",
      body: input,
    });
  }

  getStoreMetricsSettings(): Promise<GetStoreMetricsSettingsResponse> {
    return apiClient.json(`/api/v1/settings/store/metrics`, {
      method: "GET",
    });
  }

  getInventoryLowStockThresholds(): Promise<GetInventoryLowStockThresholdsResponse> {
    return apiClient.json(`/api/v1/settings/store/inventory-low-stock-thresholds`, {
      method: "GET",
    });
  }

  updateInventoryLowStockThresholds(
    input: UpdateInventoryLowStockThresholdsRequest
  ): Promise<UpdateInventoryLowStockThresholdsResponse> {
    return apiClient.json(`/api/v1/settings/store/inventory-low-stock-thresholds`, {
      method: "PUT",
      body: input,
    });
  }

  getDashboardAlertsThresholds(): Promise<GetDashboardAlertsThresholdsResponse> {
    return apiClient.json(`/api/v1/settings/store/dashboard-alerts-thresholds`, {
      method: "GET",
    });
  }

  updateDashboardAlertsThresholds(
    input: UpdateDashboardAlertsThresholdsRequest
  ): Promise<UpdateDashboardAlertsThresholdsResponse> {
    return apiClient.json(`/api/v1/settings/store/dashboard-alerts-thresholds`, {
      method: "PUT",
      body: input,
    });
  }

  getInventoryDashboardWeaknesses(): Promise<GetInventoryDashboardWeaknessesResponse> {
    return apiClient.json(`/api/v1/settings/store/inventory-dashboard-weaknesses`, {
      method: "GET",
    });
  }

  updateInventoryDashboardWeaknesses(
    input: UpdateInventoryDashboardWeaknessesRequest
  ): Promise<UpdateInventoryDashboardWeaknessesResponse> {
    return apiClient.json(`/api/v1/settings/store/inventory-dashboard-weaknesses`, {
      method: "PUT",
      body: input,
    });
  }

  getDashboardHealthConfig(): Promise<GetDashboardHealthConfigResponse> {
    return apiClient.json(`/api/v1/settings/store/dashboard-health-config`, {
      method: "GET",
    });
  }

  updateDashboardHealthConfig(
    input: UpdateDashboardHealthConfigRequest
  ): Promise<UpdateDashboardHealthConfigResponse> {
    return apiClient.json(`/api/v1/settings/store/dashboard-health-config`, {
      method: "PUT",
      body: input,
    });
  }
}