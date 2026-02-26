// src/modules/admin/dashboard/sections/DashboardKpisSection.tsx
"use client";

import * as React from "react";
import { Receipt, ShoppingCart, Wallet, Percent, Boxes } from "lucide-react";
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
  const p = props.rangeLabelShort;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title={`Ventas netas · ${p}`}
        value={k ? props.money(k.netSalesBaseMinor) : "—"}
        hint={
          k
            ? `Brutas ${props.money(k.grossSalesBaseMinor)} · Devol. ${props.money(k.refundsBaseMinor)} · Desc. ${props.money(k.discountsBaseMinor)}`
            : ""
        }
        tone={props.netDeltaTone === "good" ? "success" : props.netDeltaTone === "bad" ? "danger" : "default"}
        icon={ShoppingCart}
        rightMeta={k ? `Margen ${bpsToPctLabel(k.grossMarginPctBps)}` : undefined}
        clampHint
      />

      <KpiCard
        title={`Tickets · ${p}`}
        value={k ? String(k.ticketsCount) : "—"}
        hint={
          props.data
            ? `Δ ${props.data.comparison.ticketsDelta >= 0 ? "+" : ""}${props.data.comparison.ticketsDelta} · Ítems ${k ? k.itemsCount : "—"}`
            : ""
        }
        tone="default"
        icon={Receipt}
      />

      <KpiCard
        title={`Ticket promedio · ${p}`}
        value={k ? props.money(k.avgTicketBaseMinor) : "—"}
        hint={props.data ? `Δ ${props.money(props.data.comparison.avgTicketDeltaBaseMinor)} · Ítems/ticket ${k ? bpsToPctLabel(k.itemsPerTicketBps) : "—"}` : ""}
        tone={props.avgDeltaTone === "good" ? "success" : props.avgDeltaTone === "bad" ? "danger" : "default"}
        icon={Percent}
        clampHint
      />

      <KpiCard
        title={`Caja neta · ${p}`}
        value={c ? props.money(c.netCashBaseMinor) : "—"}
        hint={
          c
            ? `Cash ${props.money(c.cashSalesBaseMinor)} · Devol. ${props.money(c.cashRefundsBaseMinor)} · Gastos ${props.money(c.expensesBaseMinor)}`
            : ""
        }
        tone={c?.hasActiveSession ? "info" : "neutral"}
        icon={Wallet}
        rightMeta={c ? `Cash share ${bpsToPctLabel(c.cashShareBps)}` : undefined}
        clampHint
      />
    </div>
  );
}