// src/lib/modules/admin/dashboard/admin-dashboard.port.ts
import type { AdminDashboardQuery, GetAdminDashboardResponse } from "./admin-dashboard.dto";

export interface AdminDashboardPort {
  getDashboard(q?: AdminDashboardQuery): Promise<GetAdminDashboardResponse>;
}
