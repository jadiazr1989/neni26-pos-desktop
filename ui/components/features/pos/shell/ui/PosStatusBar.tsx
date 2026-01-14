"use client";

import { Wifi, WifiOff, Monitor, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

function Chip(props: {
  tone: "success" | "warning" | "danger";
  children: React.ReactNode;
  compact?: boolean;
}) {
  const base = cn(
    "inline-flex items-center gap-2 rounded-full border font-semibold",
    props.compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1 text-xs"
  );

  const tone =
    props.tone === "success"
      ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-700"
      : props.tone === "warning"
        ? "bg-amber-500/15 border-amber-500/25 text-amber-800"
        : "bg-red-500/15 border-red-500/25 text-red-700";

  return <span className={cn(base, tone)}>{props.children}</span>;
}

export function PosStatusBar(props: {
  offline: boolean;
  terminalReady: boolean;
  cashOpen: boolean;
  compact?: boolean; // ✅ nuevo
}) {
  const iconSize = props.compact ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <Chip tone={props.offline ? "danger" : "success"} compact={props.compact}>
        {props.offline ? <WifiOff className={iconSize} /> : <Wifi className={iconSize} />}
        {props.offline ? "Offline" : "Online"}
      </Chip>

      <Chip tone={props.terminalReady ? "success" : "warning"} compact={props.compact}>
        <Monitor className={iconSize} />
        {props.terminalReady ? "Terminal" : "No terminal"}
      </Chip>

      <Chip tone={props.cashOpen ? "success" : "warning"} compact={props.compact}>
        {props.cashOpen ? <Unlock className={iconSize} /> : <Lock className={iconSize} />}
        {props.cashOpen ? "Caja" : "Caja cerrada"}
      </Chip>
    </div>
  );
}
