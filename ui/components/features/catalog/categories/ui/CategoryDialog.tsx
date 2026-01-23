// src/modules/catalog/categories/ui/CategoryDialog.tsx
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CategoryDTO } from "@/lib/modules/catalog/categories";
import { CategoryImagePicker } from "./CategoryImagePicker";
import { CategoryParentComboBox } from "./CategoryParentComboBox";
import { slugify } from "@/lib/slugify";
import { ButtonSpinner } from "@/components/ui/button-spinner";

type Mode = "create" | "edit";

type SubmitPayload = {
  name: string;
  slug: string;
  parentId: string | null;
  imageFile: File | null;
};

export function CategoryDialog(props: {
  open: boolean;
  mode: Mode;
  initial: CategoryDTO | null;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: SubmitPayload) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [parentId, setParentId] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const disabled = Boolean(props.loading) || submitting;

  React.useEffect(() => {
    if (!props.open) return;

    setName(props.initial?.name ?? "");
    setSlug(props.initial?.slug ?? "");
    setParentId(props.initial?.parentId ?? null);
    setImageFile(null);
    setSubmitting(false);
    slugTouchedRef.current = false;
  }, [props.open, props.initial]);

  // ✅ guard anti doble submit (por click/enter)
  const submitLock = React.useRef(false);

  async function submit() {
    if (disabled) return;
    if (submitLock.current) return;

    const finalName = name.trim();
    const finalSlug = slug.trim();

    if (!finalName || !finalSlug) return;

    submitLock.current = true;
    setSubmitting(true);
    try {
      await props.onSubmit({
        name: finalName,
        slug: finalSlug,
        parentId,
        imageFile,
      });
    } finally {
      setSubmitting(false);
      submitLock.current = false;
    }
  }

  const slugTouchedRef = React.useRef(false);

  function onSlugChange(v: string) {
    slugTouchedRef.current = true;
    setSlug(v);
  }

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouchedRef.current) setSlug(slugify(v));
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Nueva categoría" : "Editar categoría"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej: Bebidas"
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Slug</div>
            <Input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="ej: bebidas"
              disabled={disabled}
            />
          </div>

          <CategoryParentComboBox
            value={parentId}
            onChange={setParentId}
            excludeId={props.initial?.id}
            disabled={disabled}
          />

          <CategoryImagePicker value={imageFile} onChange={setImageFile} />

          <div className="flex justify-end gap-2 pt-2">
            <ButtonSpinner
              type="button"
              variant="secondary"
              onClick={() => props.onOpenChange(false)}
              busy={false}
              disabled={disabled}
            >
              Cancelar
            </ButtonSpinner>

            <ButtonSpinner
              type="button"
              onClick={() => void submit()}
              busy={submitting}
              disabled={disabled || !name.trim() || !slug.trim()}
            >
              {submitting ? "Guardando..." : "Guardar"}
            </ButtonSpinner>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
