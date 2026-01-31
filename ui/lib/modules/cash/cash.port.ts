// src/lib/modules/cash/cash.port.ts
import type {
  ActiveCashResponse,
  AuthorizeRequest,
  AuthorizeResponse,
  CashCountRequest,
  CashCountResponse,
  CashCloseRequest,
  CashCloseResponse,
  OpenCashRequest,
  OpenCashResponse,
} from "./cash.dto";

export interface CashPort {
  active(): Promise<ActiveCashResponse>;
  open(input: OpenCashRequest): Promise<OpenCashResponse>;
  count(cashSessionId: string, input: CashCountRequest): Promise<CashCountResponse>;
  close(cashSessionId: string, input: CashCloseRequest): Promise<CashCloseResponse>;

  // si quieres traer authorize al mismo módulo cash (opcional)
  authorize?(input: AuthorizeRequest): Promise<AuthorizeResponse>;

  // exports (si existen en backend; puedes dejarlos o borrarlos)
  zReportCsv?(cashSessionId: string, qs?: { pretty?: boolean; money?: "decimal" }): Promise<string>;
  zReportPdf?(cashSessionId: string): Promise<Blob>;
}
