"use client";

import * as React from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";

import type { SaleLine, TicketTotals } from "@/stores/helpers/posSale.store.types";

function money(minor: number): string {
  const v = Number(minor ?? 0);
  const safe = Number.isFinite(v) ? v : 0;
  return (safe / 100).toFixed(2);
}

function formatQtyFromLine(li: SaleLine): string {
  const scale = li.qtyScale ?? 0;
  const q = li.qtyBaseMinor / 10 ** scale;
  return scale === 0 ? String(Math.trunc(q)) : q.toFixed(scale);
}

function calcLineTotalMinor(li: SaleLine): number {
  const optionsDeltaMinor = li.optionsSnapshot.reduce((acc, o) => acc + (o.priceDeltaMinor ?? 0), 0);
  const unitMinor = (li.pricePerUnitMinor ?? 0) + optionsDeltaMinor;
  const qtyFactor = li.qtyBaseMinor / 10 ** (li.qtyScale ?? 0);
  return Math.round(unitMinor * qtyFactor);
}

/** ✅ smooth animated number (minor int) */
function useAnimatedMinor(targetMinor: number, durationMs = 180) {
  const [value, setValue] = React.useState<number>(targetMinor);
  const rafRef = React.useRef<number | null>(null);
  const fromRef = React.useRef<number>(targetMinor);

  React.useEffect(() => {
    const from = fromRef.current;
    const to = targetMinor;
    if (from === to) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = Math.round(from + (to - from) * eased);
      setValue(next);

      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [targetMinor, durationMs]);

  return value;
}

function SummaryRow(props: { label: string; valueMinor: number; strong?: boolean }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={cn("text-[12px] text-muted-foreground", props.strong && "font-semibold text-foreground")}>
        {props.label}
      </div>
      <div className={cn("text-[12px] tabular-nums", props.strong && "font-semibold text-foreground")}>
        ${money(props.valueMinor)}
      </div>
    </div>
  );
}

type Props = {
  className?: string;
  items: SaleLine[];
  totals: TicketTotals;
  onEdit: (lineId: string) => void;

  /** ✅ newly added/updated line id */
  activeLineId?: string | null;

  /** default false (Cuba) */
  showTaxAndDiscount?: boolean;
};

export function TicketListPanel(props: Props): JSX.Element {
  const itemsCount = props.items.length;

  const totalMinor = props.totals.totalMinor ?? 0;
  const subtotalMinor = props.totals.subtotalMinor ?? totalMinor;
  const taxMinor = props.totals.taxMinor ?? 0;
  const discountMinor = props.totals.discountMinor ?? 0;

  const showExtras = props.showTaxAndDiscount ?? false;

  // ✅ animated total
  const animatedTotalMinor = useAnimatedMinor(totalMinor, 200);

  // ✅ pulse + direction glow (up/down)
  const prevTotalRef = React.useRef<number>(totalMinor);
  const [pulseDir, setPulseDir] = React.useState<"up" | "down" | null>(null);

  React.useEffect(() => {
    const prev = prevTotalRef.current;
    if (prev === totalMinor) return;

    setPulseDir(totalMinor > prev ? "up" : "down");
    prevTotalRef.current = totalMinor;

    const t = window.setTimeout(() => setPulseDir(null), 180);
    return () => window.clearTimeout(t);
  }, [totalMinor]);

  // ✅ highlight active line
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const activeRowRef = React.useRef<HTMLLIElement | null>(null);

  React.useEffect(() => {
    if (!props.activeLineId) return;
    setHighlightId(props.activeLineId);

    const clear = window.setTimeout(() => setHighlightId(null), 520);
    return () => window.clearTimeout(clear);
  }, [props.activeLineId]);

  // ✅ smooth scroll to active line (after paint)
  React.useEffect(() => {
    if (!props.activeLineId) return;
    const el = activeRowRef.current;
    if (!el) return;

    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    return () => window.cancelAnimationFrame(id);
  }, [props.activeLineId, props.items.length]);

  return (
    <div className={cn("h-full min-h-0 flex flex-col", props.className)}>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* ✅ STICKY HEADER */}
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[12px] tracking-widest text-muted-foreground">TICKET</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {itemsCount} {itemsCount === 1 ? "artículo" : "artículos"}
                </div>
              </div>

              <div
                className={cn(
                  "shrink-0 text-right",
                  "transition-transform duration-150",
                  pulseDir && "scale-[1.02]"
                )}
              >
                <div className="text-[12px] text-muted-foreground">Total</div>

                <div
                  className={cn(
                    "text-3xl font-extrabold tabular-nums tracking-tight",
                    "transition-shadow duration-150",
                    pulseDir === "up" && "shadow-[0_0_0_6px_rgba(16,185,129,0.14)]",
                    pulseDir === "down" && "shadow-[0_0_0_6px_rgba(239,68,68,0.14)]"
                  )}
                >
                  ${money(animatedTotalMinor)}
                </div>
              </div>
            </div>

            {/* ✅ breakdown */}
            {showExtras ? (
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                <SummaryRow label="Subtotal" valueMinor={subtotalMinor} />
                <SummaryRow label="Impuesto" valueMinor={taxMinor} />
                <SummaryRow label="Descuento" valueMinor={discountMinor} />
                <SummaryRow label="A pagar" valueMinor={totalMinor} strong />
              </div>
            ) : null}
          </div>
        </div>

        {/* ✅ LIST */}
        {props.items.length === 0 ? (
          <div className="p-5">
            <div className="text-sm text-muted-foreground rounded-xl border border-dashed border-border p-4">
              Agrega productos para empezar.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {props.items.map((li) => {
              const lineTotalMinor = calcLineTotalMinor(li);
              const unitLabel = li.unitLabelSnapshot ?? "unit";
              const qtyText = formatQtyFromLine(li);

              const isActive = highlightId === li.id;
              const setRef = (node: HTMLLIElement | null) => {
                if (li.id === props.activeLineId) activeRowRef.current = node;
              };

              return (
                <li
                  key={li.id}
                  ref={setRef}
                  className={cn(
                    "relative",
                    // ✅ subtle highlight wash
                    isActive && "bg-amber-50"
                  )}
                >
                  {/* ✅ left accent bar for active line */}
                  <div
                    className={cn(
                      "pointer-events-none absolute left-0 top-0 h-full w-1 bg-transparent",
                      isActive && "bg-amber-400"
                    )}
                  />

                  <button
                    type="button"
                    onClick={() => props.onEdit(li.id)}
                    className={cn(
                      "w-full text-left px-4 py-4",
                      "hover:bg-accent/10 active:bg-accent/20 transition",
                      "focus:outline-none focus:ring-2 focus:ring-ring",
                      // ✅ “pop” animation
                      isActive && "animate-[ticketPulse_520ms_ease-out]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{li.nameSnapshot}</div>

                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Qty: {qtyText} {unitLabel} · ${money(li.pricePerUnitMinor)}/{unitLabel}
                        </div>

                        {li.optionsSnapshot.length > 0 ? (
                          <div className="mt-1 text-[11px] text-muted-foreground space-y-0.5">
                            {li.optionsSnapshot.map((o, idx) => (
                              <div key={`${li.id}:opt:${idx}`}>
                                {o.groupName}: {o.optionName}
                                {o.priceDeltaMinor ? ` (+$${money(o.priceDeltaMinor)})` : ""}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="shrink-0 text-sm font-semibold tabular-nums">
                        ${money(lineTotalMinor)}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ✅ local keyframes */}
      <style jsx>{`
        @keyframes ticketPulse {
          0% { transform: translateZ(0) scale(1); }
          35% { transform: translateZ(0) scale(1.01); }
          100% { transform: translateZ(0) scale(1); }
        }
      `}</style>
    </div>
  );
}