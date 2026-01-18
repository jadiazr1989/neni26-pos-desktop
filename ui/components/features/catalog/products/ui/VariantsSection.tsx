// src/modules/catalog/products/ui/variants/VariantsSection.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import type { ProductDTO, ProductVariantDTO } from "@/lib/modules/catalog/products/product.dto";
import { VariantDialog } from "./VariantDialog";
import { VariantsTable } from "./VariantsTable";

export function VariantsSection(props: {
  product: ProductDTO;
  onReload: () => Promise<void> | void;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [editing, setEditing] = React.useState<ProductVariantDTO | null>(null);

  function openCreate() {
    setMode("create");
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(v: ProductVariantDTO) {
    setMode("edit");
    setEditing(v);
    setDialogOpen(true);
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Variantes</div>
        <Button onClick={openCreate}>Nueva variante</Button>
      </div>

      <VariantsTable rows={props.product.variants} onEdit={openEdit} onChanged={props.onReload} />

      <VariantDialog
        open={dialogOpen}
        mode={mode}
        productId={props.product.id}
        initial={editing}
        onOpenChange={setDialogOpen}
        onSaved={props.onReload}
      />
    </div>
  );
}
