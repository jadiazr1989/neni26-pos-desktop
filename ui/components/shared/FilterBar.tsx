// src/components/shared/FilterBar.tsx
"use client";

import * as React from "react";
import { X, Search, Filter, Calendar, CalendarRange, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FilterChipOption<T extends string> = { value: T; label: string };
export type FilterSelectOption<T extends string> = { value: T; label: string };

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDaysISO(baseISO: string, days: number): string {
  const d = new Date(`${baseISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function FilterBar<TStatus extends string, TPreset extends string>(props: {
  loading?: boolean;

  /** Screen decide si hay “dirty” real (status != ALL, preset != ALL, etc.) */
  isDirty?: boolean;

  // Search
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;

  // Estado (Select)
  chipsLabel?: string;
  chipOptions: Array<FilterChipOption<TStatus>>;
  chipValue: TStatus;
  onChipChange: (v: TStatus) => void;

  // Fecha preset (Select)
  selectLabel?: string;
  selectOptions: Array<FilterSelectOption<TPreset>>;
  selectValue: TPreset;
  onSelectChange: (v: TPreset) => void;

  // Range
  rangeValue: TPreset; // ej "RANGE"
  from: string | null;
  to: string | null;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;

  // Clear
  onClear: () => void;

  // Quick dates
  enableQuickDates?: boolean;
}) {
  const disabled = Boolean(props.loading);
  const showRange = props.selectValue === props.rangeValue;

  // Esto cubre search/from/to aunque Screen no pase isDirty
  const hasAnyLocal = Boolean(props.search.trim()) || Boolean(props.from) || Boolean(props.to);
  const isDirty = Boolean(props.isDirty) || hasAnyLocal || showRange;

  // ✅ sin useCallback -> no warning del compiler
  function applyQuickRange(from: string, to: string) {
    props.onSelectChange(props.rangeValue);
    props.onFromChange(from);
    props.onToChange(to);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Top bar */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Left: Search */}
        <div className="w-full md:flex-1 md:max-w-[560px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={props.search}
              onChange={(e) => props.onSearchChange(e.target.value)}
              placeholder={props.searchPlaceholder ?? "Buscar…"}
              disabled={disabled}
              className="pl-9"
            />
            {props.search.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={() => props.onSearchChange("")}
                className="absolute right-1 top-1/2 -translate-y-1/2"
                title="Limpiar búsqueda"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          {/* Estado */}
          <Select value={props.chipValue} onValueChange={(v) => props.onChipChange(v as TStatus)} disabled={disabled}>
            <SelectTrigger className="h-10 w-[170px]">
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="size-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder={props.chipsLabel ?? "Estado"} />
              </div>
            </SelectTrigger>

            <SelectContent align="end">
              {props.chipOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fecha preset */}
          <Select value={props.selectValue} onValueChange={(v) => props.onSelectChange(v as TPreset)} disabled={disabled}>
            <SelectTrigger className="h-10 w-[190px]">
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder={props.selectLabel ?? "Fecha"} />
              </div>
            </SelectTrigger>

            <SelectContent align="end">
              {props.selectOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Atajos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10" disabled={disabled} title="Atajos de fecha">
                <CalendarRange className="mr-2 size-4" />
                Atajos
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <CalendarRange className="size-4" />
                Fechas rápidas
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  if (!props.enableQuickDates) return;
                  const t = todayISO();
                  applyQuickRange(t, t);
                }}
                disabled={!props.enableQuickDates || disabled}
              >
                Hoy
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (!props.enableQuickDates) return;
                  const t = todayISO();
                  applyQuickRange(addDaysISO(t, -6), t);
                }}
                disabled={!props.enableQuickDates || disabled}
              >
                Últimos 7 días
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (!props.enableQuickDates) return;
                  const t = todayISO();
                  applyQuickRange(addDaysISO(t, -29), t);
                }}
                disabled={!props.enableQuickDates || disabled}
              >
                Últimos 30 días
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={props.onClear} disabled={disabled || !isDirty}>
                Limpiar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear */}
          {isDirty && (
            <Button type="button" variant="outline" className="h-10" onClick={props.onClear} disabled={disabled} title="Limpiar">
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Range inputs */}
      {showRange && (
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-12 sm:col-span-6">
            <div className="relative">
              <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="date"
                value={props.from ?? ""}
                onChange={(e) => props.onFromChange(e.target.value)}
                disabled={disabled}
                className="pl-9"
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
                className="pl-9"
              />
            </div>
          </div>

          <div className="col-span-12 text-xs text-muted-foreground flex items-center gap-2">
            <CalendarRange className="size-4" />
            <span className="truncate">
              {props.from ?? "—"} → {props.to ?? "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
