// src/modules/admin/dashboard/ui/PaymentsTable.tsx
"use client";

import * as React from "react";
import { Banknote, CreditCard, ArrowLeftRight, MoreHorizontal } from "lucide-react";
import { EmptyBlock } from "../ui/EmptyBlock";

type PaymentMethodCode = "CASH" | "CARD" | "TRANSFER" | "OTHER";

type Row = { method: PaymentMethodCode; count: number; pctBps: number; amountBaseMinor: string };

type DisplayRow = { method: PaymentMethodCode; count: number; pctBps: number };

const META: Record<
  PaymentMethodCode,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  CASH: { label: "Efectivo", Icon: Banknote },
  CARD: { label: "Tarjeta", Icon: CreditCard },
  TRANSFER: { label: "Transferencia", Icon: ArrowLeftRight },
  OTHER: { label: "Otro", Icon: MoreHorizontal },
};

const ORDER: PaymentMethodCode[] = ["CASH", "CARD", "TRANSFER", "OTHER"];

function pctText(pctBps: number): string {
  const pct = Number.isFinite(pctBps) ? pctBps / 100 : 0;
  return `${pct.toFixed(1)}%`;
}

function normalizeRows(rows: Row[]): DisplayRow[] {
  const map = new Map<PaymentMethodCode, DisplayRow>();

  for (const r of rows ?? []) {
    // merge-safe (si el back repite, sumamos)
    const prev = map.get(r.method);
    const count = (prev?.count ?? 0) + (Number.isFinite(r.count) ? r.count : 0);
    const pctBps = Number.isFinite(r.pctBps) ? r.pctBps : 0;
    map.set(r.method, { method: r.method, count, pctBps });
  }

  // ✅ siempre devolvemos los 4 métodos (sin huecos)
  return ORDER.map((m) => map.get(m) ?? { method: m, count: 0, pctBps: 0 });
}

export function PaymentsTable(props: { loading: boolean; rows: Row[] }) {
  const rows4 = React.useMemo(() => normalizeRows(props.rows), [props.rows]);

  if (props.loading) return <EmptyBlock loading label="Cargando pagos..." />;

  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      {rows4.map((r, idx) => {
        const meta = META[r.method];
        const Icon = meta.Icon;

        return (
          <div
            key={r.method}
            className={[
              "px-4 py-3",
              idx === rows4.length - 1 ? "" : "border-b border-border/60",
              r.count === 0 ? "opacity-60" : "",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{meta.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.count} · {pctText(r.pctBps)}
                  </div>
                </div>
              </div>

              {/* ✅ compacto: solo count + % (sin amount) */}
              <div className="text-right">
                <div className="text-sm font-semibold tabular-nums">{r.count}</div>
                <div className="text-xs text-muted-foreground tabular-nums">{pctText(r.pctBps)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}