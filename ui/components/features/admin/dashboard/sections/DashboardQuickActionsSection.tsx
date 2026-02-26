// src/modules/admin/dashboard/sections/DashboardQuickActionsSection.tsx
"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, Plus, Receipt, ShieldAlert, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickAction } from "../ui/QuickAction";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

function iconBySeverity(sev: "info" | "warning" | "critical") {
  if (sev === "critical") return ShieldAlert;
  if (sev === "warning") return AlertTriangle;
  return ArrowRight;
}

function pickFallbackActions(): Array<{
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
}> {
  return [
    { id: "create-product", title: "Crear producto", subtitle: "Alta rápida en catálogo", meta: "Nuevo", icon: Plus, route: "/admin/products" },
    { id: "adjustments", title: "Ajustar inventario", subtitle: "Solicitudes / correcciones", icon: Wrench, route: "/admin/adjustments" },
    { id: "cash", title: "Caja", subtitle: "Sesiones / cierres", icon: Receipt, route: "/admin/reports" },
  ];
}

export function DashboardQuickActionsSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  onNav: (path: string) => void;
  money: (s: string) => string;
}) {
  const actions = props.data?.actions ?? [];

  const top = React.useMemo(() => {
    if (actions.length === 0) return null;

    // Orden: critical > warning > info, y por impacto desc (si viene)
    const sevRank = (s: string) => (s === "critical" ? 3 : s === "warning" ? 2 : 1);

    return [...actions]
      .sort((a, b) => {
        const sr = sevRank(b.severity) - sevRank(a.severity);
        if (sr !== 0) return sr;
        // impacto: como es string money, no comparo BigInt aquí para no agregar helpers;
        // usamos longitud/lex fallback (suficiente para ordenar visualmente). Si quieres exacto, uso parseBigIntSafe.
        const la = String(a.impactBaseMinor ?? "0").length;
        const lb = String(b.impactBaseMinor ?? "0").length;
        return lb - la;
      })
      .slice(0, 3);
  }, [actions]);

  const fallback = React.useMemo(() => pickFallbackActions(), []);

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Acciones rápidas</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-2">
        {props.loading && !props.data ? (
          <>
            <div className="h-12 rounded-lg bg-muted animate-pulse" />
            <div className="h-12 rounded-lg bg-muted animate-pulse" />
            <div className="h-12 rounded-lg bg-muted animate-pulse" />
          </>
        ) : top && top.length > 0 ? (
          top.map((a) => {
            const Icon = iconBySeverity(a.severity);
            const meta =
              a.severity === "critical"
                ? "Crítico"
                : a.severity === "warning"
                ? "Atención"
                : "Info";

            const subtitle = `${a.ctaLabel} · Impacto ${props.money(a.impactBaseMinor)}`;

            return (
              <QuickAction
                key={a.id}
                icon={Icon}
                title={a.title}
                subtitle={subtitle}
                meta={meta}
                onClick={() => props.onNav(a.ctaRoute)}
              />
            );
          })
        ) : (
          fallback.map((x) => (
            <QuickAction
              key={x.id}
              icon={x.icon}
              title={x.title}
              subtitle={x.subtitle}
              meta={x.meta}
              onClick={() => props.onNav(x.route)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}