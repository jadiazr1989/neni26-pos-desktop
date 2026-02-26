"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BrandDTO } from "@/lib/modules/catalog/brands/brand.dto";
import { Button } from "@/components/ui/button";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { notify } from "@/lib/notify/notify";
import { slugify } from "@/lib/slugify";

type Mode = "create" | "edit";
type SubmitPayload = { name: string; slug: string };

export function BrandDialog(props: {
  open: boolean;
  mode: Mode;
  initial: BrandDTO | null;
  loading?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (p: SubmitPayload) => Promise<void>;

  // ✅ nuevo: pedir delete (lo confirma el Screen)
  onRequestDelete?: (b: BrandDTO) => void;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const disabled = Boolean(props.loading) || submitting;
  const canDelete = props.mode === "edit" && !!props.initial && !disabled;

  const slugTouchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!props.open) return;

    const b = props.initial;
    setName(b?.name ?? "");
    setSlug(b?.slug ?? "");

    slugTouchedRef.current = props.mode === "edit";
    if (props.mode === "create") slugTouchedRef.current = false;
    if (props.mode === "edit" && !(b?.slug ?? "").trim()) slugTouchedRef.current = false;
  }, [props.open, props.initial, props.mode]);

  function onSlugChange(v: string) {
    slugTouchedRef.current = true;
    setSlug(v);
  }

  function onNameChange(v: string) {
    setName(v);
    if (!slugTouchedRef.current) setSlug(slugify(v));
  }

  function validate(): { ok: true; value: SubmitPayload } | { ok: false; error: string } {
    const nameNorm = name.trim();
    if (!nameNorm) return { ok: false, error: "Nombre requerido." };

    const slugNorm = slug.trim();
    if (!slugNorm) return { ok: false, error: "Slug requerido." };

    return { ok: true, value: { name: nameNorm, slug: slugNorm } };
  }

  async function submit() {
    const v = validate();
    if (!v.ok) {
      notify.warning({ title: "Revisa el formulario", description: v.error });
      return;
    }

    setSubmitting(true);
    try {
      await props.onSubmit(v.value);
      props.onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete() {
    const b = props.initial;
    if (!b) return;
    props.onRequestDelete?.(b);
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg">{props.mode === "create" ? "Nueva marca" : "Editar marca"}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {props.mode === "create" ? "Crea una marca para organizar productos." : "Actualiza nombre y slug de la marca."}
          </div>
        </DialogHeader>

        <div className="px-6 py-6 space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Nombre</div>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej: Coca-Cola"
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Slug</div>
            <Input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="ej: coca-cola"
              disabled={disabled}
            />
          </div>

          {props.mode === "edit" ? (
            <div className="pt-2">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="text-sm font-medium text-rose-900">Zona peligrosa</div>
                <div className="mt-1 text-xs text-rose-900/80">
                  Eliminar una marca es permanente. Si tiene productos asociados, la operación será rechazada.
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="destructive" onClick={requestDelete} disabled={!canDelete}>
                    Eliminar…
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-border bg-background flex justify-end gap-2">
          <Button variant="secondary" onClick={() => props.onOpenChange(false)} disabled={disabled}>
            Cancelar
          </Button>

          <ButtonSpinner
            type="button"
            onClick={() => void submit()}
            busy={submitting}
            disabled={disabled || !name.trim() || !slug.trim()}
          >
            {submitting ? "Guardando..." : "Guardar"}
          </ButtonSpinner>
        </div>
      </DialogContent>
    </Dialog>
  );
}