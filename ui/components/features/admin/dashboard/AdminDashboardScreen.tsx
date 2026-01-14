"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Receipt,
  BadgeDollarSign,
  Wallet,
  Plus,
  Package,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Kpi = {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
};

export function AdminDashboardScreen() {
  const router = useRouter();

  // ✅ Mock (luego lo conectamos)
  const kpis = useMemo<Kpi[]>(
    () => [
      { title: "Ventas (hoy)", value: "$ 1,245.50", hint: "+12% vs ayer", icon: BadgeDollarSign, tone: "success" },
      { title: "Tickets (hoy)", value: "38", hint: "Promedio estable", icon: Receipt },
      { title: "Ticket promedio", value: "$ 32.78", hint: "Objetivo: $35", icon: TrendingUp },
      { title: "Caja", value: "Cerrada", hint: "Abrir para vender", icon: Wallet, tone: "warning" },
    ],
    []
  );

  const topProducts = useMemo(
    () => [
      { name: "Coca Cola 355ml", qty: 24, revenue: 36.0 },
      { name: "Pan Bimbo", qty: 18, revenue: 27.0 },
      { name: "Huevos (docena)", qty: 12, revenue: 30.0 },
      { name: "Arroz 5lb", qty: 9, revenue: 31.5 },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen rápido del negocio (hoy). Usa esto para detectar problemas y actuar rápido.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/admin/reports")}>
            <BarChart3 className="mr-2 size-4" />
            Reportes
          </Button>
          <Button onClick={() => router.push("/admin/products/new")}>
            <Plus className="mr-2 size-4" />
            Producto
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.title} {...k} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Charts */}
        <Card className="lg:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ventas (últimos 7 días)</CardTitle>
            <p className="text-xs text-muted-foreground">Placeholder visual — luego lo conectamos al endpoint de reportes.</p>
          </CardHeader>
          <CardContent>
            <FakeChart />
          </CardContent>
        </Card>

        {/* Quick actions + Top products */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <QuickAction
                icon={Plus}
                title="Crear producto"
                subtitle="Alta rápida en catálogo"
                onClick={() => router.push("/admin/products/new")}
              />
              <QuickAction
                icon={Package}
                title="Ajustar inventario"
                subtitle="Movimientos y correcciones"
                onClick={() => router.push("/admin/inventory")}
              />
              <QuickAction
                icon={Wallet}
                title="Caja"
                subtitle="Sesiones / cierres / diferencias"
                onClick={() => router.push("/admin/cash")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top productos (hoy)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topProducts.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.qty} uds · ${p.revenue.toFixed(2)}
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KpiCard(props: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
}) {
  const Icon = props.icon;

  const ring =
    props.tone === "success"
      ? "ring-1 ring-emerald-500/20"
      : props.tone === "warning"
      ? "ring-1 ring-amber-500/25"
      : "ring-1 ring-border/60";

  return (
    <Card className={cn("rounded-2xl", ring)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{props.title}</div>
            <div className="text-xl font-semibold">{props.value}</div>
          </div>

          <div className="h-10 w-10 rounded-xl border border-border bg-accent/25 grid place-items-center">
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">{props.hint}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction(props: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  const Icon = props.icon;

  return (
    <button
      onClick={props.onClick}
      className="w-full text-left rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors px-3 py-3"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl border border-border bg-background grid place-items-center">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{props.title}</div>
          <div className="text-xs text-muted-foreground truncate">{props.subtitle}</div>
        </div>
      </div>
    </button>
  );
}

function FakeChart() {
  // Placeholder que se ve “pro” sin librerías.
  return (
    <div className="h-56 rounded-xl border border-border bg-gradient-to-b from-accent/20 to-transparent p-4">
      <div className="h-full w-full rounded-lg border border-border/60 bg-background/60 grid place-items-center">
        <div className="text-sm text-muted-foreground">Chart placeholder (7 días)</div>
      </div>
    </div>
  );
}
