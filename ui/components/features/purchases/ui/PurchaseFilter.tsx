"use client";

import * as React from "react";
import { X, Search, Filter, Calendar, CalendarRange, ChevronDown, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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


function labelFor<T extends string>(opts: Array<{ value: T; label: string }>, value: T): string {
  return opts.find((o) => o.value === value)?.label ?? String(value);
}

export function PurchaseFilter<TStatus extends string, TPreset extends string>(props: {
  loading?: boolean;

  /** Screen decide si hay “dirty” real (status != ALL, preset != ALL, etc.) */
  isDirty?: boolean;

  // Search
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;

  // Estado (Dropdown)
  chipsLabel?: string;
  chipOptions: Array<FilterChipOption<TStatus>>;
  chipValue: TStatus;
  onChipChange: (v: TStatus) => void;

  // Fecha preset (Dropdown)
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

  // dirty local
  const hasAnyLocal = Boolean(props.search.trim()) || Boolean(props.from) || Boolean(props.to);
  const isDirty = Boolean(props.isDirty) || hasAnyLocal || showRange;


  const statusLabel = labelFor(props.chipOptions, props.chipValue);
  const presetLabel = labelFor(props.selectOptions, props.selectValue);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {/* Search */}
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

        {/* Controls */}
        <div className="w-full md:w-auto flex items-center justify-end gap-2">
          {/* Estado */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10" disabled={disabled} title="Estado">
                <Filter className="mr-2 size-4" />
                {props.chipsLabel ?? "Estado"}: <span className="ml-1 font-medium">{statusLabel}</span>
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Filter className="size-4" />
                {props.chipsLabel ?? "Estado"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {props.chipOptions.map((o) => {
                const active = o.value === props.chipValue;
                return (
                  <DropdownMenuItem
                    key={o.value}
                    onSelect={() => props.onChipChange(o.value)}
                    disabled={disabled}
                    className="flex items-center justify-between"
                  >
                    <span>{o.label}</span>
                    {active ? <Check className="size-4 text-muted-foreground" /> : null}
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator />

              <DropdownMenuItem onSelect={props.onClear} disabled={disabled || !isDirty}>
                Limpiar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Fecha */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10" disabled={disabled} title="Fecha">
                <Calendar className="mr-2 size-4" />
                {props.selectLabel ?? "Fecha"}: <span className="ml-1 font-medium">{presetLabel}</span>
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Calendar className="size-4" />
                {props.selectLabel ?? "Fecha"}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* ✅ Presets reales (TODAY/LAST_7/LAST_30/THIS_MONTH/RANGE) */}
              {props.selectOptions.map((o) => {
                const active = o.value === props.selectValue;
                return (
                  <DropdownMenuItem
                    key={o.value}
                    onSelect={() => props.onSelectChange(o.value)}
                    disabled={disabled}
                    className="flex items-center justify-between"
                  >
                    <span>{o.label}</span>
                    {active ? <Check className="size-4 text-muted-foreground" /> : null}
                  </DropdownMenuItem>
                );
              })}

              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={props.onClear} disabled={disabled || !isDirty}>
                Limpiar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear icon */}
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
