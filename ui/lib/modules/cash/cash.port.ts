// src/lib/modules/cash/cash.port.ts
import type {
  ActiveCashResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  CashCloseRequest,
  CashCloseResponse,
  CashCloseWarningResponse,
  CashCountRequest,
  CashCountResponse,
  OpenCashRequest,
  OpenCashResponse,
} from "./cash.dto";

export interface CashPort {
  active(): Promise<ActiveCashResponse>;

  open(input: OpenCashRequest): Promise<OpenCashResponse>;

  count(cashSessionId: string, input: CashCountRequest): Promise<CashCountResponse>;

  close(cashSessionId: string, input: CashCloseRequest): Promise<CashCloseResponse>;

  // ✅ nuevo
  closeWarning(): Promise<CashCloseWarningResponse>;

  // opcional
  authorize?(input: AuthorizeRequest): Promise<AuthorizeResponse>;

  // exports
  zReportCsv?(cashSessionId: string, qs?: { pretty?: boolean; money?: "decimal" }): Promise<string>;
  zReportPdf?(cashSessionId: string): Promise<Blob>;
}