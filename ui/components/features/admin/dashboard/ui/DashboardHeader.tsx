// src/modules/admin/dashboard/ui/DashboardHeader.tsx
"use client";

import * as React from "react";
import { RefreshCw, BarChart3, PackageSearch } from "lucide-react";

import type { AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: Array<{ key: AdminDashboardRange; label: string }> = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
];

export function DashboardHeader(props: {
  range: AdminDashboardRange;
  onRangeChange: (next: AdminDashboardRange) => void;

  loading: boolean;
  onRefresh: () => void;

  onReports: () => void;
  onGoProducts: () => void;

  component?: React.ReactNode; // slot para scope badges u otros
}) {
  const onTabChange = React.useCallback(
    (v: string) => {
      // Tabs solo emite strings, pero nuestros values vienen del union
      const next = v as AdminDashboardRange;
      props.onRangeChange(next);
    },
    [props]
  );

  return (
    <Card className="rounded-2xl border-border/60">
      <div className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-semibold tracking-tight">Panel de control administrativo</div>
            <div className="text-xs text-muted-foreground">
              Ventas · Caja · Operación · Inventario
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {props.component ? <div className="mr-1">{props.component}</div> : null}

            <Button variant="outline" size="sm" onClick={props.onGoProducts} className="gap-2">
              <PackageSearch className="size-4" />
              Productos
            </Button>

            <Button variant="outline" size="sm" onClick={props.onReports} className="gap-2">
              <BarChart3 className="size-4" />
              Reportes
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={props.onRefresh}
              disabled={props.loading}
              className={cn("gap-2", props.loading ? "opacity-90" : "")}
            >
              <RefreshCw className={cn("size-4", props.loading ? "animate-spin" : "")} />
              {props.loading ? "Actualizando" : "Actualizar"}
            </Button>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={props.range} onValueChange={onTabChange}>
            <TabsList className="h-9">
              {RANGE_OPTIONS.map((r) => (
                <TabsTrigger key={r.key} value={r.key} className="text-xs">
                  {r.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="text-[11px] text-muted-foreground">
            Tip: cambia el rango para recalcular KPIs, tendencia y rankings.
          </div>
        </div>
      </div>
    </Card>
  );
}

