"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Wallet,
  Plus,
  ArrowRight,
  AlertTriangle,
  ShoppingCart,
  ClipboardList,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { useAdminDashboard } from "./hooks/useAdminDashboard";

import { DashboardTrendChart } from "./ui/charts/DashboardTrendChart";
import { buildDashboardVM, makeDateTimeFormatter, makeMoneyFormatter, TopProductVM } from "./ui/presenter/admin-dashboard.presenter";
import { DashboardHeader } from "./ui/DashboardHeader";
import { DashboardScopeBadges } from "./ui/DashboardScopeBadges";
import { KpiCard } from "./ui/KpiCard";
import { buildProductDetailHref } from "./routing/dashboard-links";
import { MiniAlert } from "./ui/MiniAlert";
import { QuickAction } from "./ui/QuickAction";
import { EmptyBlock } from "./ui/EmptyBlock";



export function AdminDashboardScreen() {
  const router = useRouter();
  const [range, setRange] = React.useState<AdminDashboardRange>("today");

  const { data, loading, refresh } = useAdminDashboard(range);

  const money = React.useMemo(() => makeMoneyFormatter("es-CU", "CUP"), []);
  const dateTime = React.useMemo(() => makeDateTimeFormatter("es-ES"), []);

  const vm = React.useMemo(() => {
    if (!data) return null;
    return buildDashboardVM({ data, money, dateTime });
  }, [data, money, dateTime]);

  function onTopProductClick(p: TopProductVM) {
    if (!p.productId) return;
    router.push(buildProductDetailHref(p.productId, { variantId: p.variantId }));
  }

  return (
    <div className="space-y-4">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        onRefresh={refresh}
        loading={loading}
        onReports={() => router.push("/admin/reports")}
        onGoProducts={() => router.push("/admin/products")}
        component={vm && <DashboardScopeBadges storeId={data!.scope.storeId}
          warehouseId={data!.scope.warehouseId} />}
      />

      <div className="grid gap-3 md:grid-cols-3">
        <MiniAlert
          icon={AlertTriangle}
          title="Ajustes de stock"
          value={vm?.alerts.pendingAdjustments ?? 0}
          hint="Correcciones manuales (conteo, roturas, etc.)"
          onClick={() => router.push("/admin/adjustments")}
        />

        <MiniAlert
          icon={ShoppingCart}
          title="Compras pendientes"
          value={vm?.alerts.purchasesDraft ?? 0}
          hint="Aún no entran al stock"
          onClick={() => router.push("/admin/purchases?status=DRAFT")}
        />

        <MiniAlert
          icon={ClipboardList}
          title="Compras en camino"
          value={vm?.alerts.purchasesOrdered ?? 0}
          hint="Esperando entrada al almacén"
          onClick={() => router.push("/admin/purchases?status=ORDERED")}
        />
      </div>


      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title={vm?.kpis[0]?.title ?? "Ventas netas"} value={vm?.kpis[0]?.value ?? "—"} hint={vm?.kpis[0]?.hint ?? ""} tone={vm?.kpis[0]?.tone} />
        <KpiCard title={vm?.kpis[1]?.title ?? "Tickets"} value={vm?.kpis[1]?.value ?? "—"} hint={vm?.kpis[1]?.hint ?? ""} />
        <KpiCard title={vm?.kpis[2]?.title ?? "Ticket promedio"} value={vm?.kpis[2]?.value ?? "—"} hint={vm?.kpis[2]?.hint ?? ""} />
        <KpiCard title="Caja" value={vm?.cash.label ?? "—"} hint={vm?.cash.hint ?? ""} tone={vm?.cash.tone} />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tendencia</CardTitle>
            <div className="text-xs text-muted-foreground">Bar: tickets · Line: ventas netas</div>
          </CardHeader>
          <CardContent>
            {vm ? (
              <DashboardTrendChart data={vm.trend} />
            ) : (
              <EmptyBlock loading={loading} label="Cargando tendencia..." />
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <QuickAction icon={Plus} title="Crear producto" subtitle="Alta rápida en catálogo" onClick={() => router.push("/admin/products/new")} />
              <QuickAction icon={Package} title="Ajustar inventario" subtitle="Movimientos/correcciones" onClick={() => router.push("/admin/inventory")} />
              <QuickAction icon={Wallet} title="Caja" subtitle="Sesiones/cierres" onClick={() => router.push("/admin/cash")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!vm ? (
                <EmptyBlock loading={loading} label="Cargando top productos..." />
              ) : vm.topProducts.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sin datos en este rango.</div>
              ) : (
                vm.topProducts.map((p) => (
                  <button
                    key={p.variantId}
                    onClick={() => onTopProductClick(p)}
                    className="w-full text-left flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 hover:bg-accent/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.qty} uds · {money(p.revenueBaseMinor)}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pagos por método</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!vm ? (
                <EmptyBlock loading={loading} label="Cargando pagos..." />
              ) : vm.paymentsByMethod.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sin pagos registrados.</div>
              ) : (
                vm.paymentsByMethod.map((p) => (
                  <div key={p.method} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="text-sm">{p.method}</div>
                    <div className="text-sm font-medium tabular-nums">
                      {p.amountLabel} <span className="text-xs text-muted-foreground">({p.count})</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}