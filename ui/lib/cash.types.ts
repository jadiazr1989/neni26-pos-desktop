

export type LoginRequest = { username: string; password: string };



export type Terminal = {
  id: string;
  warehouseId: string;
  name: string;
  code: string | null;
  hostname: string | null;
  ipAddress: string | null;
  isActive: boolean;
  createdAt: string; // si viene ISO desde API
  updatedAt: string;
};

export type TerminalsListResponse = { terminals: Terminal[] };

export type HandshakeRequest = {
  warehouseId: string;
  code: string;
  name: string;
  hostname: string;
};

export type HandshakeResponse = { terminal: Terminal };

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
}

export type UserBase = {
  id: string;
  username: string;
  role: UserRole;
};

export type LoginResponse = {
  user: UserBase;
};

export type MeUser = UserBase & {
  isActive: boolean;
};

export type MeResponse = {
  user: MeUser;
};

// src/lib/cash.types.ts

export type ActiveCashResponseDTO = {
  cashSession: CashSessionDTO | null;
};


export type MoneyByCurrency = Record<CurrencyCode, number>;


export type CurrencyCode = "CUP" | "USD";
export type OpenCashRequestDTO = {
  opening: Record<CurrencyCode, number>;
  authorizationId?: string; // ✅ opcional
};

export type CashSessionDTO = {
  id: string;
  warehouseId: string;
  terminalId: string;
  openedAt: string;
  openedById: string;
  closedAt: string | null;
};

export type OpenCashResponseDTO = {
  cashSessionId: string;
  cashSession: CashSessionDTO;
};

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
    currency: string; // ideal CurrencyCode | "EUR" si tu API lo permite
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

export type CashCountResponseDTO = { report: CashCountReportDTO };

export type CashCloseResponseDTO = {
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


export type AuthorizationScope = "OPEN_CASH" | "CLOSE_CASH" | "VOID_SALE"; // ajusta

export type AuthorizationDTO = {
  id: string;
  scope: AuthorizationScope;
  terminalId: string;
  expiresAt: string;
  authorizedBy: { id: string; role: UserRole };
  requestedBy: { id: string; role: UserRole };
};

export type AuthorizeRequestDTO = {
  username: string;
  password: string;
  scope: AuthorizationScope;
  reason?: string | null;
};

export type AuthorizeResponseDTO = {
  authorization: AuthorizationDTO;
};

