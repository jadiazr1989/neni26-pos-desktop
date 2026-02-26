"use client";

import * as React from "react";
import { Check, TextCursorInput } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FontSize = "s" | "m" | "l";

const STORAGE_KEY = "ui:font";

function isFontSize(v: unknown): v is FontSize {
  return v === "s" || v === "m" || v === "l";
}

function readFontSize(): FontSize {
  if (typeof window === "undefined") return "m";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return isFontSize(v) ? v : "m";
}

function applyFontSize(v: FontSize): void {
  document.documentElement.dataset.font = v;
  window.localStorage.setItem(STORAGE_KEY, v);
}


function labelFor(v: FontSize): string {
  if (v === "s") return "Pequeña";
  if (v === "m") return "Mediana";
  return "Grande";
}

export function FontSizeDropdown(props: { disabled?: boolean }) {
  const [value, setValue] = React.useState<FontSize>("m");

  React.useEffect(() => {
    // inicial: leer de localStorage (coincide con tu ClientProviders)
    const initial = readFontSize();
    setValue(initial);
  }, []);

  const setFont = React.useCallback((v: FontSize) => {
    setValue(v);
    applyFontSize(v);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={Boolean(props.disabled)}
          title="Tamaño de letra"
        >
          <TextCursorInput className="mr-2 size-4" />
          Letra: <span className="ml-1 font-medium">{labelFor(value)}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Tamaño de letra</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(["s", "m", "l"] as const).map((k) => {
          const active = k === value;
          return (
            <DropdownMenuItem
              key={k}
              onSelect={() => setFont(k)}
              className="flex items-center justify-between"
            >
              <span>{labelFor(k)}</span>
              {active ? <Check className="size-4 text-muted-foreground" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
