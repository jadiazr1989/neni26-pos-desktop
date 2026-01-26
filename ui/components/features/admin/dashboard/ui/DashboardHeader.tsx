import { Button } from "@/components/ui";
import { cn } from "@/lib";
import { AdminDashboardRange } from "@/lib/modules/admin/dashboard/admin-dashboard.dto";
import { BarChart3, RefreshCw } from "lucide-react";
import * as React from "react";

type RangeBtn = { key: AdminDashboardRange; label: string };

const RANGE_BTNS: RangeBtn[] = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
];

export function DashboardHeader(props: {
  range: AdminDashboardRange;
  onRangeChange: (r: AdminDashboardRange) => void;
  onRefresh: () => void;
  loading: boolean;
  onReports: () => void;
  onGoProducts: () => void;
  component?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <span>Dashboard</span>
          {props.component}
        </h1>

        <p className="text-sm text-muted-foreground">
          Detecta problemas y actúa rápido.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex rounded-xl border border-border p-1">
          {RANGE_BTNS.map((b) => (
            <button
              key={b.key}
              onClick={() => props.onRangeChange(b.key)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                props.range === b.key
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/40"
              )}
            >
              {b.label}
            </button>
          ))}
        </div>

        <Button variant="secondary" onClick={props.onRefresh} disabled={props.loading}>
          <RefreshCw
            className={cn("mr-2 size-4", props.loading && "animate-spin")}
          />
          Refrescar
        </Button>

        <Button variant="secondary" onClick={props.onReports}>
          <BarChart3 className="mr-2 size-4" />
          Reportes
        </Button>
      </div>
    </div>
  );
}
