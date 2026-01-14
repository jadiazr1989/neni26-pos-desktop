"use client";

import type { JSX } from "react";
import { CreditCard } from "lucide-react";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { cn } from "@/lib/utils";

export function PayButton(props: {
  className?: string;
  paying: boolean;
  disabled?: boolean;
  onPay: () => void;
}): JSX.Element {
  return (
    <ButtonSpinner
      type="button"
      onClick={props.onPay}
      busy={props.paying}
      disabled={props.disabled}
      icon={<CreditCard className="size-5" />}
      className={cn(
        "h-12 w-32 rounded-xl text-base font-semibold",
        "bg-emerald-600 text-white hover:bg-emerald-600/90",
        "disabled:opacity-60",
        "focus-visible:ring-2 focus-visible:ring-emerald-300",
        props.className
      )}
    >
      Cobrar
    </ButtonSpinner>
  );
}
