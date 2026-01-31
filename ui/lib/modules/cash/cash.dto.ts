// src/lib/modules/cash/cash.dto.ts

export type CurrencyCode = "CUP" | "USD";

// minor units por moneda (centavos)
export type MoneyByCurrencyMinorDTO = Record<CurrencyCode, number>;

export type ActiveCashResponse = {
  cashSession: CashSessionDTO | null;
};

export type OpenCashRequest = {
  opening: MoneyByCurrencyMinorDTO;
  authorizationId?: string; // opcional
};

export type CashSessionDTO = {
  id: string;
  warehouseId: string;
  terminalId: string;
  openedAt: string;
  openedById: string;
  closedAt: string | null;
};

export type OpenCashResponse = {
  cashSessionId: string;
  cashSession: CashSessionDTO;
};

export type CashCounted = Partial<Record<CurrencyCode, number>>;
export type CashCountRequest = { counted: CashCounted };

export type CashCountReportDTO = {
  cashSession: {
    id: string;
    warehouseId: string;
    terminalId: string;
    openedAt: string;
    closedAt: string | null;
    openedById?: string;
    closedById?: string;
  };
  counts: Array<{
    currency: string; // backend lo manda string (puede venir CUP/USD y futuro otros)
    openingMinor: number;
    expectedMinor: number;
    countedMinor: number;
    diffMinor: number;
  }>;
  summary: {
    ticketsCount: number;
    grossSalesMinor: number;
    cashSalesMinor: number;
    refundsMinor: number;
    expensesMinor: number;
    netCashMinor: number;
    paymentsMix: Array<{ method: string; currency: string; amountMinor: number }>;
    byCurrency: Array<{
      currency: string;
      cashSalesMinor: number;
      refundsMinor: number;
      expensesMinor: number;
      netCashMinor: number;
    }>;
  };
};

export type CashCountResponse = { report: CashCountReportDTO };

export type CashCloseRequest = { counted: CashCounted };

export type CashCloseResponse = {
  cashSession: {
    id: string;
    terminalId: string;
    warehouseId: string;
    openedAt: string;
    closedAt: string;
    closedById: string;
    counts: Array<{
      currency: string;
      openingMinor: number;
      expectedMinor: number;
      countedMinor: number;
      diffMinor: number;
    }>;
  };
};

// Authorization (si quieres meterlo en el módulo cash o dejarlo en auth)
export type AuthorizationScope = "OPEN_CASH" | "CLOSE_CASH" | "VOID_SALE";

export type UserRole = "ADMIN" | "MANAGER" | "CASHIER";

export type AuthorizationDTO = {
  id: string;
  scope: AuthorizationScope;
  terminalId: string;
  expiresAt: string;
  authorizedBy: { id: string; role: UserRole };
  requestedBy: { id: string; role: UserRole };
};

export type AuthorizeRequest = {
  username: string;
  password: string;
  scope: AuthorizationScope;
  reason?: string | null;
};

export type AuthorizeResponse = {
  authorization: AuthorizationDTO;
};

// src/lib/modules/cash/cash.dto.ts
export type CashMode = "COUNT" | "CLOSE";


// (si ya existen, solo asegúrate de exportarlos con estos nombres)

