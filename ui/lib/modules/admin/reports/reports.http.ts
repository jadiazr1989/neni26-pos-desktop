import { apiClient } from "@/lib/api/apiClient";
import type { AdminReportsPort } from "./reports.port";
import type {
  AdminCashSessionsListResponse,
  AdminCashSessionDetailResponse,
  AdminDailySummaryQuery,
  AdminDailySummaryResponse,
  AdminOverviewQuery,
  AdminOverviewResponse,
  ListCashSessionsQuery,
  AdminAlertsQuery,
  AdminAlertsResponse,
} from "./reports.dto";

type QueryValue = string | number | boolean | null | undefined;

function toQuery(params?: Record<string, QueryValue>): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class AdminReportsHttpAdapter implements AdminReportsPort {
  listCashSessions(q?: ListCashSessionsQuery): Promise<AdminCashSessionsListResponse> {
    return apiClient.json(`/api/v1/admin/reports/cash-sessions${toQuery(q)}`, { method: "GET" });
  }

  cashSessionDetail(id: string): Promise<AdminCashSessionDetailResponse> {
    return apiClient.json(`/api/v1/admin/reports/cash-sessions/${encodeURIComponent(id)}`, { method: "GET" });
  }

  dailySummary(q: AdminDailySummaryQuery): Promise<AdminDailySummaryResponse> {
    return apiClient.json(`/api/v1/admin/reports/summary/daily${toQuery(q)}`, { method: "GET" });
  }

  overview(q: AdminOverviewQuery): Promise<AdminOverviewResponse> {
    return apiClient.json(`/api/v1/admin/reports/summary/overview${toQuery(q)}`, { method: "GET" });
  }

  alerts(q: AdminAlertsQuery): Promise<AdminAlertsResponse> {
    return apiClient.json<AdminAlertsResponse>(`/api/v1/admin/reports/summary/alerts?from=${encodeURIComponent(q.from)}&to=${encodeURIComponent(q.to)}`);
  }
}

