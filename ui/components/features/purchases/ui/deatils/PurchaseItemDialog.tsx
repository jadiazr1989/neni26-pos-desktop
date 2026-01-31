// src/modules/purchases/ui/detail/PurchaseItemDialog.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { AlertTriangle, Barcode, Hash, ImageIcon, Package, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { lineTotalMinor, money } from "../../hooks/purchaseDetail.helpers";
import type { DraftLine } from "../../hooks/purchaseDetail.types";
import type { VariantMeta } from "../../hooks/purchaseItemDialog.types";
import type { VariantPick } from "../../hooks/useMyWarehouseVariantIndex";
import { usePurchaseItemForm } from "../../hooks/usePurchaseItemForm";
import { minorToMoneyString } from "@/lib/money/money";

function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export function PurchaseItemDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  busy: boolean;

  title: string;
  line: DraftLine | null;

  picked: VariantPick | null;
  variant?: VariantMeta | null;

  onSave: (patch: Partial<DraftLine>) => void;
}) {
  const l = props.line;

  const v = props.variant ?? null;
  const picked = props.picked ?? null;

  const titleText = v?.title ?? picked?.label ?? "Variante";

  const skuText =
    v?.sku ??
    (picked && "sku" in picked ? (picked as unknown as { sku?: string | null }).sku ?? null : null) ??
    null;

  const barcodeText =
    v?.barcode ??
    (picked && "barcode" in picked ? (picked as unknown as { barcode?: string | null }).barcode ?? null : null) ??
    null;

  const imageUrl =
    v?.imageUrl ??
    (picked && "imageUrl" in picked ? (picked as unknown as { imageUrl?: string | null }).imageUrl ?? null : null) ??
    null;

  const productName =
    v?.productName ??
    (picked && "productName" in picked
      ? (picked as unknown as { productName?: string | null }).productName ?? null
      : null) ??
    null;

  const isActive =
    v?.isActive ??
    (picked && "isActive" in picked ? (picked as unknown as { isActive?: boolean | null }).isActive ?? true : true);

  const close = React.useCallback(() => props.onOpenChange(false), [props]);

  const form = usePurchaseItemForm({
    open: props.open,
    busy: props.busy,
    line: l,
    variant: v,
    picked,
    onSave: props.onSave,
    onClose: close,
  });

  const total = form.previewLine ? lineTotalMinor(form.previewLine) : 0;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[720px] rounded-2xl p-0 overflow-hidden">
        {/* header */}
        <div className="px-6 pt-6 pb-4 border-b bg-amber-50/60">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200/70 text-amber-900">
                <Package className="size-4" />
              </span>
              {props.title}
            </DialogTitle>
          </DialogHeader>

          {l ? (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <Hash className="size-4" />
              <span className="font-mono text-foreground">{shortId(l.productVariantId)}</span>

              {isActive === false ? (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-900">
                  <AlertTriangle className="size-3" />
                  Inactiva
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* body */}
        <div className="px-6 py-5">
          {l ? (
            <div className="grid grid-cols-12 gap-4">
              {/* left */}
              <div className="col-span-12 md:col-span-5 space-y-3">
                <div className="rounded-2xl border p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-muted flex items-center justify-center">
                      {imageUrl ? (
                        <Image src={imageUrl} alt={titleText} fill className="object-cover" sizes="56px" />
                      ) : (
                        <ImageIcon className="size-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold truncate">{titleText}</div>
                      <div className="text-xs text-muted-foreground truncate">{productName ?? "—"}</div>

                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-mono">{skuText ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Barcode className="size-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Barcode:</span>
                          <span className="font-mono">{barcodeText ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-muted-foreground">
                    Ajusta cantidad y costo. El precio viene del catálogo (solo lectura).
                  </div>
                </div>

                {/* summary */}
                <div className="rounded-2xl border p-4 bg-muted/20">
                  <div className="text-xs text-muted-foreground">Resumen</div>

                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Cantidad</div>
                      <div className="text-sm font-semibold">{form.previewLine?.quantity ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Costo</div>
                      <div className="text-sm font-semibold">
                        {minorToMoneyString(form.previewLine?.unitCostBaseMinor ?? 0, { scale: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground">Precio</div>
                      <div className="text-sm font-semibold">
                        {form.priceMinor == null ? "—" : minorToMoneyString(form.priceMinor, { scale: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-background px-3 py-2 border">
                    <div className="text-xs text-muted-foreground">Importe total</div>
                    <div className="font-semibold">{minorToMoneyString(total, { scale: 2 })}</div>
                  </div>
                </div>
              </div>

              {/* right */}
              <div className="col-span-12 md:col-span-7 space-y-3">
                <div className="rounded-2xl border p-4">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-xs text-muted-foreground mb-1">Cantidad</div>
                      <Input
                        className="h-10"
                        type="number"
                        min={1}
                        value={form.state.qty}
                        onChange={(e) => form.patch({ qty: e.target.value })}
                        disabled={props.busy}
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-xs text-muted-foreground mb-1">Costo</div>
                      <Input
                        className="h-10"
                        inputMode="decimal"
                        value={form.state.cost}
                        onChange={(e) => form.patch({ cost: e.target.value })}
                        placeholder="12.34"
                        disabled={props.busy}
                      />
                      <div className="mt-1 text-[11px] text-muted-foreground">Acepta “.” y “,”</div>
                    </div>

                    <div className="col-span-12 sm:col-span-4">
                      <div className="text-xs text-muted-foreground mb-1">Precio</div>
                      <Input
                        className="h-10"
                        type="text"
                        value={form.priceMinor == null ? "" : minorToMoneyString(form.priceMinor, { scale: 2 })}
                        disabled
                        readOnly
                      />
                      <div className="mt-1 text-[11px] text-muted-foreground">Solo lectura</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border bg-amber-50/60 px-3 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Importe total</span>
                      <span className="font-semibold text-amber-900">{minorToMoneyString(total, { scale: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  * “minor” = centavos. Aquí capturamos costo en formato humano y lo convertimos a minor.
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t bg-background">
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={close} disabled={props.busy}>
              Cancelar
            </Button>

            <Button
              onClick={form.submit}
              disabled={!form.canSave}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Guardar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
