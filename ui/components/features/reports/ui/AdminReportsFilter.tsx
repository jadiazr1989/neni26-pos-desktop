"use client";

import * as React from "react";
import { Calendar, CalendarRange, Check, ChevronDown, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type { CashSessionStatusFilter } from "@/lib/modules/admin/reports";

export type DatePreset = "HOY" | "ULTIMOS_7_DIAS" | "ULTIMOS_30_DIAS" | "ESTE_MES" | "RANGO";

type Opt<V extends string> = { value: V; label: string };

function labelFor<V extends string>(opts: Array<Opt<V>>, value: V): string {
  return opts.find((o) => o.value === value)?.label ?? value;
}

export const AdminReportsFilter = React.memo(function AdminReportsFilter(props: {
  loading?: boolean;

  warehouseOptions: Array<{ value: string; label: string }>;
  terminalOptions?: Array<{ value: string; label: string }>;

  warehouseId: string | null;
  terminalId: string | null;

  showStatus?: boolean;
  status?: CashSessionStatusFilter;
  onStatusChange?: (v: CashSessionStatusFilter) => void;

  preset: DatePreset;
  from: string | null;
  to: string | null;

  onWarehouseChange: (v: string | null) => void;
  onTerminalChange: (v: string | null) => void;

  onPresetChange: (v: DatePreset) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;

  onClear: () => void;
}) {
  const disabled = Boolean(props.loading);
  const showRange = props.preset === "RANGO";

  const statusOpts: Array<Opt<CashSessionStatusFilter>> = [
    { value: "closed", label: "Cerrada" },
    { value: "open", label: "Abierta" },
    { value: "any", label: "Cualquiera" },
  ];

  const presetOpts: Array<Opt<DatePreset>> = [
    { value: "HOY", label: "Hoy" },
    { value: "ULTIMOS_7_DIAS", label: "Últimos 7 días" },
    { value: "ULTIMOS_30_DIAS", label: "Últimos 30 días" },
    { value: "ESTE_MES", label: "Este mes" },
    { value: "RANGO", label: "Rango…" },
  ];

  const warehouseLabel = props.warehouseId
    ? (props.warehouseOptions.find((o) => o.value === props.warehouseId)?.label ?? props.warehouseId)
    : "Todos";

  const terminalLabel = props.terminalId
    ? ((props.terminalOptions ?? []).find((o) => o.value === props.terminalId)?.label ?? props.terminalId)
    : "Todos";

  const presetLabel = labelFor(presetOpts, props.preset);

  const statusLabel =
    props.showStatus && props.status ? labelFor(statusOpts, props.status) : "";

  const isDirty =
    Boolean(props.warehouseId) ||
    Boolean(props.terminalId) ||
    (props.showStatus ? (props.status ?? "closed") !== "closed" : false) ||
    props.preset !== "HOY" ||
    Boolean(props.from) ||
    Boolean(props.to);

  return (
    <div className="space-y-2">
      <div className="rounded-xl border bg-muted/20 px-2 py-2 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">
          {props.showStatus ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" className="h-10 shrink-0" disabled={disabled} title="Estado">
                  <Filter className="mr-2 size-4" />
                  Estado: <span className="ml-1 font-medium">{statusLabel}</span>
                  <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Filter className="size-4" /> Estado
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {statusOpts.map((o) => {
                  const active = o.value === props.status;
                  return (
                    <DropdownMenuItem
                      key={o.value}
                      onSelect={() => props.onStatusChange?.(o.value)}
                      disabled={disabled}
                      className="flex items-center justify-between"
                    >
                      <span>{o.label}</span>
                      {active ? <Check className="size-4 text-muted-foreground" /> : null}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10 shrink-0" disabled={disabled} title="Fecha">
                <Calendar className="mr-2 size-4" />
                Fecha: <span className="ml-1 font-medium">{presetLabel}</span>
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Calendar className="size-4" /> Fecha
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {presetOpts.map((o) => {
                const active = o.value === props.preset;
                return (
                  <DropdownMenuItem
                    key={o.value}
                    onSelect={() => props.onPresetChange(o.value)}
                    disabled={disabled}
                    className="flex items-center justify-between"
                  >
                    <span>{o.label}</span>
                    {active ? <Check className="size-4 text-muted-foreground" /> : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-3"
              onClick={props.onClear}
              disabled={disabled || !isDirty}
              title="Restablecer filtros"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {showRange && (
        <div className="mt-2 grid grid-cols-12 gap-2 rounded-xl border bg-background/60 p-3">
          <div className="col-span-12 sm:col-span-6">
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="date"
                value={props.from ?? ""}
                onChange={(e) => props.onFromChange(e.target.value)}
                disabled={disabled}
                className="pl-9 h-10"
              />
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6">
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="date"
                value={props.to ?? ""}
                onChange={(e) => props.onToChange(e.target.value)}
                disabled={disabled}
                className="pl-9 h-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});