export type CurrencyCode = "CUP" | "USD" | "EUR";
export type PaymentMethodCode = "CASH" | "CARD" | "TRANSFER" | "OTHER"; 
// ↑ ajusta a tus métodos reales del backend (los de PaymentMethod enum)

export type CashSessionStatusFilter = "open" | "closed" | "any";

export type CashSessionListRowDTO = {
  id: string;
  warehouseId: string;
  warehouseName: string;
  terminalId: string | null;
  terminalName: string | null;
  openedAt: string;
  closedAt: string | null;
  ticketsCount: number;
  grossSalesMinor: number;
  netCashMinor: number;
};

export type CashSessionsListDTO = {
  items: CashSessionListRowDTO[];
  nextCursor: string | null;
};

export type MoneyCountDTO = {
  currency: CurrencyCode;
  openingMinor: number;
  expectedMinor: number;
  countedMinor: number;
  diffMinor: number;
};

export type PaymentMixDTO = {
  method: PaymentMethodCode;
  currency: CurrencyCode;
  amountMinor: number;
};

export type CashReportSummaryDTO = {
  ticketsCount: number;
  grossSalesMinor: number;
  cashSalesMinor: number;
  refundsMinor: number;
  expensesMinor: number;
  netCashMinor: number;
  paymentsMix: PaymentMixDTO[];
  byCurrency: Array<{
    currency: CurrencyCode;
    cashSalesMinor: number;
    refundsMinor: number;
    expensesMinor: number;
    netCashMinor: number;
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
    openedById: string | null;
    closedById: string | null;
  };
  xReport: CashReportDTO;
  zArtifact: ZArtifactDTO | null;
};

export type ReportsDailyRowDTO = {
  day: string; // YYYY-MM-DD
  ticketsCount: number;
  grossSalesMinor: number;
  refundsMinor: number;
  expensesMinor: number;
  netMinor: number;
};

export type ReportsOverviewDTO = {
  from: string;
  to: string;

  ticketsCount: number;
  grossSalesMinor: number;
  refundsMinor: number;
  expensesMinor: number;
  netMinor: number;

  paymentsMix: PaymentMixDTO[];
  byCurrency: Array<{
    currency: CurrencyCode;
    grossMinor: number;
    refundsMinor: number;
    expensesMinor: number;
    netMinor: number;
  }>;
};


// queries/responses
export type ListCashSessionsQuery = {
  status?: CashSessionStatusFilter;
  from?: string | null;
  to?: string | null;
  take?: number;
  cursor?: string | null;
};


export type AdminCashSessionsListResponse = CashSessionsListDTO;
export type AdminCashSessionDetailResponse = { detail: CashSessionAdminDetailDTO };

export type AdminDailySummaryResponse = { rows: ReportsDailyRowDTO[] };

export type AdminOverviewResponse = { overview: ReportsOverviewDTO };

export type AdminDailySummaryQuery = { from: string; to: string };
export type AdminOverviewQuery = { from: string; to: string };
