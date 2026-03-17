// src/lib/modules/cash/cash.service.ts
import type { CashPort } from "./cash.port";
import { CashHttpAdapter } from "./cash.http";

import type {
  ActiveCashResponse,
  AuthorizeRequest,
  AuthorizationDTO,
  CashCloseWarningDTO,
  CashCountReportDTO,
  CashCounted,
  CashSessionCloseReason,
  CashSessionDTO,
  CashSessionOpenReason,
  OpenCashRequest,
} from "./cash.dto";

type CashCloseResult = {
  id: string;
  terminalId: string | null;
  warehouseId: string;
  openedAt: string;
  closedAt: string;
  closedById: string | null;
  counts: Array<{
    currency: string;
    openingMinor: number;
    expectedMinor: number;
    countedMinor: number;
    diffMinor: number;
  }>;
  businessDay?: string | null;
  status?: "OPEN" | "CLOSED" | null;
  openReason?: CashSessionOpenReason | null;
  closeReason?: CashSessionCloseReason | null;
  shiftLabel?: string | null;
};

class CashService {
  constructor(private readonly port: CashPort) {}

  async active(): Promise<CashSessionDTO | null> {
    const res: ActiveCashResponse = await this.port.active();
    return res.cashSession ?? null;
  }

  async open(input: OpenCashRequest): Promise<{
    cashSessionId: string;
    cashSession: CashSessionDTO;
  }> {
    const res = await this.port.open(input);
    return {
      cashSessionId: res.cashSessionId,
      cashSession: res.cashSession,
    };
  }

  async count(cashSessionId: string, counted: CashCounted): Promise<CashCountReportDTO> {
    const res = await this.port.count(cashSessionId, { counted });
    return res.report;
  }

  async close(
    cashSessionId: string,
    counted: CashCounted,
    options?: {
      closeReason?: CashSessionCloseReason | null;
    }
  ): Promise<CashCloseResult> {
    const res = await this.port.close(cashSessionId, {
      counted,
      closeReason: options?.closeReason ?? null,
    });

    return res.cashSession;
  }

  // ✅ nuevo
  async closeWarning(): Promise<CashCloseWarningDTO> {
    const res = await this.port.closeWarning();
    return res.warning;
  }

  async authorize(payload: AuthorizeRequest): Promise<AuthorizationDTO> {
    if (!this.port.authorize) {
      throw new Error("authorize not supported by this port");
    }

    const res = await this.port.authorize(payload);
    return res.authorization;
  }

  async zReportCsv(
    cashSessionId: string,
    qs?: { pretty?: boolean; money?: "decimal" }
  ): Promise<string> {
    if (!this.port.zReportCsv) {
      throw new Error("zReportCsv not supported by this port");
    }

    return this.port.zReportCsv(cashSessionId, qs);
  }

  async zReportPdf(cashSessionId: string): Promise<Blob> {
    if (!this.port.zReportPdf) {
      throw new Error("zReportPdf not supported by this port");
    }

    return this.port.zReportPdf(cashSessionId);
  }
}

export const cashService = new CashService(new CashHttpAdapter());