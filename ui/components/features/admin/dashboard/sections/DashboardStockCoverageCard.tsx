// src/modules/admin/dashboard/sections/DashboardStockCoverageCard.tsx
"use client";

import * as React from "react";
import { Layers, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { SectionTitle } from "../ui/SectionTitle";
import { EmptyBlock } from "../ui/EmptyBlock";

function safeInt(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

function pctBps(part: number, total: number): string {
  const t = safeInt(total);
  const p = safeInt(part);
  if (t <= 0) return "0.0%";
  return `${((p / t) * 100).toFixed(1)}%`;
}

export function DashboardStockCoverageCard(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort: string;
  onNav?: (path: string) => void; // opcional por si quieres click
}) {
  const d = props.data;

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <SectionTitle
          title={`Cobertura · ${props.rangeLabelShort}`}
          subtitle="Reservas por variantes (sin mezclar unidades)"
        />
      </CardHeader>

      <CardContent className="px-4 py-4">
        {!d ? (
          <EmptyBlock loading={props.loading} label="Cargando cobertura..." />
        ) : (
          <div className="rounded-lg border border-border/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Layers className="size-4 text-muted-foreground" />
                Resumen
              </div>

              {props.onNav ? (
                <button
                  type="button"
                  onClick={() => props.onNav?.("/admin/inventory")}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent/30 transition-colors"
                >
                  Ver <Link2 className="size-3" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 space-y-3">
              <KV
                label="Variantes con reserva"
                value={safeInt(d.inventory.kpis.reservedVariantsCount)}
              />
              <KV
                label="% variantes reservadas"
                value={pctBps(
                  safeInt(d.inventory.kpis.reservedVariantsCount),
                  safeInt(d.inventory.kpis.reservableVariantsCount ?? d.inventory.kpis.variantsCount)
                )}
              />
              <KV label="Rupturas" value={safeInt(d.inventory.weaknesses.rupturesCount)} />
            </div>

            <div className="mt-3 text-[11px] text-muted-foreground">
              Si el % de variantes reservadas es alto, puedes ver “rupturas” aunque exista stock físico.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KV(props: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{props.label}</div>
      <div className="text-sm font-semibold tabular-nums">{props.value}</div>
    </div>
  );
}