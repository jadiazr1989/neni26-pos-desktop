// src/lib/modules/admin/dashboard/admin-dashboard.http.ts
import { apiClient } from "@/lib/api/apiClient";
import type { AdminDashboardPort } from "./admin-dashboard.port";
import type { AdminDashboardQuery, GetAdminDashboardResponse } from "./admin-dashboard.dto";

function toQuery(q?: AdminDashboardQuery): string {
  if (!q) return "";
  const qs = new URLSearchParams();
  if (q.range) qs.set("range", q.range);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

export class AdminDashboardHttpAdapter implements AdminDashboardPort {
  async getDashboard(opts?: AdminDashboardQuery): Promise<GetAdminDashboardResponse> {
    return apiClient.json(`/api/v1/admin/dashboard${toQuery(opts)}`, { method: "GET" });
  }
}
