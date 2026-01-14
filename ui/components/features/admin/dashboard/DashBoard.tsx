// ui/components/features/admin/dashboard/AdminDashboardScreen.tsx
"use client";

import { JSX, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useSessionStore } from "@/stores/session.store";
import { AdminAlertsPanel, AdminKpiGrid, AdminMiniChartCard, AdminQuickActions } from "./ui";


export function AdminDashboardScreenOther(): JSX.Element {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);

  // MVP: datos mock / placeholders (luego lo conectas a tu API / reportes local-first)
  const data = useMemo(
    () => ({
      kpis: {
        salesToday: 0,
        ticketsToday: 0,
        discountsToday: 0,
        returnsToday: 0,
        lowStockAlerts: 0,
        cashSessionsOpen: 0,
        cashiersActive: 0,
        pendingApprovals: 0,
      },
      alerts: [
        { tone: "info" as const, title: "Sincronización", desc: "Modo local activo. Sincroniza cuando haya conexión." },
        { tone: "warning" as const, title: "Inventario", desc: "Revisar mínimos y productos inactivos antes de abrir." },
      ],
      salesLast7Days: [0, 0, 0, 0, 0, 0, 0],
    }),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header del contenido (NO topbar global, solo title del main) */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Administración</h1>
          <p className="text-xs text-muted-foreground">
            Bienvenido{user?.username ? `, ${user.username}` : ""}. Control rápido del negocio y configuración.
          </p>
        </div>

        {/* Acceso directo al POS si quieres (solo para admin/manager) */}
        <button
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent/20 transition"
          onClick={() => router.push("/pos")}
          type="button"
        >
          Ir al POS
        </button>
      </div>

      {/* KPIs */}
      <AdminKpiGrid kpis={data.kpis} />

      {/* 2 columnas: Centro (gráficas/acciones) + derecha (alertas) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <AdminQuickActions
            onCreateProduct={() => router.push("/admin/products/new")}
            onInventory={() => router.push("/admin/inventory")}
            onSales={() => router.push("/admin/sales")}
            onCash={() => router.push("/admin/cash")}
            onReports={() => router.push("/admin/reports")}
            onSettings={() => router.push("/admin/settings")}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <AdminMiniChartCard
              title="Ventas (últimos 7 días)"
              subtitle="Tendencia rápida"
              series={data.salesLast7Days}
            />

            <AdminMiniChartCard
              title="Top productos"
              subtitle="Placeholder (próximo: ranking por cantidad/importe)"
              series={[0, 0, 0, 0, 0, 0, 0]}
            />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AdminAlertsPanel items={data.alerts} />
        </div>
      </div>
    </div>
  );
}
