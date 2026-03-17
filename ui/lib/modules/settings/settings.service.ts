// src/lib/modules/settings/settings.service.ts

import type { SettingsPort } from "./settings.port";
import { SettingsHttpAdapter } from "./settings.http";

import type {
  CashBusinessHoursDTO,
  DashboardAlertsThresholdsDTO,
  DashboardHealthConfigDTO,
  InventoryDashboardWeaknessesDTO,
  InventoryLowStockThresholdsDTO,
  PosCheckoutSettingsDTO,
  PosGeneralSettingsDTO,
  PosReceiptSettingsDTO,
  StoreMetricsSettingsDTO,
  StoreSettingsDTO,
  UpdateCashBusinessHoursRequest,
  UpdateDashboardAlertsThresholdsRequest,
  UpdateDashboardHealthConfigRequest,
  UpdateInventoryDashboardWeaknessesRequest,
  UpdateInventoryLowStockThresholdsRequest,
  UpdatePosCheckoutRequest,
  UpdatePosGeneralRequest,
  UpdatePosReceiptRequest,
} from "./settings.dto";

class SettingsService {
  constructor(private readonly port: SettingsPort) {}

  async getStoreSettings(): Promise<StoreSettingsDTO> {
    const res = await this.port.getStoreSettings();
    return res.settings;
  }

  async getCashBusinessHours(): Promise<CashBusinessHoursDTO> {
    const res = await this.port.getCashBusinessHours();
    return res.settings;
  }

  async updateCashBusinessHours(
    input: UpdateCashBusinessHoursRequest
  ): Promise<CashBusinessHoursDTO> {
    const res = await this.port.updateCashBusinessHours(input);
    return res.settings;
  }

  async getPosGeneral(): Promise<PosGeneralSettingsDTO> {
    const res = await this.port.getPosGeneral();
    return res.settings;
  }

  async updatePosGeneral(
    input: UpdatePosGeneralRequest
  ): Promise<PosGeneralSettingsDTO> {
    const res = await this.port.updatePosGeneral(input);
    return res.settings;
  }

  async getPosCheckout(): Promise<PosCheckoutSettingsDTO> {
    const res = await this.port.getPosCheckout();
    return res.settings;
  }

  async updatePosCheckout(
    input: UpdatePosCheckoutRequest
  ): Promise<PosCheckoutSettingsDTO> {
    const res = await this.port.updatePosCheckout(input);
    return res.settings;
  }

  async getPosReceipt(): Promise<PosReceiptSettingsDTO> {
    const res = await this.port.getPosReceipt();
    return res.settings;
  }

  async updatePosReceipt(
    input: UpdatePosReceiptRequest
  ): Promise<PosReceiptSettingsDTO> {
    const res = await this.port.updatePosReceipt(input);
    return res.settings;
  }

  async getStoreMetricsSettings(): Promise<StoreMetricsSettingsDTO> {
    const res = await this.port.getStoreMetricsSettings();
    return res.settings;
  }

  async getInventoryLowStockThresholds(): Promise<InventoryLowStockThresholdsDTO> {
    const res = await this.port.getInventoryLowStockThresholds();
    return res.settings;
  }

  async updateInventoryLowStockThresholds(
    input: UpdateInventoryLowStockThresholdsRequest
  ): Promise<InventoryLowStockThresholdsDTO> {
    const res = await this.port.updateInventoryLowStockThresholds(input);
    return res.settings;
  }

  async getDashboardAlertsThresholds(): Promise<DashboardAlertsThresholdsDTO> {
    const res = await this.port.getDashboardAlertsThresholds();
    return res.settings;
  }

  async updateDashboardAlertsThresholds(
    input: UpdateDashboardAlertsThresholdsRequest
  ): Promise<DashboardAlertsThresholdsDTO> {
    const res = await this.port.updateDashboardAlertsThresholds(input);
    return res.settings;
  }

  async getInventoryDashboardWeaknesses(): Promise<InventoryDashboardWeaknessesDTO> {
    const res = await this.port.getInventoryDashboardWeaknesses();
    return res.settings;
  }

  async updateInventoryDashboardWeaknesses(
    input: UpdateInventoryDashboardWeaknessesRequest
  ): Promise<InventoryDashboardWeaknessesDTO> {
    const res = await this.port.updateInventoryDashboardWeaknesses(input);
    return res.settings;
  }

  async getDashboardHealthConfig(): Promise<DashboardHealthConfigDTO> {
    const res = await this.port.getDashboardHealthConfig();
    return res.settings;
  }

  async updateDashboardHealthConfig(
    input: UpdateDashboardHealthConfigRequest
  ): Promise<DashboardHealthConfigDTO> {
    const res = await this.port.updateDashboardHealthConfig(input);
    return res.settings;
  }
}

export const settingsService = new SettingsService(new SettingsHttpAdapter());