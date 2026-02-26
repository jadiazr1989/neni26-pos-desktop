"use client";

import type { JSX } from "react";
import { cn } from "@/lib/utils";

type MoneySize = "auto" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
type MoneyVariant = "hero" | "card";
type SizeKey = Exclude<MoneySize, "auto">;

const SIZE_ORDER: SizeKey[] = ["xl", "2xl", "3xl", "4xl", "5xl"];

function clampSize(size: SizeKey, min?: SizeKey, max?: SizeKey): SizeKey {
  const idx = (s: SizeKey) => SIZE_ORDER.indexOf(s);
  let i = idx(size);
  if (min) i = Math.max(i, idx(min));
  if (max) i = Math.min(i, idx(max));
  return SIZE_ORDER[i] ?? size;
}

function partsFromMinor(minor: number) {
  const v = Number(minor ?? 0);
  const safe = Number.isFinite(v) ? v : 0;

  const sign = safe < 0 ? "-" : "";
  const absMinor = Math.abs(Math.trunc(safe));

  const major = Math.floor(absMinor / 100);
  const cents = String(absMinor % 100).padStart(2, "0");

  const majorStrRaw = String(major); // Cuba: no thousands separators
  return { majorStr: `${sign}${majorStrRaw}`, cents, digits: majorStrRaw.length };
}

function sizeClass(size: SizeKey) {
  switch (size) {
    case "xl":
      return "text-xl";
    case "2xl":
      return "text-2xl";
    case "3xl":
      return "text-3xl";
    case "4xl":
      return "text-4xl";
    case "5xl":
      return "text-5xl";
  }
}

function autoSizeKey(digits: number, variant: MoneyVariant): SizeKey {
  // support big numbers without breaking cards
  if (variant === "card") {
    if (digits <= 2) return "4xl";
    if (digits <= 4) return "3xl";
    if (digits <= 7) return "2xl";
    if (digits <= 9) return "xl";
    return "xl";
  }

  // hero
  if (digits <= 4) return "5xl";
  if (digits <= 6) return "4xl";
  if (digits <= 8) return "3xl";
  return "2xl";
}

function centsSizeForMain(main: SizeKey) {
  if (main === "5xl") return "text-lg";
  if (main === "4xl") return "text-base";
  if (main === "3xl") return "text-sm";
  return "text-xs";
}

export function MoneyDisplay(props: {
  minor: number;
  currencySymbol?: string;
  variant?: MoneyVariant;
  align?: "left" | "right";
  className?: string;

  // sizing
  size?: MoneySize;           // default "auto"
  minSize?: SizeKey;          // optional
  maxSize?: SizeKey;          // optional

  // cents
  showCents?: boolean;
  hideZeroCents?: boolean;
  centsClassName?: string;
}): JSX.Element {
  const { majorStr, cents, digits } = partsFromMinor(props.minor);

  const variant = props.variant ?? "hero";
  const align = props.align ?? "left";
  const size = props.size ?? "auto";

  const autoKey = autoSizeKey(digits, variant);
  const chosenKey: SizeKey =
    size === "auto"
      ? clampSize(autoKey, props.minSize, props.maxSize)
      : clampSize(size as SizeKey, props.minSize, props.maxSize);

  const mainSizeClass = sizeClass(chosenKey);

  const showCents = props.showCents ?? true;
  const hideZero = props.hideZeroCents ?? false;
  const renderCents = showCents && !(hideZero && cents === "00");
  const compactTracking =
  digits >= 10 ? "tracking-[-0.04em]"
  : digits >= 8 ? "tracking-[-0.02em]"
  : "tracking-tight";

  return (
    <div className={cn("min-w-0 max-w-full", align === "right" && "text-right", props.className)}>
      <div className={cn("inline-flex items-start leading-none tabular-nums whitespace-nowrap", align === "right" && "justify-end")}>
        <span className={cn("font-extrabold", compactTracking, mainSizeClass)}>
          {props.currencySymbol ?? "$"}
          {majorStr}
        </span>

        {renderCents ? (
          <span
            className={cn(
              "ml-1 font-bold",
              centsSizeForMain(chosenKey),
              variant === "card" ? "relative -top-1" : "relative -top-2",
              props.centsClassName
            )}
          >
            {cents}
          </span>
        ) : null}
      </div>
    </div>
  );
}