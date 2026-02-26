"use client";

import type { JSX } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import { HOTKEY_GLYPH, HOTKEY_TEXT, type HotkeyCode } from "@/lib/hotkeys";
import { CornerDownLeft } from "lucide-react";

function KeyCap(props: { children: React.ReactNode; className?: string }): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "h-[20px] min-w-[24px] px-2",
        "rounded-md border",
        "text-[12px] font-mono leading-none",
        "bg-muted/70 text-muted-foreground",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

/** ✅ Enterprise rule: Escape MUST be "Esc", Delete MUST be "Del" (no glyph) */
function systemLabel(code: HotkeyCode): string | null {
  if (code === "Escape") return "Esc";
  if (code === "Delete") return "Del";
  return null;
}

function resolveLabel(code: HotkeyCode, mode: "auto" | "glyph" | "text"): string {
  const sys = systemLabel(code);
  if (sys) return sys; // ✅ overrides EVERYTHING (including HOTKEY_GLYPH)

  if (mode === "glyph") return HOTKEY_GLYPH[code] ?? HOTKEY_TEXT[code] ?? String(code);
  if (mode === "text") return HOTKEY_TEXT[code] ?? String(code);

  // auto
  return HOTKEY_GLYPH[code] ?? HOTKEY_TEXT[code] ?? String(code);
}

function HotkeyIcon(props: { code: HotkeyCode; className?: string }): JSX.Element | null {
  // ✅ Only Enter uses icon
  if (props.code === "Enter") return <CornerDownLeft className={cn("size-4", props.className)} />;
  return null;
}

export function HotkeyLabel(props: {
  code: HotkeyCode;
  variant?: "subtle" | "badge" | "keycap";
  className?: string;
  mode?: "auto" | "glyph" | "text";
  preferIcon?: boolean;
}): JSX.Element {
  const variant = props.variant ?? "subtle";
  const mode = props.mode ?? "auto";
  const preferIcon = props.preferIcon ?? true;

  const label = resolveLabel(props.code, mode);

  if (variant === "badge") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center",
          "px-2 py-0.5 rounded-md border",
          "text-[11px] font-mono leading-none",
          "bg-muted text-muted-foreground",
          props.className
        )}
      >
        {label}
      </span>
    );
  }

  if (variant === "keycap") {
    const icon = preferIcon && props.code === "Enter" ? <HotkeyIcon code={props.code} /> : null;
    return <KeyCap className={props.className}>{icon ?? label}</KeyCap>;
  }

  return (
    <span className={cn("text-xs font-mono leading-none text-muted-foreground", props.className)}>
      ({label})
    </span>
  );
}