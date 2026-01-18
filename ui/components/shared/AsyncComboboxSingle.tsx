// src/components/shared/AsyncComboboxSingle.tsx
"use client";

import * as React from "react";
import { ChevronsUpDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

export type ComboboxOption = { value: string; label: string };

export function AsyncComboboxSingle(props: {
  value: string | null;
  onChange: (value: string | null) => void;

  placeholder?: string;       // texto cuando no hay selección
  searchPlaceholder?: string; // placeholder del input
  emptyText?: string;

  disabled?: boolean;

  // async loading
  loadState: "idle" | "loading" | "ready" | "error";
  loadError?: string | null;
  items: ComboboxOption[];
  search: string;
  setSearch: (v: string) => void;
  ensureLoaded: () => void;

  className?: string; // container
}) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    if (!props.value) return null;
    return props.items.find((x) => x.value === props.value) ?? null;
  }, [props.items, props.value]);

  function onOpenChange(v: boolean) {
    setOpen(v);
    if (v) props.ensureLoaded();
  }

  return (
    <div className={cn("w-full", props.className)}>
      {/* selected pill */}
      {selected ? (
        <div className="mb-2 flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <span className="truncate max-w-[320px]">{selected.label}</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => props.onChange(null)}
              aria-label="Clear"
              disabled={props.disabled}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={props.disabled}
          >
            <span className="truncate text-left">
              {selected ? selected.label : props.placeholder ?? "Seleccionar…"}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              value={props.search}
              onValueChange={props.setSearch}
              placeholder={props.searchPlaceholder ?? "Buscar…"}
            />

            {props.loadState === "error" ? (
              <div className="px-3 py-2 text-sm text-destructive">
                {props.loadError ?? "Error cargando opciones."}
              </div>
            ) : null}

            <CommandEmpty>
              {props.loadState === "loading" ? "Cargando…" : props.emptyText ?? "Sin resultados."}
            </CommandEmpty>

            <CommandGroup>
              {props.items.map((it) => {
                const isSel = it.value === props.value;
                return (
                  <CommandItem
                    key={it.value}
                    value={it.label}
                    onSelect={() => {
                      props.onChange(it.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 size-4", isSel ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{it.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
