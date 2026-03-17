// src/lib/modules/cash/cash.dto.ts

// ✅ alineado con backend/Prisma
export type CurrencyCode = "CUP" | "USD" | "EUR";

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "TRANSFER"
  | "MIXED"
  | "OTHER";

// minor units por moneda
export type MoneyByCurrencyMinorDTO = Record<CurrencyCode, number>;

export type CashSessionStatus = "OPEN" | "CLOSED";

export type CashSessionOpenReason =
  | "START_OF_DAY"
  | "SHIFT_START"
  | "REOPEN"
  | "RECOVERY";

export type CashSessionCloseReason =
  | "END_OF_DAY"
  | "SHIFT_END"
  | "CASH_DROP"
  | "AUDIT"
  | "SYSTEM"
  | "OTHER";

export type CashCloseWarningLevel = "none" | "info" | "warning" | "critical";

export type ActiveCashResponse = {
  cashSession: CashSessionDTO | null;
};

export type OpenCashRequest = {
  opening: MoneyByCurrencyMinorDTO;
  authorizationId?: string;
  openReason?: CashSessionOpenReason | null;
  shiftLabel?: string | null;
};

export type CashSessionDTO = {
  id: string;
  warehouseId: string;
  terminalId: string | null;
  openedAt: string;
  openedById?: string | null;
  closedAt: string | null;

  // ✅ nuevos
  businessDay?: string | null;
  status?: CashSessionStatus | null;
  openReason?: CashSessionOpenReason | null;
  closeReason?: CashSessionCloseReason | null;
  shiftLabel?: string | null;

  // compat
  closedById?: string | null;
};

export type OpenCashResponse = {
  cashSessionId: string;
  cashSession: CashSessionDTO;
};

export type CashCounted = Partial<Record<CurrencyCode, number>>;

export type CashCountRequest = {
  counted: CashCounted;
};

export type CashCountSnapshotDTO = {
  currency: CurrencyCode;
  openingMinor: number;
  expectedMinor: number;
  countedMinor: number;
  diffMinor: number;
};

export type CashReportPaymentsMixRowDTO = {
  method: PaymentMethod | string;
  currency: CurrencyCode;
  amountMinor: number;
};

export type CashReportByCurrencyRowDTO = {
  currency: CurrencyCode;
  cashSalesMinor: number;
  refundsMinor: number;
  expensesMinor: number;
  netCashMinor: number;
};

export type CashReportSummaryDTO = {
  ticketsCount: number;
  grossSalesMinor: number;
  cashSalesMinor: number;
  refundsMinor: number;
  expensesMinor: number;
  netCashMinor: number;
  paymentsMix: CashReportPaymentsMixRowDTO[];
  byCurrency: CashReportByCurrencyRowDTO[];
};

export type CashCountReportDTO = {
  cashSession: {
    id: string;
    warehouseId: string;
    terminalId: string | null;
    openedAt: string;
    closedAt: string | null;
    openedById?: string | null;
    closedById?: string | null;

    // ✅ nuevos
    businessDay?: string | null;
    status?: CashSessionStatus | null;
    openReason?: CashSessionOpenReason | null;
    closeReason?: CashSessionCloseReason | null;
    shiftLabel?: string | null;
  };
  counts: CashCountSnapshotDTO[];
  summary: CashReportSummaryDTO;
};

export type CashCountResponse = {
  report: CashCountReportDTO;
};

export type CashCloseRequest = {
  counted: CashCounted;
  closeReason?: CashSessionCloseReason | null;
};

export type CashCloseResponse = {
  cashSession: {
    id: string;
    terminalId: string | null;
    warehouseId: string;
    openedAt: string;
    closedAt: string;
    closedById: string | null;
    counts: CashCountSnapshotDTO[];

    // ✅ nuevos
    businessDay?: string | null;
    status?: CashSessionStatus | null;
    openReason?: CashSessionOpenReason | null;
    closeReason?: CashSessionCloseReason | null;
    shiftLabel?: string | null;
  };
};

// Authorization
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

export type CashBusinessHoursDTO = {
  timeZone?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  lastOpenAt?: string | null;
  warnBeforeMinutes?: number[] | null;
  allowMultipleSessionsPerDay?: boolean | null;
};

export type CashCloseWarningDTO = {
  level: CashCloseWarningLevel;
  isWithinOperatingWindow: boolean;
  canOpenNow: boolean;
  minutesUntilClose: number | null;
  businessDay: string | null;
  closesAt: string | null;
  message: string | null;
  config: CashBusinessHoursDTO | null;
};

export type CashCloseWarningResponse = {
  warning: CashCloseWarningDTO;
};

// compat
export type CashMode = "COUNT" | "CLOSE";