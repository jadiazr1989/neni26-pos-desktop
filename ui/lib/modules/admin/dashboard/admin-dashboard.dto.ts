// src/lib/modules/admin/dashboard/admin-dashboard.dto.ts
export type AdminDashboardRange = "today" | "7d" | "30d";

export type AdminDashboardQuery = {
  range?: AdminDashboardRange;
};

export type AdminDashboardKpis = {
  salesNetBaseMinor: number;
  salesGrossBaseMinor: number;
  refundsBaseMinor: number;
  tickets: number;
  avgTicketBaseMinor: number;
};

export type DashboardCash = {
  hasActiveSession: boolean;
  activeSessionId: string | null;
  openedAt: string | null;
  terminalId: string | null;
  warehouseId: string | null;
};

export type DashboardPaymentsByMethod = Array<{
  method: "CASH" | "CARD" | "TRANSFER" | "OTHER";
  amountBaseMinor: number;
  count: number;
}>;

export type DashboardTopProduct = {
  variantId: string;
  productId: string; 
  sku: string;
  title: string;
  productName: string;
  qty: number;
  revenueBaseMinor: number;
};

export type DashboardTrendPoint = {
  date: string; // YYYY-MM-DD
  netBaseMinor: number;
  tickets: number;
};

export type AdminDashboardData = {
  range: AdminDashboardRange;
  from: string;
  to: string;

  scope: {
    storeId: string;
    warehouseId: string | null;
  };

  kpis: AdminDashboardKpis;
  cash: DashboardCash;

  paymentsByMethod: DashboardPaymentsByMethod;
  topProducts: DashboardTopProduct[];

  trend: DashboardTrendPoint[];

  purchases: { draft: number; ordered: number; received: number; receivedInRange: number };
  adjustments: { pending: number };
};

export type GetAdminDashboardResponse = {
  dashboard: AdminDashboardData;
};
