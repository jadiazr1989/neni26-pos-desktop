"use client";

import type { JSX } from "react";
import { useMemo } from "react";
import {
  Wallet,
  Calculator,
  Lock,
  WifiOff,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  DoorClosed,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "MANAGER" | "CASHIER";

type Variant = "icon" | "button";

function getStatus(props: {
  offline: boolean;
  cashOpen: boolean;
  itemsInProgress: boolean;
}) {
  if (props.offline) return { tone: "danger" as const, label: "Sin conexión" };
  if (!props.cashOpen) return { tone: "warning" as const, label: "Caja cerrada" };
  if (props.itemsInProgress) return { tone: "muted" as const, label: "Venta en curso" };
  return { tone: "success" as const, label: "Caja lista" };
}

export function CashSessionMenu(props: {
  className?: string;
  variant?: Variant;
  role: Role;

  offline: boolean;
  cashOpen: boolean;
  itemsInProgress: boolean;

  onOpenCount: () => void;
  onOpenClose: () => void;

  onGoAdmin?: () => void; // 👈 NUEVO
}): JSX.Element {

  const variant = props.variant ?? "button";

  // Reglas de habilitación típicas POS:
  // - COUNT solo si hay caja abierta y online (y mejor si no hay venta en curso).
  // - CLOSE (Z) igual; en muchos POS solo cuando no hay venta activa.
  const isAdminOrManager = props.role === "ADMIN" || props.role === "MANAGER";
  const canGoAdmin = isAdminOrManager && !!props.onGoAdmin;

  const canCount =
    !props.offline &&
    props.cashOpen &&
    !props.itemsInProgress;

  const canClose =
    canCount &&
    isAdminOrManager; // 🔐 regla clave


  const status = useMemo(
    () => getStatus({ offline: props.offline, cashOpen: props.cashOpen, itemsInProgress: props.itemsInProgress }),
    [props.offline, props.cashOpen, props.itemsInProgress]
  );

  const hint = useMemo(() => {
    if (props.offline) return "Sin conexión";
    if (!props.cashOpen) return "Caja cerrada";
    if (props.itemsInProgress) return "Venta en curso";
    if (isAdminOrManager) return "Acceso administrativo disponible";
    return "Rol: CASHIER";
  }, [props.offline, props.cashOpen, props.itemsInProgress, isAdminOrManager]);


  const disableTrigger =
    !canCount &&
    !canClose &&
    !canGoAdmin; // 👈 clave


  const Trigger = (
    <Button
      type="button"
      variant="secondary"
      className={cn(
        "h-10 rounded-xl",
        variant === "icon" ? "w-10 px-0" : "px-3",
        // micro-estilo “pro”
        "shadow-sm",
        props.className
      )}
      aria-label="Caja"
      disabled={disableTrigger}
    >
      {/* icon */}
      <Wallet className={cn("size-4", variant === "button" ? "mr-2" : "")} />

      {/* label opcional */}
      {variant === "button" ? (
        <>
          <span className="text-sm font-medium">Caja</span>
          <ChevronDown className="ml-2 size-4 opacity-60" />
        </>
      ) : null}
    </Button>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{Trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="text-xs">
            {hint}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
          <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Sesión de caja</span>

            {/* estado a la derecha */}
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                status.tone === "success" && "bg-emerald-500/10 border-emerald-500/25 text-emerald-700",
                status.tone === "warning" && "bg-amber-500/10 border-amber-500/25 text-amber-800",
                status.tone === "danger" && "bg-red-500/10 border-red-500/25 text-red-700",
                status.tone === "muted" && "bg-muted border-border text-muted-foreground"
              )}
            >
              {status.tone === "danger" ? <WifiOff className="size-3" /> : null}
              {status.tone === "warning" ? <AlertTriangle className="size-3" /> : null}
              {status.tone === "success" ? <CheckCircle2 className="size-3" /> : null}
              <span>{status.label}</span>
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={props.onOpenCount}
            disabled={!canCount}
          >
            <Calculator className="mr-2 size-4" />
            Arqueo de caja
            <span className="ml-auto text-[11px] text-muted-foreground">No cierra</span>
          </DropdownMenuItem>


          <DropdownMenuItem
            onClick={props.onOpenClose}
            disabled={!canClose}
            className="text-destructive focus:text-destructive"
          >
            <DoorClosed className="mr-2 size-4" />
            Cerrar caja (Z)
            <span className="ml-auto text-[11px] text-muted-foreground">Definitivo
            </span>
          </DropdownMenuItem>

          {canGoAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={props.onGoAdmin}>
                <Shield className="mr-2 size-4 rotate-90" />
                Administración
                <span className="ml-auto text-[11px] text-muted-foreground">
                  ADMIN
                </span>
              </DropdownMenuItem>
            </>
          )}


          <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
            {hint}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
