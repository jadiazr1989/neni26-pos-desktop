// src/modules/admin/dashboard/sections/DashboardHealthCard.tsx
"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AdminDashboardDataV2 } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

type Health = AdminDashboardDataV2["health"];
type Driver = Health["drivers"][number];

function clampInt(n: number, min: number, max: number): number {
  const x = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.min(Math.max(x, min), max);
}

function statusTone(s: Health["status"]): "ok" | "warn" | "crit" {
  if (s === "CRITICAL") return "crit";
  if (s === "WARNING") return "warn";
  return "ok";
}

function StatusIcon(props: { tone: "ok" | "warn" | "crit" }) {
  if (props.tone === "crit") return <ShieldAlert className="size-4 text-destructive" />;
  if (props.tone === "warn") return <AlertTriangle className="size-4 text-amber-600" />;
  return <CheckCircle2 className="size-4 text-emerald-600" />;
}

function StatusPill(props: { status: Health["status"] }) {
  const tone = statusTone(props.status);
  const cls =
    tone === "crit"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : tone === "warn"
      ? "border-amber-600/25 bg-amber-600/10 text-amber-700"
      : "border-emerald-600/25 bg-emerald-600/10 text-emerald-700";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${cls}`}>
      <StatusIcon tone={tone} />
      <span className="font-semibold">{props.status}</span>
    </span>
  );
}

function formatImpact(impact: number): string {
  const x = clampInt(impact, -100, 0);
  if (x === 0) return "0";
  return `${x}`;
}

function driverTone(sev: Driver["severity"]): "info" | "warning" | "critical" {
  if (sev === "critical") return "critical";
  if (sev === "warning") return "warning";
  return "info";
}

function DriverPill(props: { driver: Driver; onClick?: () => void }) {
  const d = props.driver;
  const tone = driverTone(d.severity);

  const pillCls =
    tone === "critical"
      ? "border-destructive/30 bg-destructive/5"
      : tone === "warning"
      ? "border-amber-600/25 bg-amber-600/10"
      : "border-border/60 bg-muted/30";

  const dotCls =
    tone === "critical"
      ? "bg-destructive"
      : tone === "warning"
      ? "bg-amber-600"
      : "bg-muted-foreground";

  const content = (
    <div className={`rounded-lg border px-3 py-2 ${pillCls}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-full ${dotCls}`} />
            <div className="text-sm font-semibold truncate">{d.label}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Impacto: <span className="font-semibold tabular-nums">{formatImpact(d.scoreImpact)}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums shrink-0">
          {d.severity.toUpperCase()}
        </div>
      </div>

      {d.meta && Object.keys(d.meta).length > 0 ? (
        <div className="mt-2 text-[11px] text-muted-foreground">
          {Object.entries(d.meta)
            .slice(0, 2)
            .map(([k, v]) => (
              <span key={k} className="mr-2">
                {k}: <span className="font-medium">{String(v)}</span>
              </span>
            ))}
        </div>
      ) : null}
    </div>
  );

  if (props.onClick) {
    return (
      <button type="button" onClick={props.onClick} className="w-full text-left hover:opacity-95">
        {content}
      </button>
    );
  }

  return content;
}

export function DashboardHealthCard(props: {
  data: AdminDashboardDataV2 | null;
  loading: boolean;
  rangeLabelShort?: string;
  onGo?: (path: string) => void; // opcional: navegar a detalles
}) {
  const h = props.data?.health;

  const score = clampInt(h?.score ?? 0, 0, 100);
  const status = h?.status ?? "OK";
  const tone = statusTone(status);

  const ringCls =
    tone === "crit"
      ? "bg-destructive/10 border-destructive/20"
      : tone === "warn"
      ? "bg-amber-600/10 border-amber-600/20"
      : "bg-emerald-600/10 border-emerald-600/20";

  const drivers = (h?.drivers ?? []).slice(0, 4);

  return (
    <Card className="rounded-xl border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold tracking-tight">Salud del negocio</div>
            <div className="text-xs text-muted-foreground">
              {props.rangeLabelShort ? `Rango: ${props.rangeLabelShort}` : "Resumen ejecutivo"}
            </div>
          </div>
          <StatusPill status={status} />
        </div>
      </CardHeader>

      <CardContent className="pt-2 space-y-3">
        {props.loading && !props.data ? (
          <div className="space-y-2">
            <div className="h-16 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 rounded-lg bg-muted animate-pulse" />
            <div className="h-10 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : !props.data ? (
          <div className="text-sm text-muted-foreground">Cargando salud...</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`size-14 rounded-2xl border flex items-center justify-center ${ringCls}`}>
                  <div className="text-xl font-bold tabular-nums">{score}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Score</div>
                  <div className="text-xs text-muted-foreground">
                    {status === "OK"
                      ? "Operación estable"
                      : status === "WARNING"
                      ? "Riesgos detectados"
                      : "Acción urgente"}
                  </div>
                </div>
              </div>

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

            <div className="grid gap-2">
              {drivers.length === 0 ? (
                <div className="text-sm text-muted-foreground">Sin drivers relevantes en este rango.</div>
              ) : (
                drivers.map((d) => (
                  <DriverPill
                    key={`${d.key}-${d.label}`}
                    driver={d}
                    onClick={
                      props.onGo
                        ? () => {
                            // ruteo simple (mejorable por driver.key)
                            if (d.key.startsWith("inventory")) return props.onGo?.("/admin/inventory");
                            if (d.key === "pendingAdjustments") return props.onGo?.("/admin/adjustments");
                            if (d.key === "openCashSessions" || d.key === "cashVariance") return props.onGo?.("/admin/reports");
                            return props.onGo?.("/admin/reports");
                          }
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}