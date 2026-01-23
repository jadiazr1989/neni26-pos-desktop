// src/modules/catalog/products/ui/variants/ui/VariantUnitSelect.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { VARIANT_UNITS, type VariantUnit } from "../variants/variant.constants";

export function VariantUnitSelect(props: {
  value: VariantUnit | "";
  onChange: (u: VariantUnit) => void;
  disabled?: boolean;

  // ✅ UI controls
  align?: "left" | "right";
  widthClassName?: string;        // ej: "w-[140px]" | "w-full"
  triggerClassName?: string;      // classes extra al trigger
  contentClassName?: string;      // classes extra al dropdown
  placeholder?: string;
}) {
  const align = props.align ?? "left";
  const width = props.widthClassName ?? "w-full";

  return (
    <div className={cn("flex", align === "right" ? "justify-end" : "justify-start")}>
      <Select
        value={props.value}
        onValueChange={(v) => props.onChange(v as VariantUnit)}
        disabled={props.disabled}
      >
        <SelectTrigger
          className={cn(
            width,
            "h-10 rounded-md bg-background",
            "justify-between", // asegura el chevron al final
            props.triggerClassName
          )}
        >
          <SelectValue placeholder={props.placeholder ?? "Unidad…"} />
        </SelectTrigger>

        <SelectContent className={props.contentClassName}>
          {VARIANT_UNITS.map((u) => (
            <SelectItem key={u} value={u}>
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
