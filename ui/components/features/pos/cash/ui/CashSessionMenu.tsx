"use client";

import * as React from "react";
import type { JSX } from "react";
import {
  Calculator,
  ChevronDown,
  Lock,
  ShieldAlert,
  Store,
  TimerReset,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = "ADMIN" | "MANAGER" | "CASHIER";
type WarningLevel = "none" | "info" | "warning" | "critical";

function formatDuration(openedAt: string | null | undefined): string | null {
  if (!openedAt) return null;

  const ms = new Date(openedAt).getTime();
  if (!Number.isFinite(ms)) return null;

  const diffMin = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;

  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function formatMinutesLeft(minutes: number | null | undefined): string | null {
  if (minutes == null) return null;
  if (minutes <= 0) return "0m";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}


function formatBusinessDay(value: string | null | undefined): string | null {
  if (!value) return null;

  const raw = value.slice(0, 10); // YYYY-MM-DD
  const [year, month, day] = raw.split("-").map(Number);

  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}


export function CashSessionMenu(props: {
  className?: string;
  variant?: "icon" | "button";
  role: Role;
  offline: boolean;
  cashOpen: boolean;
  itemsInProgress: boolean;

  forceCloseRequired?: boolean;
  staleSession?: boolean;
  warningLevel?: WarningLevel;
  minutesUntilClose?: number | null;
  openedAt?: string | null;
  businessDay?: string | null;
  shiftLabel?: string | null;

  onOpenCount: () => void;
  onOpenClose: () => void;
  onGoAdmin?: () => void;
}): JSX.Element {
  const variant = props.variant ?? "button";
  const isAdminOrManager =
    props.role === "ADMIN" || props.role === "MANAGER";

  const canGoAdmin = isAdminOrManager && !!props.onGoAdmin;

  const canCount =
    !props.offline &&
    props.cashOpen &&
    !props.itemsInProgress &&
    !props.forceCloseRequired;

  const canClose =
    !props.offline &&
    props.cashOpen &&
    isAdminOrManager &&
    !props.itemsInProgress;

  const openDuration = props.cashOpen ? formatDuration(props.openedAt) : null;
  const closeLabel = formatMinutesLeft(props.minutesUntilClose);

  const statusTone = props.forceCloseRequired || props.staleSession
    ? "danger"
    : props.cashOpen
      ? "success"
      : "warning";

  const statusLabel = props.forceCloseRequired || props.staleSession
    ? "Cierre obligatorio"
    : props.cashOpen
      ? "Abierta"
      : "Cerrada";

  const hint = React.useMemo(() => {
    if (props.offline) return "Sin conexión";
    if (!props.cashOpen) return "Caja cerrada";
    if (props.itemsInProgress) return "Venta en curso";
    if (props.forceCloseRequired) return "Debe cerrarse la caja";
    if (isAdminOrManager) return "Acceso administrativo disponible";
    return "Caja disponible";
  }, [
    props.offline,
    props.cashOpen,
    props.itemsInProgress,
    props.forceCloseRequired,
    isAdminOrManager,
  ]);

  const disableTrigger = !canCount && !canClose && !canGoAdmin;
  const businessDayLabel = formatBusinessDay(props.businessDay);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disableTrigger}
          className={cn(
            "h-10 rounded-xl shadow-sm",
            variant === "icon" ? "w-10 p-0" : "px-3",
            props.className
          )}
          aria-label="Caja"
        >
          {variant === "icon" ? (
            <Store className="size-4" />
          ) : (
            <>
              <Store className="mr-2 size-4" />
              <span className="text-sm font-medium">Caja</span>
              <ChevronDown className="ml-2 size-4 opacity-70" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[340px] rounded-2xl p-0 overflow-hidden"
      >
        <div className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Caja</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {props.cashOpen ? "Sesión activa" : "Sin caja abierta"}
              </div>
            </div>

            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                statusTone === "success" && "bg-emerald-500/10 text-emerald-700",
                statusTone === "warning" && "bg-amber-500/10 text-amber-800",
                statusTone === "danger" && "bg-red-500/10 text-red-700"
              )}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="space-y-2 px-4 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground">Estado</span>
            <span className="text-right font-medium">{hint}</span>
          </div>

          {openDuration ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Tiempo abierta</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <TimerReset className="size-3.5" />
                {props.staleSession ? "Sesión antigua" : openDuration}
              </span>
            </div>
          ) : null}

          {closeLabel && props.warningLevel && props.warningLevel !== "none" ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Cierre</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  props.forceCloseRequired ? "text-red-700" : "text-amber-800"
                )}
              >
                <Clock3 className="size-3.5" />
                {props.forceCloseRequired ? "Cerrar ahora" : `En ${closeLabel}`}
              </span>
            </div>
          ) : null}
          {businessDayLabel ? (
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Business day</span>
              <span className="font-medium">{businessDayLabel}</span>
            </div>
          ) : null}
          {props.shiftLabel ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Turno</span>
              <span className="font-medium">{props.shiftLabel}</span>
            </div>
          ) : null}

          {props.forceCloseRequired ? (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-700">
              La operación quedó bloqueada hasta completar el cierre de caja.
            </div>
          ) : null}
        </div>

        <div className="space-y-2 border-t px-4 py-3">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start rounded-xl"
            disabled={!canCount}
            onClick={props.onOpenCount}
          >
            <Calculator className="mr-2 size-4" />
            Arqueo
          </Button>

          <Button
            type="button"
            className={cn(
              "w-full justify-start rounded-xl",
              props.forceCloseRequired
                ? "bg-red-600 hover:bg-red-700 text-white"
                : ""
            )}
            disabled={!canClose}
            onClick={props.onOpenClose}
          >
            {props.forceCloseRequired ? (
              <ShieldAlert className="mr-2 size-4" />
            ) : (
              <Lock className="mr-2 size-4" />
            )}
            {props.forceCloseRequired ? "Cerrar caja ahora" : "Cerrar caja"}
          </Button>

          {canGoAdmin ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full justify-start rounded-xl"
              onClick={props.onGoAdmin}
            >
              Ir a administración
            </Button>
          ) : null}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}