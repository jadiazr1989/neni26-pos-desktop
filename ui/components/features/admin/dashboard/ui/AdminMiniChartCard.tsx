// ui/components/features/admin/dashboard/ui/AdminMiniChartCard.tsx
"use client";

import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminMiniChartCard(props: {
  title: string;
  subtitle: string;
  series: number[];
}): JSX.Element {
  // mini “sparkline” simple con barras
  const max = Math.max(1, ...props.series);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{props.title}</CardTitle>
        <p className="text-xs text-muted-foreground">{props.subtitle}</p>
      </CardHeader>

      <CardContent>
        <div className="flex items-end gap-2 h-16">
          {props.series.map((v, i) => {
            const h = Math.round((v / max) * 100);
            return (
              <div
                key={i}
                className="flex-1 rounded-md bg-[color:var(--info)]/20 border border-[color:var(--info)]/20"
                style={{ height: `${Math.max(8, h)}%` }}
                title={`${v}`}
              />
            );
          })}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">* Placeholder visual (luego conectamos datos reales).</div>
      </CardContent>
    </Card>
  );
}
