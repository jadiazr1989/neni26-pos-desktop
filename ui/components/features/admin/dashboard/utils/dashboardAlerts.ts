// src/modules/admin/dashboard/utils/dashboardAlerts.ts
import type { DashboardAlertDTO } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export function pickTopAlerts(alerts: DashboardAlertDTO[], max: number): DashboardAlertDTO[] {
  const weight = (s: DashboardAlertDTO["severity"]) => (s === "critical" ? 2 : s === "warning" ? 1 : 0);
  const sorted = [...alerts].sort((a, b) => weight(b.severity) - weight(a.severity));
  return sorted.slice(0, clampInt(max, 1, 10));
}

export function labelForSeverity(s: DashboardAlertDTO["severity"]): string {
  if (s === "critical") return "CRÍTICO";
  if (s === "warning") return "ADVERTENCIA";
  return "INFO";
}