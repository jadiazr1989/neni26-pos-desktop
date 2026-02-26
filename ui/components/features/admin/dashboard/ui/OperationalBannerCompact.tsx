// src/modules/admin/dashboard/ui/OperationalBannerCompact.tsx
"use client";

import * as React from "react";
import { ArrowRight, CircleAlert, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardAlertDTO } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { pickTopAlerts, labelForSeverity } from "../utils/dashboardAlerts";

export function OperationalBannerCompact(props: { alerts: DashboardAlertDTO[]; loading: boolean; onGo?: () => void }) {
  if (props.loading) return null;
  if (!props.alerts || props.alerts.length === 0) return null;

  const top = pickTopAlerts(props.alerts, 1)[0];
  const severity = top?.severity ?? "info";

  const leftBorder =
    severity === "critical"
      ? "border-l-rose-500"
      : severity === "warning"
      ? "border-l-amber-500"
      : "border-l-sky-500";

  const bg =
    severity === "critical"
      ? "bg-rose-500/5"
      : severity === "warning"
      ? "bg-amber-500/5"
      : "bg-sky-500/5";

  return (
    <Card className={`rounded-xl border-border/60 border-l-4 ${leftBorder} ${bg}`}>
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-3">
            <CircleAlert className="size-4 text-muted-foreground" />
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                {top?.title ?? "Atención"}{" "}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({props.alerts.length}) · {labelForSeverity(severity)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate">{top?.description ?? "—"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="size-4" />
              <span>Operación primero</span>
            </div>

            {props.onGo ? (
              <button
                type="button"
                onClick={props.onGo}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs hover:bg-accent/30 transition-colors"
              >
                Ver <ArrowRight className="size-3" />
              </button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}