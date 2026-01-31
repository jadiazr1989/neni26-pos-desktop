// src/lib/modules/cash/cash.service.ts
import type { CashPort } from "./cash.port";
import { CashHttpAdapter } from "./cash.http";
import type {
  ActiveCashResponse,
  AuthorizeRequest,
  AuthorizationDTO,
  CashCountReportDTO,
  CashCounted,
  CashSessionDTO,
  OpenCashRequest,
} from "./cash.dto";

class CashService {
  constructor(private readonly port: CashPort) {}

  async active(): Promise<CashSessionDTO | null> {
    const res: ActiveCashResponse = await this.port.active();
    return res.cashSession ?? null;
  }

  async open(input: OpenCashRequest): Promise<{ cashSessionId: string; cashSession: CashSessionDTO }> {
    const res = await this.port.open(input);
    return { cashSessionId: res.cashSessionId, cashSession: res.cashSession };
  }

  async count(cashSessionId: string, counted: CashCounted): Promise<CashCountReportDTO> {
    const res = await this.port.count(cashSessionId, { counted });
    return res.report;
  }

  async close(
    cashSessionId: string,
    counted: CashCounted
  ): Promise<{
    id: string;
    terminalId: string;
    warehouseId: string;
    openedAt: string;
    closedAt: string;
    closedById: string;
    counts: Array<{ currency: string; openingMinor: number; expectedMinor: number; countedMinor: number; diffMinor: number }>;
  }> {
    const res = await this.port.close(cashSessionId, { counted });
    return res.cashSession;
  }

  // opcional: unify authorize
  async authorize(payload: AuthorizeRequest): Promise<AuthorizationDTO> {
    if (!this.port.authorize) throw new Error("authorize not supported by this port");
    const res = await this.port.authorize(payload);
    return res.authorization;
  }

  async zReportCsv(cashSessionId: string, qs?: { pretty?: boolean; money?: "decimal" }): Promise<string> {
    if (!this.port.zReportCsv) throw new Error("zReportCsv not supported by this port");
    return this.port.zReportCsv(cashSessionId, qs);
  }

  async zReportPdf(cashSessionId: string): Promise<Blob> {
    if (!this.port.zReportPdf) throw new Error("zReportPdf not supported by this port");
    return this.port.zReportPdf(cashSessionId);
  }
}

export const cashService = new CashService(new CashHttpAdapter());
