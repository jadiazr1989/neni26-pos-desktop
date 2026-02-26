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

import type { HotkeyCode } from "@/lib/hotkeys";
import { HotkeyLabel } from "@/components/shared/HotkeyLabel";

export type PosMoreMenuHandle = { open: () => void };

type Props = {
  tone?: "neutral" | "amber";
  onHold: () => void;
  onNote: () => void;
  onCustomer: () => void;
  onCancel: () => void;

  showHotkeysHint?: boolean; // default true
  className?: string;

  label?: string;      // default "Opciones"
  hotkey?: HotkeyCode; // default "Escape"

  holdHotkey?: HotkeyCode;     // default "F6"
  noteHotkey?: HotkeyCode;     // default "F7"
  customerHotkey?: HotkeyCode; // default "F8"
  cancelHotkey?: HotkeyCode;   // default "Delete"
};

function KeyHint(props: { code: HotkeyCode }) {
  return (
    <span className="ml-auto">
      <HotkeyLabel code={props.code} variant="badge" />
    </span>
  );
}

export const PosMoreMenu = forwardRef<PosMoreMenuHandle, Props>(function PosMoreMenu(props, ref): JSX.Element {
  const btnRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => btnRef.current?.click(),
  }));

  const isAmber = props.tone === "amber";
  const showHint = props.showHotkeysHint ?? true;

  const label = props.label ?? "Opciones";

  const holdHotkey = props.holdHotkey ?? "F6";
  const noteHotkey = props.noteHotkey ?? "F7";
  const customerHotkey = props.customerHotkey ?? "F8";
  const cancelHotkey = props.cancelHotkey ?? "Delete";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={btnRef}
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-[150px] px-4 rounded-2xl",
            "inline-flex items-center justify-center gap-2 whitespace-nowrap",
            "bg-background/70 border-border/70 hover:bg-background shadow-sm",
            "focus-visible:ring-2",
            isAmber ? "focus-visible:ring-amber-300" : "focus-visible:ring-ring",
            props.className
          )}
          aria-label={label}
        >
          <MoreVertical className="size-4" />
          <span className="text-sm font-medium">{label}</span>

        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="px-2 text-[11px] text-muted-foreground">
          Acciones rápidas
        </DropdownMenuLabel>

        <DropdownMenuItem onClick={props.onHold} className="rounded-xl px-2 py-2">
          <PauseCircle className="mr-2 size-4" />
          Poner en espera
          {showHint ? <KeyHint code={holdHotkey} /> : null}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={props.onNote} className="rounded-xl px-2 py-2">
          <StickyNote className="mr-2 size-4" />
          Nota
          {showHint ? <KeyHint code={noteHotkey} /> : null}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={props.onCustomer} className="rounded-xl px-2 py-2">
          <UserRound className="mr-2 size-4" />
          Cliente
          {showHint ? <KeyHint code={customerHotkey} /> : null}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          onClick={props.onCancel}
          className="rounded-xl px-2 py-2 text-destructive focus:text-destructive"
        >
          <X className="mr-2 size-4" />
          Cancelar venta
          {showHint ? <KeyHint code={cancelHotkey} /> : null}
        </DropdownMenuItem>

        {showHint ? (
          <>
            <DropdownMenuSeparator className="my-2" />
            <div className="px-2 py-1 text-[11px] text-muted-foreground flex items-center gap-2">
              <HotkeyLabel code="Enter" variant="keycap" preferIcon />
              <span>Cobrar</span>
              <span className="opacity-60">·</span>
              <HotkeyLabel code="Escape" variant="keycap" preferIcon />
              <span>Opciones</span>
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});