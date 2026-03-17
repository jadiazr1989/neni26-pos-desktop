"use client";

import * as React from "react";
import {
  Wifi,
  WifiOff,
  Monitor,
  Lock,
  Unlock,
  TimerReset,
  AlarmClock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Chip(props: {
  tone: "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
  compact?: boolean;
}) {
  const base = cn(
    "inline-flex items-center gap-2 rounded-full border font-semibold whitespace-nowrap",
    props.compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs"
  );

  const tone =
    props.tone === "success"
      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-700"
      : props.tone === "warning"
        ? "bg-amber-500/15 border-amber-500/25 text-amber-800"
        : props.tone === "danger"
          ? "bg-red-500/15 border-red-500/25 text-red-700"
          : "bg-muted/60 border-border text-muted-foreground";

  return <span className={cn(base, tone)}>{props.children}</span>;
}

function getDiffMinutes(fromIso: string | null | undefined, nowMs: number): number | null {
  if (!fromIso) return null;
  const fromMs = new Date(fromIso).getTime();
  if (!Number.isFinite(fromMs)) return null;
  return Math.max(0, Math.floor((nowMs - fromMs) / 60000));
}

function formatDurationLabel(totalMinutes: number | null): string | null {
  if (totalMinutes == null) return null;
  if (totalMinutes <= 0) return "0m";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatMinutesLeft(minutes: number | null): string | null {
  if (minutes == null) return null;
  if (minutes <= 0) return "0m";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours <= 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function PosStatusBar(props: {
  offline: boolean;
  terminalReady: boolean;
  cashOpen: boolean;
  compact?: boolean;

  openedAt?: string | null;
  minutesUntilClose?: number | null;
  warningLevel?: "none" | "info" | "warning" | "critical";
  forceCloseRequired?: boolean;

  staleSession?: boolean;
  staleSessionMaxHours?: number;
}) {
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60000);

    return () => window.clearInterval(id);
  }, []);

  const iconSize = props.compact ? "size-3.5" : "size-4";

  const openMinutes = props.cashOpen ? getDiffMinutes(props.openedAt ?? null, nowMs) : null;
  const openDuration = formatDurationLabel(openMinutes);
  const closeLabel = formatMinutesLeft(props.minutesUntilClose ?? null);

  const staleLabel =
    props.staleSession && props.staleSessionMaxHours
      ? `Sesión > ${props.staleSessionMaxHours}h`
      : "Sesión antigua";

  const closeTone: "warning" | "danger" | "neutral" =
    props.forceCloseRequired || props.warningLevel === "critical" || props.staleSession
      ? "danger"
      : props.warningLevel === "warning" || props.warningLevel === "info"
        ? "warning"
        : "neutral";

  return (
    <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
      <Chip tone={props.offline ? "danger" : "success"} compact={props.compact}>
        {props.offline ? <WifiOff className={iconSize} /> : <Wifi className={iconSize} />}
        {props.offline ? "Offline" : "Online"}
      </Chip>

      <Chip tone={props.terminalReady ? "success" : "warning"} compact={props.compact}>
        <Monitor className={iconSize} />
        {props.terminalReady ? "Terminal" : "No terminal"}
      </Chip>

      <Chip
        tone={
          props.forceCloseRequired || props.staleSession
            ? "danger"
            : props.cashOpen
              ? "success"
              : "warning"
        }
        compact={props.compact}
      >
        {props.cashOpen ? <Unlock className={iconSize} /> : <Lock className={iconSize} />}
        {props.forceCloseRequired || props.staleSession
          ? "Cerrar caja"
          : props.cashOpen
            ? "Caja abierta"
            : "Caja cerrada"}
      </Chip>

      {props.cashOpen && props.staleSession ? (
        <Chip tone="danger" compact={props.compact}>
          <AlertTriangle className={iconSize} />
          {staleLabel}
        </Chip>
      ) : props.cashOpen && openDuration ? (
        <Chip tone="neutral" compact={props.compact}>
          <TimerReset className={iconSize} />
          Abierta {openDuration}
        </Chip>
      ) : null}

      {props.cashOpen && closeLabel && props.warningLevel && props.warningLevel !== "none" ? (
        <Chip tone={closeTone} compact={props.compact}>
          {props.forceCloseRequired ? (
            <AlertTriangle className={iconSize} />
          ) : (
            <AlarmClock className={iconSize} />
          )}
          {props.forceCloseRequired ? "Cierre obligatorio" : `Cierra en ${closeLabel}`}
        </Chip>
      ) : null}
    </div>
  );
}