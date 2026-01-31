// src/modules/admin/reports/ui/AdminReportsFilter.tsx
"use client";

import { Calendar, CalendarRange, Check, ChevronDown, Filter, Monitor, Store, X } from "lucide-react";

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

type Opt = { value: string; label: string };

function labelFor(opts: Opt[], value: string): string {
  return opts.find((o) => o.value === value)?.label ?? String(value);
}

export function AdminReportsFilter(props: {
  loading?: boolean;

  // options
  warehouseOptions: Array<{ value: string; label: string }>;
  terminalOptions?: Array<{ value: string; label: string }>;

  // values
  warehouseId: string | null;
  terminalId: string | null;
  status: CashSessionStatusFilter;

  preset: DatePreset;
  from: string | null; // yyyy-mm-dd si RANGO
  to: string | null;

  // setters
  onWarehouseChange: (v: string | null) => void;
  onTerminalChange: (v: string | null) => void;
  onStatusChange: (v: CashSessionStatusFilter) => void;

  onPresetChange: (v: DatePreset) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;

  // actions
  onClear: () => void;
  onApply: () => void;
}) {
  const disabled = Boolean(props.loading);
  const showRange = props.preset === "RANGO";

  const statusOpts: Array<{ value: CashSessionStatusFilter; label: string }> = [
    { value: "closed", label: "Cerrada" },
    { value: "open", label: "Abierta" },
    { value: "any", label: "Cualquiera" },
  ];

  const presetOpts: Array<{ value: DatePreset; label: string }> = [
    { value: "HOY", label: "Hoy" },
    { value: "ULTIMOS_7_DIAS", label: "Últimos 7 días" },
    { value: "ULTIMOS_30_DIAS", label: "Últimos 30 días" },
    { value: "ESTE_MES", label: "Este mes" },
    { value: "RANGO", label: "Rango…" },
  ];

  const warehouseLabel = props.warehouseId
    ? labelFor(props.warehouseOptions as Opt[], props.warehouseId)
    : "Todos";

  const terminalLabel = props.terminalId
    ? labelFor((props.terminalOptions ?? []) as Opt[], props.terminalId)
    : "Todos";

  const statusLabel = labelFor(statusOpts as unknown as Opt[], props.status);
  const presetLabel = labelFor(presetOpts as unknown as Opt[], props.preset);

  const isDirty =
    Boolean(props.warehouseId) ||
    Boolean(props.terminalId) ||
    props.status !== "closed" ||
    props.preset !== "ULTIMOS_7_DIAS" ||
    Boolean(props.from) ||
    Boolean(props.to);

  return (
    <div className="space-y-2">
      {/* ✅ Filter bar compacta */}
      <div className="rounded-xl border bg-muted/20 px-2 py-2 shadow-sm">

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1">

          {/* Estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10 shrink-0 " disabled={disabled} title="Estado">
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
                    onSelect={() => props.onStatusChange(o.value)}
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

          {/* Fecha */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10 shrink-0 " disabled={disabled} title="Fecha">
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

            {/* ✅ Apply */}
            <Button
              type="button"
              className="h-10 px-4"
              onClick={props.onApply}
              disabled={disabled}
              title="Aplicar filtros"
            >
              Aplicar
            </Button>


            {/* Clear */}
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
      {/* Rango (solo si aplica) */}
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
}
