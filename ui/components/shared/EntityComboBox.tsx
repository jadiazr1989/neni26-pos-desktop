// src/components/shared/EntityComboBox.tsx
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

export type ComboItem = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type LoadState = "idle" | "loading" | "ready" | "error";

export function EntityComboBox(props: {
  label: string;
  placeholder?: string;

  value: string | null;
  onChange: (value: string | null) => void;

  // ✅ ahora puede venir vacío y llenarse async
  items: ComboItem[];

  // async
  loadState: LoadState;
  loadError?: string | null;

  // ✅ se dispara cuando abres por primera vez o cuando quieras
  onOpenLoad?: () => void;

  search: string;
  onSearchChange: (v: string) => void;

  disabled?: boolean;
  allowClear?: boolean;

  // row extra “Sin padre”
  allowNoneOption?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [contentWidth, setContentWidth] = React.useState<number | undefined>(undefined);

  const allowClear = props.allowClear ?? true;
  const allowNone = props.allowNoneOption ?? true;
  const disabled = Boolean(props.disabled);

  const selected = React.useMemo(() => {
    if (!props.value) return null;
    return props.items.find((it) => it.value === props.value) ?? null;
  }, [props.value, props.items]);

  // ✅ medir ancho para que PopoverContent ocupe toda la línea del trigger
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

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) {
      measure();
      props.onOpenLoad?.();
    }
  }

  return (
    <div className="grid gap-2 w-full">
      <div className="text-sm font-medium">{props.label}</div>

      {/* Selected pill */}
      {selected ? (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="max-w-full truncate">
            <span className="truncate">{selected.label}</span>
            {selected.hint ? (
              <span className="ml-2 text-muted-foreground truncate">{selected.hint}</span>
            ) : null}
          </Badge>

          {allowClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => props.onChange(null)}
              disabled={disabled}
              title="Quitar selección"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {props.placeholder ?? "Selecciona una opción…"}
        </div>
      )}

      <Popover open={open} onOpenChange={handleOpenChange}>
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
              {selected?.label ?? (props.placeholder ?? "Seleccionar…")}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="p-0"
          style={{ width: contentWidth }}
        >
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
                  {allowNone && (
                    <CommandItem
                      value="__none__"
                      onSelect={() => {
                        props.onChange(null);
                        setOpen(false);
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="truncate">— Sin padre —</span>
                        {!props.value ? <Check className="h-4 w-4 opacity-100" /> : null}
                      </div>
                    </CommandItem>
                  )}

                  {props.items.map((it) => {
                    const active = props.value === it.value;
                    return (
                      <CommandItem
                        key={it.value}
                        value={it.value}
                        disabled={it.disabled}
                        onSelect={() => {
                          props.onChange(it.value);
                          setOpen(false);
                        }}
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
