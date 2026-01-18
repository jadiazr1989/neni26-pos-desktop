// src/modules/catalog/brands/ui/BrandDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";

type Mode = "create" | "edit";

export function BrandDialog(props: {
  open: boolean;
  mode: Mode;
  initial: BrandDTO | null;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: { name: string; slug: string }) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const disabled = Boolean(props.loading) || submitting;

  React.useEffect(() => {
    if (!props.open) return;
    setName(props.initial?.name ?? "");
    setSlug(props.initial?.slug ?? "");
  }, [props.open, props.initial]);

  async function submit() {
    setSubmitting(true);
    try {
      await props.onSubmit({ name: name.trim(), slug: slug.trim() });
      props.onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Nueva marca" : "Editar marca"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Coca-Cola" />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Slug</div>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ej: coca-cola" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
              Cancelar
            </Button>
            <Button onClick={() => void submit()} disabled={disabled || !name.trim() || !slug.trim()}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
