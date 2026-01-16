// src/components/shared/EntityMultiComboBox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type MultiComboItem = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type LoadState = "idle" | "loading" | "ready" | "error";

export function EntityMultiComboBox(props: {
  label: string;
  placeholder?: string;

  values: string[];
  onChange: (values: string[]) => void;

  items: MultiComboItem[];

  loadState: LoadState;
  loadError?: string | null;
  onOpenLoad?: () => void;

  search: string;
  onSearchChange: (v: string) => void;

  disabled?: boolean;

  maxBadges?: number; // opcional (para no explotar UI)
}) {
  const [open, setOpen] = React.useState(false);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [contentWidth, setContentWidth] = React.useState<number | undefined>(undefined);

  const disabled = Boolean(props.disabled);

  const selectedItems = React.useMemo(() => {
    const set = new Set(props.values);
    return props.items.filter((it) => set.has(it.value));
  }, [props.values, props.items]);

  const measure = React.useCallback(() => {
    const w = triggerRef.current?.offsetWidth;
    if (w && w > 0) setContentWidth(w);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, measure]);

  function toggle(value: string) {
    const set = new Set(props.values);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    props.onChange(Array.from(set));
  }

  return (
    <div className="grid gap-2 w-full">
      <div className="text-sm font-medium">{props.label}</div>

      {/* Pills */}
      {selectedItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedItems.slice(0, props.maxBadges ?? selectedItems.length).map((it) => (
            <Badge key={it.value} variant="secondary" className="gap-2">
              <span className="max-w-[260px] truncate">{it.label}</span>
              <button
                type="button"
                className="opacity-70 hover:opacity-100"
                onClick={() => toggle(it.value)}
                disabled={disabled}
                title="Quitar"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {props.maxBadges && selectedItems.length > props.maxBadges ? (
            <Badge variant="outline">+{selectedItems.length - props.maxBadges}</Badge>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {props.placeholder ?? "Selecciona una o más opciones…"}
        </div>
      )}

      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (v) {
            measure();
            props.onOpenLoad?.();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            <span className="truncate">
              {selectedItems.length > 0
                ? `${selectedItems.length} seleccionad${selectedItems.length === 1 ? "a" : "as"}`
                : (props.placeholder ?? "Seleccionar…")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="p-0" style={{ width: contentWidth }}>
          <Command shouldFilter={false}>
            <CommandInput
              value={props.search}
              onValueChange={props.onSearchChange}
              placeholder="Escribe para buscar…"
            />
            <CommandList>
              {props.loadState === "loading" ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">Cargando…</div>
              ) : props.loadState === "error" ? (
                <div className="px-3 py-2 text-xs text-destructive">
                  {props.loadError ?? "Error cargando opciones."}
                </div>
              ) : props.items.length === 0 ? (
                <CommandEmpty>No hay resultados.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {props.items.map((it) => {
                    const active = props.values.includes(it.value);
                    return (
                      <CommandItem
                        key={it.value}
                        value={it.value}
                        disabled={it.disabled}
                        onSelect={() => toggle(it.value)}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm truncate">{it.label}</div>
                            {it.hint ? (
                              <div className="text-xs text-muted-foreground truncate">{it.hint}</div>
                            ) : null}
                          </div>
                          <Check className={cn("h-4 w-4", active ? "opacity-100" : "opacity-0")} />
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
