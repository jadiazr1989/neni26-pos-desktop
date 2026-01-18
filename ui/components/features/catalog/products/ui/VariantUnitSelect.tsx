// src/modules/catalog/products/ui/variants/ui/VariantUnitSelect.tsx
"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { VARIANT_UNITS, type VariantUnit } from "../variants/variant.constants";

export function VariantUnitSelect(props: {
  value: VariantUnit | "";
  onChange: (u: VariantUnit) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label>Unidad (obligatoria)</Label>
      <Select
        value={props.value}
        onValueChange={(v) => props.onChange(v as VariantUnit)}
        disabled={props.disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona unidad..." />
        </SelectTrigger>
        <SelectContent>
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
