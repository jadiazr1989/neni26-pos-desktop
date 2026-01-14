"use client";

import type { JSX } from "react";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { MoreVertical, X, PauseCircle, StickyNote, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PosMoreMenuHandle = { open: () => void };

type Props = {
  tone?: "neutral" | "amber";
  onHold: () => void;
  onNote: () => void;
  onCustomer: () => void;
  onCancel: () => void;
};

export const PosMoreMenu = forwardRef<PosMoreMenuHandle, Props>(function PosMoreMenu(
  props,
  ref
): JSX.Element {
  const btnRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => btnRef.current?.click(),
  }));

  const isAmber = props.tone === "amber";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={btnRef}
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-12 px-0 rounded-xl",
            "bg-background/70 border-border/70 hover:bg-background",
            "focus-visible:ring-2",
            isAmber ? "focus-visible:ring-amber-300" : "focus-visible:ring-ring"
          )}
          aria-label="Opciones"
        >
          <MoreVertical className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Acciones</DropdownMenuLabel>

        <DropdownMenuItem onClick={props.onHold}>
          <PauseCircle className="mr-2 size-4" />
          Hold
        </DropdownMenuItem>

        <DropdownMenuItem onClick={props.onNote}>
          <StickyNote className="mr-2 size-4" />
          Nota
        </DropdownMenuItem>

        <DropdownMenuItem onClick={props.onCustomer}>
          <UserRound className="mr-2 size-4" />
          Cliente
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={props.onCancel}
          className="text-destructive focus:text-destructive"
        >
          <X className="mr-2 size-4" />
          Cancelar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
          Enter: Cobrar · Esc: Menú
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
