"use client";

import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { Clock3, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

function formatHHMM(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function getShiftLabel(d: Date): "Mañana" | "Tarde" | "Noche" {
  const h = d.getHours();
  if (h >= 6 && h < 14) return "Mañana";
  if (h >= 14 && h < 22) return "Tarde";
  return "Noche";
}

function Dot({ open }: { open: boolean }): JSX.Element {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        open ? "bg-emerald-500" : "bg-red-500"
      )}
    />
  );
}

export function PosLeftStatusPanel(props: {
  className?: string;
  cashOpen: boolean;
}): JSX.Element {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const time = useMemo(() => formatHHMM(now), [now]);
  const shift = useMemo(() => getShiftLabel(now), [now]);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-4",
        props.className
      )}
    >
      {/* Caja */}
      <div className="min-w-0 flex items-center gap-3">
        <div className="grid place-items-center size-9 rounded-lg bg-emerald-100">
          <Wallet className="size-4 text-emerald-700" />
        </div>

        <div className="min-w-0 leading-tight">
          <div className="text-xs text-emerald-700/80">Caja</div>
          <div className="text-sm font-semibold flex items-center gap-2 text-emerald-900">
            <Dot open={props.cashOpen} />
            {props.cashOpen ? "Abierta" : "Cerrada"}
          </div>
        </div>
      </div>

      {/* Turno + hora */}
      <div className="shrink-0 text-right leading-tight text-emerald-900">
        <div className="text-xs text-emerald-700/80">Turno</div>
        <div className="text-sm font-semibold">{shift}</div>

        <div className="mt-0.5 inline-flex items-center justify-end gap-1 text-xs text-emerald-700 tabular-nums">
          <Clock3 className="size-3" />
          {time}
        </div>
      </div>
    </div>
  );
}
