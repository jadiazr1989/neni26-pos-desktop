import { MoneyStr } from "@/lib/money/moneyStr";


export type CurrencyCode = "CUP" | "USD" | "EUR";
export type PaymentMethodCode = "CASH" | "CARD" | "TRANSFER" | "OTHER";

export type CashSessionStatusFilter = "open" | "closed" | "any";
export type UserRoleCode = "ADMIN" | "MANAGER" | "CASHIER";

export type UserLiteDTO = {
  id: string;
  username: string;
  displayName: string | null;
  role: UserRoleCode;
};

export type CashSessionOperatorDTO = {
  userId: string;

  // actividad “ventas” (quién creó el ticket)
  ticketsCount: number;

  // montos base (BigInt->string)
  grossSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  netSalesBaseMinor: MoneyStr;

  // opcional si quieres separar “cash handling”
  cashSalesBaseMinor?: MoneyStr;
  expensesBaseMinor?: MoneyStr;
};

export type CashSessionListRowDTO = {
  id: string;
  warehouseId: string;
  warehouseName: string;
  terminalId: string | null;
  terminalName: string | null;
  openedAt: string;
  closedAt: string | null;

  ticketsCount: number;

  // ✅ base minor BigInt serialized to string
  grossSalesBaseMinor: MoneyStr;
  netCashBaseMinor: MoneyStr;
};

export type CashSessionsListDTO = {
  items: CashSessionListRowDTO[];
  nextCursor: string | null;
};

export type MoneyCountDTO = {
  currency: CurrencyCode;

  // Conteos físicos en la moneda (minor int) -> number está OK
  openingMinor: number;
  expectedMinor: number;
  countedMinor: number;
  diffMinor: number;
};

export type PaymentMixDTO = {
  method: PaymentMethodCode;
  currency: CurrencyCode;

  // amount in payment currency minor (int)
  amountMinor: number;

  // ✅ base minor BigInt serialized to string
  amountBaseMinor: MoneyStr;
};

export type CashReportSummaryDTO = {
  ticketsCount: number;

  // ✅ todo lo “summary financiero” debe ser base
  grossSalesBaseMinor: MoneyStr;
  cashSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  expensesBaseMinor: MoneyStr;
  netCashBaseMinor: MoneyStr;

  paymentsMix: PaymentMixDTO[];

  byCurrency: Array<{
    currency: CurrencyCode;

    // esto puede ser útil para desglose, pero mantén base para que cuadre con overview
    cashSalesBaseMinor: MoneyStr;
    refundsBaseMinor: MoneyStr;
    expensesBaseMinor: MoneyStr;
    netCashBaseMinor: MoneyStr;
  }>;
};

export type CashReportDTO = {
  cashSession: {
    id: string;
    warehouseId: string;
    terminalId: string | null;
    openedAt: string;
    closedAt: string | null;
  };
  counts: MoneyCountDTO[];
  summary: CashReportSummaryDTO;
};

export type ZArtifactDTO = {
  cashSessionId: string;
  report: CashReportDTO;
  labels: {
    storeName: string;
    storeSlug: string;
    warehouseCode: string;
    warehouseName: string;
    terminalCode: string;
    terminalName: string;
    host: string | null;
    ip: string | null;
    signedByUsername: string | null;
    signedByDisplayName: string | null;
    signedByRole: string | null;
    zNumber: string | null;
    tz: string | null;
  };
  reportHash: string;
  hashAlgo: string;
  signedAt: string;
  signedById: string | null;
  previousHash: string | null;
};

export type CashSessionAdminDetailDTO = {
  cashSession: {
    id: string;
    warehouseId: string;
    warehouseName: string;
    terminalId: string | null;
    terminalName: string | null;
    openedAt: string;
    closedAt: string | null;

    // siguen existiendo (IDs)
    openedById: string | null;
    closedById: string | null;
  };

  // ✅ NUEVO: usuarios relevantes para render rápido
  usersById: Record<string, UserLiteDTO>;

  // ✅ NUEVO: “quién operó” + “cuánto vendió cada uno”
  operators: CashSessionOperatorDTO[];

  xReport: CashReportDTO;
  zArtifact: ZArtifactDTO | null;
};

export type ReportsDailyRowDTO = {
  day: string; // YYYY-MM-DD
  ticketsCount: number;

  grossSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  expensesBaseMinor: MoneyStr;
  netBaseMinor: MoneyStr;
};

// queries/responses
export type ListCashSessionsQuery = {
  status?: CashSessionStatusFilter;
  from?: string | null;
  to?: string | null;
  take?: number;
  cursor?: string | null;
};

export type ReportsAlertSeverity = "info" | "warning" | "critical";

export type ReportsAlertDTO = {
  id: string;
  severity: ReportsAlertSeverity;
  title: string;
  description: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type ReportsAlertsDTO = {
  from: string;
  to: string;
  terminalId: string;
  alerts: ReportsAlertDTO[];
};

export type PaymentMixSummaryDTO = {
  totalsBaseMinor: Record<PaymentMethodCode, MoneyStr>;
  pctBps: Record<PaymentMethodCode, number>; // 0..10000
};

export type ReportsOverviewDTO = {
  from: string;
  to: string;

  ticketsCount: number;

  grossSalesBaseMinor: MoneyStr;
  refundsBaseMinor: MoneyStr;
  netBaseMinor: MoneyStr;

  // ✅ new
  avgTicketBaseMinor: MoneyStr;
  taxBaseMinor: MoneyStr;

  // sigue existiendo
  expensesBaseMinor: MoneyStr;

  paymentsMix: PaymentMixDTO[];

  // ✅ new
  paymentsMixSummary: PaymentMixSummaryDTO;

  byCurrency: Array<{
    currency: CurrencyCode;
    grossBaseMinor: MoneyStr;
    refundsBaseMinor: MoneyStr;
    expensesBaseMinor: MoneyStr;
    taxBaseMinor: MoneyStr;
    netBaseMinor: MoneyStr;
  }>;
};

export type AdminAlertsResponse = ReportsAlertsDTO;
export type AdminAlertsQuery = { from: string; to: string };

export type AdminCashSessionsListResponse = CashSessionsListDTO;
export type AdminCashSessionDetailResponse = { detail: CashSessionAdminDetailDTO };
export type AdminDailySummaryResponse = { rows: ReportsDailyRowDTO[] };
export type AdminOverviewResponse = { overview: ReportsOverviewDTO };

export type AdminDailySummaryQuery = { from: string; to: string };
export type AdminOverviewQuery = { from: string; to: string };