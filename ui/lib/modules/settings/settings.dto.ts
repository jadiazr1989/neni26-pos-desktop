export type CurrencyCode = "CUP" | "USD" | "EUR";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "OTHER";

export type CashBusinessHoursDTO = {
  timeZone: string | null;
  opensAt: string | null;
  closesAt: string | null;
  lastOpenAt: string | null;
  warnBeforeMinutes: number[];
  allowMultipleSessionsPerDay: boolean;
};

export type PosGeneralSettingsDTO = {
  storeNameOverride: string | null;
  defaultCurrency: CurrencyCode;
  allowNegativeStockSale: boolean;
  requireTerminalAssigned: boolean;
};

export type PosCheckoutSettingsDTO = {
  allowMixedPayments: boolean;
  allowSplitPayments: boolean;
  defaultPaymentMethod: PaymentMethod | null;
  requireCustomerForSale: boolean;
  autoPrintReceipt: boolean;
};

export type PosReceiptSettingsDTO = {
  showStoreLogo: boolean;
  showTerminal: boolean;
  showCashier: boolean;
  footerText: string | null;
  paperWidth: "58mm" | "80mm";
};

export type StoreSettingsDTO = {
  cashBusinessHours: CashBusinessHoursDTO;
  posGeneral: PosGeneralSettingsDTO;
  posCheckout: PosCheckoutSettingsDTO;
  posReceipt: PosReceiptSettingsDTO;
};

export type InventoryLowStockThresholdsDTO = {
  defaultThreshold: number;
  byVariant: Record<string, number>;
};

export type InventoryLowStockThresholdItemDTO = {
  variantId: string;
  threshold: number;
  sku: string | null;
  barcode: string | null;
  productName: string | null;
  variantTitle: string | null;
  label: string;
  imageUrl: string | null;
  isActive: boolean;
};

export type InventoryLowStockThresholdsDetailsDTO = {
  defaultThreshold: number;
  items: InventoryLowStockThresholdItemDTO[];
};

export type DashboardAlertsThresholdsDTO = {
  openSessionHoursWarn: number;

  cashDiffMinorWarn: number;
  cashDiffMinorCritical: number;

  refundRateWarnBps: number;
  refundRateCriticalBps: number;

  pendingAdjustmentsWarn: number;
  pendingAdjustmentsCritical: number;

  pendingAdjustmentsOverHoursWarn: number;
  pendingAdjustmentsOverHoursCritical: number;

  lowStockCriticalCount: number;
};

export type InventoryDashboardWeaknessesDTO = {
  lookbackDays: number;
  overstockThreshold: number;
  slowMovingSoldThreshold: number;
  lowCoverDays: number;
  overCoverDays: number;
};

export type DashboardHealthConfigDTO = {
  wGrossMargin: number;
  wRefundRate: number;
  wDiscountRate: number;
  wCashVariance: number;
  wInventoryRuptures: number;
  wInventoryLowStock: number;
  wOpenOrdersAging: number;
  wPendingAdjustments: number;

  minGrossMarginPctBpsOk: number;
  minGrossMarginPctBpsWarn: number;

  maxRefundRateBpsOk: number;
  maxRefundRateBpsWarn: number;

  maxDiscountRateBpsOk: number;
  maxDiscountRateBpsWarn: number;

  cashVarianceWarnMinor: number;
  cashVarianceCriticalMinor: number;

  rupturesWarnCount: number;
  rupturesCriticalCount: number;

  lowStockWarnCount: number;
  lowStockCriticalCount: number;

  openOrdersOver7dWarnCount: number;
  openOrdersOver14dCriticalCount: number;

  pendingAdjustmentsWarnCount: number;
  pendingAdjustmentsCriticalCount: number;
};

export type StoreMetricsSettingsDTO = {
  inventoryLowStockThresholds: InventoryLowStockThresholdsDTO;
  inventoryLowStockThresholdsDetails: InventoryLowStockThresholdsDetailsDTO;
  dashboardAlertsThresholds: DashboardAlertsThresholdsDTO;
  inventoryDashboardWeaknesses: InventoryDashboardWeaknessesDTO;
  dashboardHealthConfig: DashboardHealthConfigDTO;
};

export type GetStoreSettingsResponse = {
  settings: StoreSettingsDTO;
};

export type GetCashBusinessHoursResponse = {
  settings: CashBusinessHoursDTO;
};

export type UpdateCashBusinessHoursRequest = Partial<CashBusinessHoursDTO>;

export type UpdateCashBusinessHoursResponse = {
  settings: CashBusinessHoursDTO;
};

export type GetPosGeneralResponse = {
  settings: PosGeneralSettingsDTO;
};

export type UpdatePosGeneralRequest = Partial<PosGeneralSettingsDTO>;

export type UpdatePosGeneralResponse = {
  settings: PosGeneralSettingsDTO;
};

export type GetPosCheckoutResponse = {
  settings: PosCheckoutSettingsDTO;
};

export type UpdatePosCheckoutRequest = Partial<PosCheckoutSettingsDTO>;

export type UpdatePosCheckoutResponse = {
  settings: PosCheckoutSettingsDTO;
};

export type GetPosReceiptResponse = {
  settings: PosReceiptSettingsDTO;
};

export type UpdatePosReceiptRequest = Partial<PosReceiptSettingsDTO>;

export type UpdatePosReceiptResponse = {
  settings: PosReceiptSettingsDTO;
};

export type GetStoreMetricsSettingsResponse = {
  settings: StoreMetricsSettingsDTO;
};

export type GetInventoryLowStockThresholdsResponse = {
  settings: InventoryLowStockThresholdsDTO;
};

export type GetInventoryLowStockThresholdsDetailsResponse = {
  settings: InventoryLowStockThresholdsDetailsDTO;
};

export type UpdateInventoryLowStockThresholdsRequest =
  Partial<InventoryLowStockThresholdsDTO>;

export type UpdateInventoryLowStockThresholdsResponse = {
  settings: InventoryLowStockThresholdsDTO;
};

export type GetDashboardAlertsThresholdsResponse = {
  settings: DashboardAlertsThresholdsDTO;
};

export type UpdateDashboardAlertsThresholdsRequest =
  Partial<DashboardAlertsThresholdsDTO>;

export type UpdateDashboardAlertsThresholdsResponse = {
  settings: DashboardAlertsThresholdsDTO;
};

export type GetInventoryDashboardWeaknessesResponse = {
  settings: InventoryDashboardWeaknessesDTO;
};

export type UpdateInventoryDashboardWeaknessesRequest =
  Partial<InventoryDashboardWeaknessesDTO>;

export type UpdateInventoryDashboardWeaknessesResponse = {
  settings: InventoryDashboardWeaknessesDTO;
};

export type GetDashboardHealthConfigResponse = {
  settings: DashboardHealthConfigDTO;
};

export type UpdateDashboardHealthConfigRequest =
  Partial<DashboardHealthConfigDTO>;

export type UpdateDashboardHealthConfigResponse = {
  settings: DashboardHealthConfigDTO;
};