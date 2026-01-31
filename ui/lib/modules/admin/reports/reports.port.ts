import type {
  AdminCashSessionsListResponse,
  AdminCashSessionDetailResponse,
  AdminDailySummaryQuery,
  AdminDailySummaryResponse,
  AdminOverviewQuery,
  AdminOverviewResponse,
  ListCashSessionsQuery,
} from "./reports.dto";

export interface AdminReportsPort {
  listCashSessions(q?: ListCashSessionsQuery): Promise<AdminCashSessionsListResponse>;
  cashSessionDetail(id: string): Promise<AdminCashSessionDetailResponse>;
  dailySummary(q: AdminDailySummaryQuery): Promise<AdminDailySummaryResponse>;
  overview(q: AdminOverviewQuery): Promise<AdminOverviewResponse>;
}
