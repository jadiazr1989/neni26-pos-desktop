"use client";

import * as React from "react";
import { Receipt, ShoppingCart, Wallet, BadgeDollarSign, Percent } from "lucide-react";
import { KpiCard } from "../ui/KpiCard";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import type { DeltaTone } from "../utils/dashboardDeltas";

function bpsToPctLabel(bps: number): string {
  if (!Number.isFinite(bps)) return "—";
  return `${(bps / 100).toFixed(1)}%`;
}

export function DashboardKpisSection(props: {
  data: AdminDashboardDataV2 | null;
  money: (s: string) => string;
  netDeltaTone: DeltaTone;
  avgDeltaTone: DeltaTone;
  rangeLabelShort: string;
}) {
  const k = props.data?.kpis;
  const c = props.data?.cash;
  const cmp = props.data?.comparison;
  const p = props.rangeLabelShort;

  const toneFromDelta = (d: DeltaTone) =>
    d === "good" ? "success" : d === "bad" ? "danger" : "default";

  const moneyFromMinorNumber = (n: number) => props.money(String(n ?? 0));

  const varianceAbs = c ? Math.abs(c.cashVarianceTotalAbsMinor ?? 0) : 0;
  const varianceTone =
    varianceAbs > 0 ? "warning" : c?.hasActiveSession ? "info" : "neutral";

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {/* 1) Ingresos */}
      <KpiCard
        title={`Ingresos · ${p}`}
        value={k ? props.money(k.netSalesBaseMinor) : "—"}
        hint={
          k
            ? `Devol. ${props.money(
              k.refundsBaseMinor
            )} · Desc. ${props.money(k.discountsBaseMinor)}`
            : ""
        }
        tone={toneFromDelta(props.netDeltaTone)}
        icon={ShoppingCart}
        badge={k ? `Margen ${bpsToPctLabel(k.grossMarginPctBps)}` : undefined}
        rightBadge={cmp ? `Δ ${props.money(cmp.netSalesDeltaBaseMinor)}` : undefined}
      />

      {/* 2) Ganancias (Gross Margin $) */}
      <KpiCard
        title={`Ganancias · ${p}`}
        value={k ? props.money(k.grossMarginBaseMinor) : "—"}
        hint={
          k
            ? `Devol. ${bpsToPctLabel(
              k.refundRateBps
            )} · Desc. ${bpsToPctLabel(k.discountRateBps)}`
            : ""
        }
        tone={
          cmp
            ? cmp.grossMarginDeltaBaseMinor.startsWith("-")
              ? "danger"
              : "success"
            : "default"
        }
        icon={BadgeDollarSign}
        badge={k ? `Margen ${bpsToPctLabel(k.grossMarginPctBps)}` : undefined}
        rightBadge={cmp ? `Δ ${props.money(cmp.grossMarginDeltaBaseMinor)}` : undefined}
      />
      <KpiCard
        title={`Tickets · ${p}`}
        value={k ? props.money(k.avgTicketBaseMinor) : "—"}
        
        tone={toneFromDelta(props.avgDeltaTone)}
        icon={Percent}
        badge={k ? `${k.ticketsCount} tickets` : undefined} // 👈 abajo izquierda

        hint={props.data ? `Δ ${props.money(props.data.comparison.avgTicketDeltaBaseMinor)} · Ítems/ticket ${k ? bpsToPctLabel(k.itemsPerTicketBps) : "—"}` : ""}
        rightBadge={k ? `Ítems/ticket ${bpsToPctLabel(k.itemsPerTicketBps)}` : undefined} // 👈 abajo derecha
      />
      {/* 4) Control de caja (descuadre) */}
      <KpiCard
        title={`Control caja · ${p}`}
        value={c ? moneyFromMinorNumber(varianceAbs) : "—"}
        hint={
          c
            ? `Max ${moneyFromMinorNumber(Math.abs(c.cashVarianceMaxAbsMinor ?? 0))} · Casos ${c.cashVarianceCount ?? 0
            }`
            : ""
        }
        tone={varianceTone}
        icon={Wallet}
        badge={c ? (c.hasActiveSession ? "Sesión activa" : "Sin sesión") : undefined}
        rightBadge={c ? `Cash share ${bpsToPctLabel(c.cashShareBps)}` : undefined}
      />
    </div>
  );
}