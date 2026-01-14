// ui/components/features/admin/dashboard/ui/AdminKpiGrid.tsx
"use client";

import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ReceiptText, BadgePercent, RotateCcw, TriangleAlert, Users, Wallet, ShieldCheck } from "lucide-react";

type Kpis = {
  salesToday: number;
  ticketsToday: number;
  discountsToday: number;
  returnsToday: number;
  lowStockAlerts: number;
  cashiersActive: number;
  cashSessionsOpen: number;
  pendingApprovals: number;
};

export function AdminKpiGrid(props: { kpis: Kpis }): JSX.Element {
  const { kpis } = props;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<TrendingUp className="size-4" />}
        title="Ventas hoy"
        value={`$${kpis.salesToday.toFixed(2)}`}
        hint="Importe total"
        tone="blue"
      />
      <KpiCard
        icon={<ReceiptText className="size-4" />}
        title="Tickets"
        value={`${kpis.ticketsToday}`}
        hint="Cantidad de ventas"
        tone="yellow"
      />
      <KpiCard
        icon={<BadgePercent className="size-4" />}
        title="Descuentos"
        value={`$${kpis.discountsToday.toFixed(2)}`}
        hint="Aplicados hoy"
        tone="yellow"
      />
      <KpiCard
        icon={<RotateCcw className="size-4" />}
        title="Devoluciones"
        value={`${kpis.returnsToday}`}
        hint="Hoy"
        tone="blue"
      />

      <KpiCard
        icon={<TriangleAlert className="size-4" />}
        title="Stock bajo"
        value={`${kpis.lowStockAlerts}`}
        hint="Alertas"
        tone="yellow"
      />
      <KpiCard
        icon={<Users className="size-4" />}
        title="Cashiers activos"
        value={`${kpis.cashiersActive}`}
        hint="En sesión"
        tone="blue"
      />
      <KpiCard
        icon={<Wallet className="size-4" />}
        title="Cajas abiertas"
        value={`${kpis.cashSessionsOpen}`}
        hint="Sesiones"
        tone="yellow"
      />
      <KpiCard
        icon={<ShieldCheck className="size-4" />}
        title="Pendientes"
        value={`${kpis.pendingApprovals}`}
        hint="Aprobaciones"
        tone="blue"
      />
    </div>
  );
}

function KpiCard(props: {
  icon: JSX.Element;
  title: string;
  value: string;
  hint: string;
  tone: "yellow" | "blue";
}): JSX.Element {
  const toneRing =
    props.tone === "yellow"
      ? "ring-2 ring-[color:var(--warning)]/25"
      : "ring-2 ring-[color:var(--info)]/25";

  const toneBadge =
    props.tone === "yellow"
      ? "bg-[color:var(--warning)]/15 text-[color:var(--warning-foreground)] border-[color:var(--warning)]/20"
      : "bg-[color:var(--info)]/15 text-[color:var(--info-foreground)] border-[color:var(--info)]/20";

  return (
    <Card className={toneRing}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span>{props.title}</span>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneBadge}`}>
            {props.icon}
            {props.hint}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{props.value}</div>
      </CardContent>
    </Card>
  );
}
