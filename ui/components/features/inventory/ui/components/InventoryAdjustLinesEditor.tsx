"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntityAvatar } from "@/components/shared/EntityAvatar";
import { productService } from "@/lib/modules/catalog/products/product.service";
import type { InventoryAdjustLineUI, ResolvedVariantUI } from "@/lib/modules/inventory/inventory.dto";

function normalizeErr(e: unknown): string {
  if (e instanceof Error && e.message.trim()) return e.message;
  return "No se pudo resolver el código.";
}

function emptyLine(): InventoryAdjustLineUI {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variantId: "",
    code: "",
    qtyDelta: "",
    notes: "",
    variant: null,
    error: null,
  };
}

export function InventoryAdjustLinesEditor(props: {
  value: InventoryAdjustLineUI[];
  disabled?: boolean;
  onChange: (rows: InventoryAdjustLineUI[]) => void;
}) {
  const rows = props.value;

  function patch(lineId: string, p: Partial<InventoryAdjustLineUI>) {
    props.onChange(rows.map((r) => (r.id === lineId ? { ...r, ...p } : r)));
  }

  function add() {
    props.onChange([...rows, emptyLine()]);
  }

  function remove(lineId: string) {
    const next = rows.filter((r) => r.id !== lineId);
    props.onChange(next.length ? next : [emptyLine()]);
  }

  function setResolved(lineId: string, v: ResolvedVariantUI) {
    patch(lineId, {
      variantId: v.id,
      variant: v,
      error: null,
    });
  }

  async function resolveLine(lineId: string) {
    const row = rows.find((x) => x.id === lineId);
    const code = row?.code.trim() ?? "";

    if (!code) {
      patch(lineId, { error: "Escribe o escanea SKU/Barcode.", variantId: "", variant: null });
      return;
    }

    patch(lineId, { error: null });

    try {
      const v = await productService.resolve(code); // debe devolver ProductVariantDTO o compatible
      setResolved(lineId, {
        id: v.id,
        sku: v.sku,
        barcode: v.barcode ?? null,
        title: v.title ?? null,
        imageUrl: v.imageUrl,
      });
    } catch (e: unknown) {
      patch(lineId, { error: normalizeErr(e), variantId: "", variant: null });
    }
  }

  function clearVariant(lineId: string) {
    patch(lineId, { variantId: "", variant: null, error: null });
  }

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">Líneas</div>

      <div className="grid gap-2">
        {rows.map((r, idx) => (
          <div key={r.id} className="rounded-xl border border-border p-3 grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Línea {idx + 1}</div>
              <Button
                type="button"
                variant="secondary"
                disabled={props.disabled || rows.length === 1}
                onClick={() => remove(r.id)}
              >
                Quitar
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-12 md:col-span-6 grid gap-1">
                <div className="text-xs text-muted-foreground">SKU / Barcode</div>
                <div className="flex gap-2">
                  <Input
                    value={r.code}
                    disabled={props.disabled}
                    onChange={(e) => patch(r.id, { code: e.target.value })}
                    placeholder="Escanea o escribe código"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void resolveLine(r.id);
                      }
                    }}
                  />
                  <Button type="button" disabled={props.disabled} onClick={() => void resolveLine(r.id)}>
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="col-span-6 md:col-span-3 grid gap-1">
                <div className="text-xs text-muted-foreground">Delta</div>
                <Input
                  inputMode="numeric"
                  value={r.qtyDelta}
                  disabled={props.disabled}
                  onChange={(e) => patch(r.id, { qtyDelta: e.target.value })}
                  placeholder="+10 / -2"
                />
              </div>

              <div className="col-span-6 md:col-span-3 grid gap-1">
                <div className="text-xs text-muted-foreground">Notas</div>
                <Input
                  value={r.notes}
                  disabled={props.disabled}
                  onChange={(e) => patch(r.id, { notes: e.target.value })}
                  placeholder="shrink / recount"
                />
              </div>
            </div>

            {r.variant ? (
              <div className="rounded-lg border border-border p-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <EntityAvatar src={r.variant.imageUrl} alt={r.variant.title ?? r.variant.sku} size={36} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.variant.title ?? r.variant.sku}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      SKU: {r.variant.sku} · Barcode: {r.variant.barcode ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">VariantId: {r.variant.id}</div>
                  </div>
                </div>

                <Button type="button" variant="secondary" disabled={props.disabled} onClick={() => clearVariant(r.id)}>
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {r.variantId ? `VariantId: ${r.variantId}` : "No hay variante seleccionada aún."}
              </div>
            )}

            {r.error ? <div className="text-xs text-destructive">{r.error}</div> : null}
          </div>
        ))}
      </div>

      <div>
        <Button type="button" variant="secondary" disabled={props.disabled} onClick={add}>
          + Agregar línea
        </Button>
      </div>
    </div>
  );
}
