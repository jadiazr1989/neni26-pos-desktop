"use client";

import * as React from "react";
import {
  PackageCheck,
  Package,
  Clock,
  ClipboardList,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { EmptyBlock } from "../ui/EmptyBlock";
import { SectionTitle } from "../ui/SectionTitle";
import { normalizeRangeLabelShort } from "../utils/rangeLabelShort";

export function DashboardOperationSection(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort: string;
  money: (minor: string) => string;
}) {
  const d = props.data;

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <SectionTitle title={`Operación · ${normalizeRangeLabelShort(props.rangeLabelShort)}`} subtitle="Compras y control interno" />
      </CardHeader>

      <CardContent className="px-4 py-4">
        {!d ? (
          <EmptyBlock loading={props.loading} label="Cargando operación..." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <MiniPanel title="Compras">
              <MetricRow icon={PackageCheck} label="Recibidas (en período)" value={String(d.purchases.receivedInRangeCount)} />
              <MetricRow icon={Package} label="Valor recibido" value={props.money(d.purchases.receivedValueBaseMinor)} />

              <Divider />

              <MetricRow icon={ClipboardList} label="Órdenes abiertas" value={String(d.purchases.openOrderedCount)} />
              <MetricRow icon={Package} label="Valor pendiente" value={props.money(d.purchases.openOrderedValueBaseMinor)} />
            </MiniPanel>

            <MiniPanel title="Control">
              <MetricRow icon={AlertTriangle} label="Ajustes pendientes" value={String(d.adjustments.pendingCount)} />

              <Divider />

              <MetricRow icon={Clock} label="Pendientes > 24h" value={String(d.adjustments.pendingOver24hCount)} />
              <MetricRow icon={Clock} label="Pendientes > 72h" value={String(d.adjustments.pendingOver72hCount)} />
            </MiniPanel>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniPanel(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">{props.title}</div>
      </div>
      <div className="space-y-3">{props.children}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-border/60" aria-hidden="true" />;
}

function MetricRow(props: { icon: LucideIcon; label: string; value: string }) {
  const Icon = props.icon;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{props.label}</span>
      </div>

      <div className="text-sm font-semibold tabular-nums whitespace-nowrap">{props.value}</div>
    </div>
  );
}