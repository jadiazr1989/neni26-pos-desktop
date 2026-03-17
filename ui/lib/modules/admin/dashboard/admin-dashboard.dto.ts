// src/lib/modules/admin/dashboard/admin-dashboard.dto.ts
// ✅ Aligned with backend: AdminDashboardData (V3 enterprise)

import { SellUnit } from "../../catalog/products/product.dto";

export type AdminDashboardRange = "today" | "7d" | "30d";

export type AdminDashboardQuery = {
  range?: AdminDashboardRange;
  warehouseId?: string;
};

export type MoneyStr = string;

export type DashboardScopeDTO = {
  storeId: string;
  warehouseId: string | null;
};

export type DashboardPeriodDTO = {
  range: AdminDashboardRange;
  from: string;
  to: string;
  tz: string;
};

// -------------------- Health --------------------

export type DashboardHealthStatus = "OK" | "WARNING" | "CRITICAL";

export type DashboardHealthDriverKey =
  | "grossMarginPct"
  | "refundRate"
  | "discountRate"
  | "cashVariance"
  | "inventoryRuptures"
  | "inventoryLowStock"
  | "inventoryOverstock"
  | "inventorySlowMoving"
  | "openOrdersAging"
  | "pendingAdjustments"
  | "openCashSessions";

export type DashboardHealthDriverDTO = {
  key: DashboardHealthDriverKey;
  label: string;
  severity: "info" | "warning" | "critical";
  scoreImpact: number;
  meta?: Record<string, string | number | boolean | null>;
};

export type DashboardHealthDTO = {
  score: number;
  status: DashboardHealthStatus;
  drivers: DashboardHealthDriverDTO[];
};

// -------------------- Executive KPIs --------------------

export type DashboardKpisDTO = {
  ticketsCount: number;

  itemsCount: number;
  itemsPerTicketBps: number;

  grossSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  refundsCount: number;
  refundRateBps: number;

  netSalesBaseMinor: MoneyStr;

  avgTicketBaseMinor: MoneyStr;
  netSalesPerDayBaseMinor: MoneyStr;

  taxBaseMinor: MoneyStr;
  taxRateBps: number;

  discountsBaseMinor: MoneyStr;
  discountRateBps: number;

  cogsBaseMinor: MoneyStr;
  grossMarginBaseMinor: MoneyStr;
  grossMarginPctBps: number;
};

// -------------------- Cash control --------------------

export type DashboardCashDrawerDTO = {
  hasActiveSession: boolean;
  activeSessionId: string | null;
  openedAt: string | null;
  terminalId: string | null;
  warehouseId: string | null;

  cashSalesBaseMinor: MoneyStr;
  cashRefundsBaseMinor: MoneyStr;
  expensesBaseMinor: MoneyStr;

  netCashBaseMinor: MoneyStr;

  cashShareBps: number;
  cashSessionsClosedCount: number;
  cashSessionsOpenCount: number;
  avgSessionDurationMinutes: number;

  cashVarianceMaxAbsMinor: number;
  cashVarianceTotalAbsMinor: number;
  cashVarianceCount: number;
};

// -------------------- Payments mix --------------------

export type DashboardPaymentsByMethodRowDTO = {
  method: "CASH" | "CARD" | "TRANSFER" | "OTHER";
  amountBaseMinor: MoneyStr;
  count: number;
  pctBps: number;
};

export type DashboardPaymentsByMethodDTO = DashboardPaymentsByMethodRowDTO[];

// -------------------- Trend --------------------

export type DashboardTrendPointDTO = {
  bucket: "day" | "hour";
  day: string;

  grossSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  refundsCount: number;

  discountsBaseMinor: MoneyStr;

  netSalesBaseMinor: MoneyStr;

  cogsBaseMinor: MoneyStr;
  grossMarginBaseMinor: MoneyStr;
  grossMarginPctBps: number;

  ticketsCount: number;
  itemsCount: number;

  avgTicketBaseMinor: MoneyStr;
};

// -------------------- Products / Profitability --------------------

export type DashboardTopProductDTO = {
  variantId: string;
  sku: string;
  title: string;
  productName: string;

  qtyBaseMinor: string;
  displayUnit: SellUnit;
  qtyDisplay: string;

  revenueBaseMinor: string;
  profitBaseMinor: string;
  marginPctBps: number;
};

export type DashboardProfitabilityRowDTO = DashboardTopProductDTO;

export type DashboardProfitabilityDTO = {
  topProfitProducts: DashboardProfitabilityRowDTO[];
  topMarginPctProducts: DashboardProfitabilityRowDTO[];
  highRevenueLowMargin: DashboardProfitabilityRowDTO[];
};

// -------------------- Inventory intelligence --------------------

export type DashboardInventoryKpisDTO = {
  variantsCount: number;

  onHandCount: number;
  outOfStockCount: number;

  reservedQtyTotal: number;
  availableQtyTotal: number;

  lowStockCount: number;

  reservedVariantsCount: number;
  reservableVariantsCount: number;

  onHandValueCostBaseMinor: MoneyStr;
  availableValueCostBaseMinor: MoneyStr;
  reservedValueCostBaseMinor: MoneyStr;

  avgDaysOfCover: number;
  lowCoverCount: number;
  overCoverCount: number;
};

export type DashboardInventoryWeaknessesDTO = {
  rupturesCount: number;
  overstockCount: number;
  slowMovingCount: number;
  badThresholdsCount: number;

  overstockValueCostBaseMinor: MoneyStr;
  slowMovingValueCostBaseMinor: MoneyStr;

  rupturesImpactEstBaseMinor: MoneyStr;
  lowStockImpactEstBaseMinor: MoneyStr;
};

export type DashboardInventoryWeaknessConfigDTO = {
  lookbackDays: number;
  overstockThreshold: number;
  slowMovingSoldThreshold: number;

  lowCoverDays: number;
  overCoverDays: number;
};

export type DashboardInventoryLowStockRowDTO = {
  variantId: string;
  sku: string;
  title: string;
  productName: string;

  quantity: number;
  reservedQuantity: number;
  available: number;

  threshold: number;

  estDaysOfCover: number | null;
  estDailySold: number | null;
};

// -------------------- Purchases --------------------

export type DashboardPurchasesKpisDTO = {
  draftCount: number;
  orderedCount: number;
  receivedCount: number;

  receivedInRangeCount: number;

  openOrderedCount: number;
  openOrderedValueBaseMinor: MoneyStr;

  receivedValueBaseMinor: MoneyStr;

  openOrderedOver7dCount: number;
  openOrderedOver14dCount: number;
  avgOpenOrderAgeDays: number;

  topSuppliersBySpend?: Array<{
    supplierId: string;
    supplierName: string;
    spendBaseMinor: MoneyStr;
  }>;

  avgSupplierLeadTimeDays?: number | null;
};

// -------------------- Adjustments --------------------

export type DashboardAdjustmentsKpisDTO = {
  pendingCount: number;
  approvedInRangeCount: number;
  rejectedInRangeCount: number;

  pendingOver24hCount: number;
  pendingOver72hCount: number;
};

// -------------------- Operators --------------------

export type DashboardOperatorRowDTO = {
  userId: string;
  username: string;
  role: "ADMIN" | "MANAGER" | "CASHIER";

  ticketsCount: number;
  itemsCount: number;

  grossSalesBaseMinor: MoneyStr;
  discountsBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  refundsCount: number;

  netSalesBaseMinor: MoneyStr;
  avgTicketBaseMinor: MoneyStr;

  voidCount: number;
  voidRateBps: number;
  discountRateBps: number;
  refundRateBps: number;
};

// -------------------- Alerts & Actions --------------------

export type DashboardAlertSeverity = "info" | "warning" | "critical";

export type DashboardAlertDTO = {
  id: string;
  severity: DashboardAlertSeverity;
  title: string;
  description: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type DashboardActionDTO = {
  id: string;
  severity: DashboardAlertSeverity;
  title: string;
  impactBaseMinor: MoneyStr;
  ctaLabel: string;
  ctaRoute: string;
  meta?: Record<string, string | number | boolean | null>;
};

// -------------------- Comparison --------------------

export type DashboardComparisonDTO = {
  prevFrom: string;
  prevTo: string;

  netSalesDeltaBaseMinor: MoneyStr;
  netSalesDeltaPctBps: number;

  ticketsDelta: number;
  itemsDelta: number;

  avgTicketDeltaBaseMinor: MoneyStr;

  refundsDeltaBaseMinor: MoneyStr;
  refundsDeltaCount: number;
  refundRateDeltaBps: number;

  discountsDeltaBaseMinor: MoneyStr;
  discountRateDeltaBps: number;

  cogsDeltaBaseMinor: MoneyStr;

  grossMarginDeltaBaseMinor: MoneyStr;
  grossMarginDeltaPctBps: number;

  itemsPerTicketDeltaBps: number;
};

// -------------------- Root --------------------

export type AdminDashboardData = {
  period: DashboardPeriodDTO;
  scope: DashboardScopeDTO;

  health: DashboardHealthDTO;

  kpis: DashboardKpisDTO;
  cash: DashboardCashDrawerDTO;

  paymentsByMethod: DashboardPaymentsByMethodDTO;

  trend: DashboardTrendPointDTO[];

  profitability: DashboardProfitabilityDTO;

  inventory: {
    kpis: DashboardInventoryKpisDTO;
    lowStock: DashboardInventoryLowStockRowDTO[];
    weaknesses: DashboardInventoryWeaknessesDTO;
    weaknessesConfig: DashboardInventoryWeaknessConfigDTO;
  };

  purchases: DashboardPurchasesKpisDTO;
  adjustments: DashboardAdjustmentsKpisDTO;

  operators: DashboardOperatorRowDTO[];

  comparison: DashboardComparisonDTO;

  alerts: DashboardAlertDTO[];
  actions: DashboardActionDTO[];
};

/**
 * Compat temporal para componentes viejos.
 * Cuando termines de migrar todos los imports, puedes borrar este alias.
 */
export type AdminDashboardDataV2 = AdminDashboardData;

export type GetAdminDashboardResponse = {
  dashboard: AdminDashboardData;
};