"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  AdminDashboardDataV2,
  DashboardHealthDriverDTO,
} from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { cn } from "@/lib/utils";

type Status = AdminDashboardDataV2["health"]["status"];

function statusUi(status: Status) {
  switch (status) {
    case "OK":
      return {
        label: "Bien",
        pill: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle2,
      };
    case "WARNING":
      return {
        label: "Atención",
        pill: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        icon: AlertTriangle,
      };
    default:
      return {
        label: "Crítico",
        pill: "border-rose-600/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        icon: CircleAlert,
      };
  }
}

function dot(sev: DashboardHealthDriverDTO["severity"]) {
  if (sev === "critical") return "bg-rose-500";
  if (sev === "warning") return "bg-amber-500";
  return "bg-sky-500";
}

function pctFromBps(bps: unknown): string | null {
  const n = typeof bps === "number" ? bps : Number(bps);
  if (!Number.isFinite(n)) return null;
  return `${(n / 100).toFixed(1)}%`;
}

function humanDriverTitle(key: DashboardHealthDriverDTO["key"]): string {
  switch (key) {
    case "grossMarginPct":
      return "Margen de ganancia bajo";
    case "refundRate":
      return "Devoluciones altas";
    case "discountRate":
      return "Descuentos altos";
    case "cashVariance":
      return "Diferencias en caja";
    case "inventoryRuptures":
      return "Rupturas (sin stock)";
    case "inventoryLowStock":
      return "Stock bajo";
    case "inventoryOverstock":
      return "Exceso de inventario";
    case "inventorySlowMoving":
      return "Inventario lento";
    case "openOrdersAging":
      return "Órdenes abiertas envejecidas";
    case "pendingAdjustments":
      return "Ajustes pendientes";
    case "openCashSessions":
      return "Cajas abiertas";
    default:
      return "Señal operativa";
  }
}

function humanDriverDetail(d: DashboardHealthDriverDTO): string | null {
  const m = d.meta ?? {};

  // Usa convenciones simples: si el back manda bps/targets en meta
  if (d.key === "grossMarginPct") {
    const cur = pctFromBps(m.grossMarginPctBps);
    const tgt = pctFromBps(m.targetOkBps ?? m.targetBps);
    if (cur && tgt) return `Tu margen: ${cur} · Objetivo: ≥ ${tgt}`;
    if (cur) return `Tu margen: ${cur}`;
  }

  if (d.key === "refundRate") {
    const cur = pctFromBps(m.refundRateBps);
    const tgt = pctFromBps(m.targetOkBps ?? m.targetBps);
    if (cur && tgt) return `Tasa: ${cur} · Objetivo: ≤ ${tgt}`;
    if (cur) return `Tasa: ${cur}`;
  }

  if (d.key === "discountRate") {
    const cur = pctFromBps(m.discountRateBps);
    const tgt = pctFromBps(m.targetOkBps ?? m.targetBps);
    if (cur && tgt) return `Tasa: ${cur} · Objetivo: ≤ ${tgt}`;
    if (cur) return `Tasa: ${cur}`;
  }

  // fallback muy corto (2 claves max)
  const entries = Object.entries(m).slice(0, 2);
  if (entries.length === 0) return null;
  return entries.map(([k, v]) => `${k}: ${String(v)}`).join(" · ");
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function scoreLabel(score: number): string {
  if (!Number.isFinite(score)) return "—";
  if (score >= 85) return "Excelente";
  if (score >= 70) return "Bueno";
  if (score >= 50) return "Riesgo moderado";
  return "Riesgo alto";
}

export function DashboardHealthCard(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort: string;
  onGo?: (route: string) => void;
}) {
  const h = props.data?.health;
  const score = h?.score ?? 0;
  const status = h?.status ?? "WARNING";
  const ui = statusUi(status);
  const Icon = ui.icon;

  const pct = clamp01(score / 100);
  const drivers = (h?.drivers ?? []).slice(0, 6);

  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-lg font-semibold leading-tight">Salud del negocio</div>
            <div className="text-sm text-muted-foreground">Rango: {props.rangeLabelShort}</div>
          </div>

          <span className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold", ui.pill)}>
            <span className="inline-flex items-center gap-2">
              <Icon className="size-4" />
              {ui.label}
            </span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* score */}
        <div className="rounded-2xl border border-border/60 bg-muted/10 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Índice de salud (0–100)</div>

              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-3xl font-semibold tabular-nums leading-none">
                  {props.loading ? "—" : `${score}/100`}
                </div>
                <span className="text-sm text-muted-foreground">{props.loading ? "" : scoreLabel(score)}</span>
              </div>

              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {props.loading
                  ? "Calculando señales…"
                  : "Resumen rápido de margen, devoluciones, descuentos, caja, inventario y operación."}
              </div>
            </div>

            <div className="w-28 shrink-0">
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full bg-foreground/70" style={{ width: `${Math.round(pct * 100)}%` }} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 tabular-nums text-right">
                {Math.round(pct * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* drivers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Qué lo está afectando</div>
            {props.onGo ? (
              <button
                type="button"
                onClick={() => props.onGo?.("/admin/reports")}
                className="text-xs text-muted-foreground hover:underline"
              >
                Ver detalle
              </button>
            ) : null}
          </div>

          <div className="rounded-2xl border border-border/60 overflow-hidden">
            {props.loading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : drivers.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                No hay señales para este rango.
              </div>
            ) : (
              drivers.map((d, idx) => {
                const title = humanDriverTitle(d.key);
                const detail = humanDriverDetail(d);

                return (
                  <div
                    key={`${d.key}-${idx}`}
                    className={cn(
                      "px-4 py-3 flex items-start justify-between gap-3",
                      idx ? "border-t border-border/60" : ""
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-block size-2 rounded-full", dot(d.severity))} />
                        <div className="text-sm font-medium truncate">{title}</div>
                      </div>
                      {detail ? (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">{detail}</div>
                      ) : (
                        <div className="h-4" />
                      )}
                    </div>

                    {/* scoreImpact negativo = baja el score */}
                    <div className="shrink-0 text-sm font-semibold tabular-nums text-muted-foreground">
                      {d.scoreImpact}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {props.onGo ? (
          <button
            type="button"
            onClick={() => props.onGo?.("/admin/inventory")}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent/30 transition-colors"
          >
            Revisar inventario / rupturas
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <div className="px-4 py-3 border-t border-border/60 first:border-t-0">
      <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-muted animate-pulse rounded mt-2" />
    </div>
  );
}