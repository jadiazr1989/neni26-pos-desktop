// ui/components/features/admin/dashboard/ui/AdminAlertsPanel.tsx
"use client";

import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/features/shell/ui/StatusChip";
import { Info, TriangleAlert, ShieldAlert } from "lucide-react";

type Item = { tone: "info" | "warning" | "danger"; title: string; desc: string };

export function AdminAlertsPanel(props: { items: Item[] }): JSX.Element {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Alertas</CardTitle>
        <p className="text-xs text-muted-foreground">Pendientes y avisos importantes.</p>
      </CardHeader>

      <CardContent className="space-y-3">
        {props.items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No hay alertas.</div>
        ) : (
          props.items.map((it, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-semibold">
                  {it.tone === "warning" ? <TriangleAlert className="size-4" /> : it.tone === "danger" ? <ShieldAlert className="size-4" /> : <Info className="size-4" />}
                  {it.title}
                </div>
                <StatusChip tone={it.tone}>{labelFor(it.tone)}</StatusChip>
              </div>
              <p className="text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function labelFor(tone: Item["tone"]) {
  if (tone === "warning") return "Atención";
  if (tone === "danger") return "Crítico";
  return "Info";
}
