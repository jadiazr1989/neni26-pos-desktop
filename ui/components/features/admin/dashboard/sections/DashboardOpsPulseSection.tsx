"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  TrendingDown,
  SlidersHorizontal,
  ClipboardList,
  Package,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyBlock } from "../ui/EmptyBlock";

type RowTone = "neutral" | "warn" | "bad";

function toneByCount(n: number, warnAt: number, badAt: number): RowTone {
  if (!Number.isFinite(n) || n <= 0) return "neutral";
  if (n >= badAt) return "bad";
  if (n >= warnAt) return "warn";
  return "neutral";
}

function toneCls(t: RowTone): { text: string } {
  switch (t) {
    case "bad":
      return { text: "text-destructive" };
    case "warn":
      return { text: "text-amber-600" };
    default:
      return { text: "text-foreground" };
  }
}

function safeInt(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

function PulseRow(props: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: RowTone;
  href: string;
  hint?: string;
}) {
  const cls = toneCls(props.tone ?? "neutral");

  return (
    <Link
      href={props.href}
      className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2 hover:bg-accent/30 transition-colors"
    >
      <div className="min-w-0 flex items-center gap-2">
        <div className="text-muted-foreground">{props.icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{props.label}</div>
          {props.hint ? <div className="text-[11px] text-muted-foreground truncate">{props.hint}</div> : null}
        </div>
      </div>

      <div className={`text-sm font-semibold tabular-nums whitespace-nowrap ${cls.text}`}>
        {props.value}
      </div>
    </Link>
  );
}

export function DashboardOpsPulseSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort: string;
}) {
  const d = props.data;

  if (!d && props.loading) {
    return (
      <Card className="rounded-xl border-border/60">
        <CardHeader className="pb-2">
          <SectionTitle title={`Pulso operativo · ${props.rangeLabelShort}`} subtitle="Prioridades del período" />
        </CardHeader>
        <CardContent className="px-4 py-4">
          <EmptyBlock loading label="Cargando pulso..." />
        </CardContent>
      </Card>
    );
  }

  if (!d) return null;

  const inv = d.inventory;
  const purch = d.purchases;
  const adj = d.adjustments;

  const lowStock = safeInt(inv.kpis.lowStockCount);
  const ruptures = safeInt(inv.weaknesses.rupturesCount);
  const slow = safeInt(inv.weaknesses.slowMovingCount);
  const badThr = safeInt(inv.weaknesses.badThresholdsCount);

  const openOrders = safeInt(purch.openOrderedCount);
  const pendingAdj = safeInt(adj.pendingCount);

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <SectionTitle title={`Pulso operativo · ${props.rangeLabelShort}`} subtitle="Qué revisar ahora (atajos)" />
          </div>

          <Link
            href="/admin/settings/inventory"
            className="shrink-0 inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/30 transition-colors"
          >
            Ajustes <SlidersHorizontal className="size-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-4">
        <div className="space-y-2">
          <PulseRow
            icon={<AlertTriangle className="size-4" />}
            label="Stock bajo"
            value={lowStock}
            tone={toneByCount(lowStock, 1, 5)}
            href="/admin/inventory"
            hint="Variantes por debajo del umbral"
          />

          <PulseRow
            icon={<Ban className="size-4" />}
            label="Rupturas"
            value={ruptures}
            tone={toneByCount(ruptures, 1, 3)}
            href="/admin/inventory"
            hint="Disponible <= 0"
          />

          <PulseRow
            icon={<TrendingDown className="size-4" />}
            label="Rotación lenta"
            value={slow}
            tone={toneByCount(slow, 1, 5)}
            href="/admin/inventory"
            hint="Se vende poco vs stock"
          />

          <PulseRow
            icon={<AlertTriangle className="size-4" />}
            label="Umbrales dudosos"
            value={badThr}
            tone={toneByCount(badThr, 1, 3)}
            href="/admin/settings/inventory"
            hint="Thresholds mal calibrados"
          />

          <div className="h-px bg-border/60" />

          <PulseRow
            icon={<ClipboardList className="size-4" />}
            label="Ajustes pendientes"
            value={pendingAdj}
            tone={toneByCount(pendingAdj, 1, 3)}
            href="/admin/inventory/adjustments"
            hint="Solicitudes esperando aprobación"
          />

          <PulseRow
            icon={<Package className="size-4" />}
            label="Órdenes abiertas"
            value={openOrders}
            tone={toneByCount(openOrders, 1, 3)}
            href="/admin/purchases"
            hint="Pendientes de recepción"
          />
        </div>
      </CardContent>
    </Card>
  );
}