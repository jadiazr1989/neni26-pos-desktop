"use client";

import type { JSX } from "react";
import { CreditCard } from "lucide-react";

import { ButtonSpinner } from "@/components/ui/button-spinner";
import { cn } from "@/lib/utils";
import type { HotkeyCode } from "@/lib/hotkeys";
import { HotkeyLabel } from "@/components/shared/HotkeyLabel";

export function PayButton(props: {
  className?: string;
  paying: boolean;
  disabled?: boolean;
  onPay: () => void;

  label?: string;
  hotkey?: HotkeyCode; // default Enter
  showHotkey?: boolean;
}): JSX.Element {
  const label = props.label ?? "Chequear";
  const hotkey = props.hotkey ?? "Enter";
  const showHotkey = props.showHotkey ?? true;

  return (
    <ButtonSpinner
      type="button"
      onClick={props.onPay}
      busy={props.paying}
      disabled={props.disabled}
      icon={<CreditCard className="size-5" />}
      className={cn(
        "h-12 w-[190px] px-5 rounded-2xl",
        "inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "bg-emerald-600 text-white hover:bg-emerald-600/90 shadow-sm",
        "disabled:opacity-60",
        "focus-visible:ring-2 focus-visible:ring-emerald-300",
        props.className
      )}
    >
      <span className="text-sm font-semibold leading-none">{label}</span>

      {showHotkey ? (
        <HotkeyLabel
          code={hotkey}
          variant="keycap"
          preferIcon
          className="border-white/25 bg-white/10 text-white/90"
        />
      ) : null}
    </ButtonSpinner>
  );
}