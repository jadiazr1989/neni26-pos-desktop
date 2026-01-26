// src/lib/modules/admin/dashboard/admin-dashboard.service.ts
import type { AdminDashboardQuery, GetAdminDashboardResponse } from "./admin-dashboard.dto";
import { AdminDashboardHttpAdapter } from "./admin-dashboard.http";
import type { AdminDashboardPort } from "./admin-dashboard.port";

export class AdminDashboardService {
  constructor(private readonly port: AdminDashboardPort) {}

  async getDashboard(opts?: AdminDashboardQuery): Promise<GetAdminDashboardResponse> {
    return this.port.getDashboard(opts);
  }
}

export const adminDashboardService = new AdminDashboardService(new AdminDashboardHttpAdapter());
