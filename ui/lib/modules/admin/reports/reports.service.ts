import type { AdminReportsPort } from "./reports.port";
import { AdminReportsHttpAdapter } from "./reports.http";

import type {
  CashSessionAdminDetailDTO,
  CashSessionsListDTO,
  ListCashSessionsQuery,
  ReportsAlertsDTO,
  ReportsDailyRowDTO,
  ReportsOverviewDTO,
} from "./reports.dto";

class AdminReportsService {
  constructor(private readonly port: AdminReportsPort) { }

  async listCashSessions(q?: ListCashSessionsQuery): Promise<CashSessionsListDTO> {
    return this.port.listCashSessions(q);
  }

  async cashSessionDetail(id: string): Promise<CashSessionAdminDetailDTO> {
    const res = await this.port.cashSessionDetail(id);
    return res.detail;
  }

  async dailySummary(params: { from: string; to: string }): Promise<ReportsDailyRowDTO[]> {
    const res = await this.port.dailySummary({ from: params.from, to: params.to });
    return res.rows;
  }

  async overview(params: { from: string; to: string }): Promise<ReportsOverviewDTO> {
    const res = await this.port.overview({ from: params.from, to: params.to });
    return res.overview;
  }

  async alerts(params: { from: string; to: string }): Promise<ReportsAlertsDTO> {
    return this.port.alerts({ from: params.from, to: params.to });
  }
}

export const adminReportsService = new AdminReportsService(new AdminReportsHttpAdapter());

