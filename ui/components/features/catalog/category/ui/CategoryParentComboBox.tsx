// src/modules/catalog/categories/ui/CategoryParentComboBox.tsx
"use client";

import * as React from "react";
import type { ComboItem } from "@/components/shared/EntityComboBox";
import { EntityComboBox } from "@/components/shared/EntityComboBox";
import { useCategoryParentOptions } from "../hooks/useCategoryParentOptions";

export function CategoryParentComboBox(props: {
  value: string | null;
  onChange: (v: string | null) => void;
  excludeId?: string;
  disabled?: boolean;
}) {
  const parents = useCategoryParentOptions({ excludeId: props.excludeId, take: 50 });

  const items = React.useMemo<ComboItem[]>(
    () =>
      parents.items.map((c) => ({
        value: c.id,
        label: c.name,
        hint: c.slugPath ?? c.slug,
      })),
    [parents.items]
  );

  return (
    <EntityComboBox
      label="Padre (opcional)"
      placeholder="Buscar y seleccionar…"
      value={props.value}
      onChange={props.onChange}
      items={items}
      loadState={parents.loadState}
      loadError={parents.loadError}
      onOpenLoad={parents.onOpenLoad}   // ✅
      search={parents.search}
      onSearchChange={parents.setSearch}
      disabled={props.disabled}
      allowClear
      allowNoneOption
    />
  );
}
