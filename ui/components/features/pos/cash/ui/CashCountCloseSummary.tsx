"use client";

import { Card } from "@/components/ui/card";
import type { CashCountReportDTO } from "@/lib/cash.types";
import { cn } from "@/lib/utils";
import type { JSX } from "react";

type CashMode = "COUNT" | "CLOSE";

function money(n: number) {
  return (n / 100).toFixed(2); // ajusta si minor != centavos
}

export function CashCountCloseSummary(props: {
  mode: CashMode;
  cup: string;
  usd: string;
  report: CashCountReportDTO | null;
}): JSX.Element {
  return (
    <div className="h-full w-full bg-muted/10 p-6">
      <div className="text-sm font-semibold">Resumen</div>

      <Card className="mt-3 rounded-2xl p-4">
        <div className="text-xs text-muted-foreground">Acción</div>
        <div className="text-sm font-semibold">{props.mode === "COUNT" ? "COUNT" : "Z CLOSE"}</div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">CUP</div>
            <div className="font-semibold tabular-nums">{props.cup}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">USD</div>
            <div className="font-semibold tabular-nums">{props.usd}</div>
          </div>
        </div>
      </Card>

      {props.report ? (
        <Card className="mt-3 rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Reporte</div>

          <div className="mt-3 space-y-2">
            {props.report.counts.map((c) => {
              const ok = c.diffMinor === 0;
              return (
                <div key={c.currency} className="flex items-center justify-between text-sm">
                  <div className="font-medium">{c.currency}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    exp {money(c.expectedMinor)} · cnt {money(c.countedMinor)}
                  </div>
                  <div
                    className={cn(
                      "ml-2 rounded-full px-2 py-0.5 text-[11px] tabular-nums",
                      ok ? "bg-emerald-500/10 text-emerald-700" : "bg-amber-500/10 text-amber-800"
                    )}
                  >
                    diff {money(c.diffMinor)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="mt-3 text-[11px] text-muted-foreground">
          Cuando guardes el arqueo, aquí se mostrará expected/diff real.
        </div>
      )}
    </div>
  );
}
