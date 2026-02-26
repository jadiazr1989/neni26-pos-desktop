// src/modules/purchases/ui/detail/PurchaseItemDialog.tsx
"use client";

import * as React from "react";
import { AlertTriangle, Barcode, Hash, Package, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// ✅ Tooltip (shadcn)
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { DraftLine } from "../../hooks/purchaseDetail.types";
import type { VariantMeta } from "../../hooks/purchaseItemDialog.types";
import type { VariantPick } from "../../hooks/useMyWarehouseVariantIndex";

import { usePurchaseItemForm } from "../../hooks/usePurchaseItemForm";
import { minorToMoneyString } from "@/lib/money/money";
import { moneyStrToLabelCUP } from "@/lib/money/moneyStr";

import { pickToVariantMeta } from "../../hooks/purchaseVariant.mappers";
import { ThumbImage } from "@/components/shared/ThumbImage";

function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function qtyText(l: DraftLine | null): string {
  if (!l) return "0";
  if (l.qtyDisplay && l.displayUnit) return `${l.qtyDisplay} ${l.displayUnit}`;
  const q = String(l.qtyInput ?? "").trim();
  const unit = String(l.unitInput ?? "UNIT").trim();
  return `${q || "0"} ${unit}`;
}

// -----------------------------
// BigInt-safe local preview total (NO floats)
// totalMinor = round_half_up(unitCostMinor * qtyInput)
// Only valid if unitInput == pricingUnit (no conversion).
// -----------------------------
function toSafeNumber(v: bigint): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function parseDecimalToIntParts(raw: string): { int: bigint; scale: 0 | 2 } {
  const s0 = String(raw ?? "").trim().replace(",", ".");
  if (!s0) return { int: 0n, scale: 0 };

  const neg = s0.startsWith("-");
  const s = neg ? s0.slice(1) : s0;

  const [a, bRaw = ""] = s.split(".");
  const ai = a.replace(/[^\d]/g, "");
  const bi = bRaw.replace(/[^\d]/g, "");

  if (bi.length === 0) {
    const base = BigInt(ai || "0");
    return { int: neg ? -base : base, scale: 0 };
  }

  const frac2 = (bi + "00").slice(0, 2);
  const n = BigInt(ai || "0") * 100n + BigInt(frac2 || "0");
  return { int: neg ? -n : n, scale: 2 };
}

function divRoundHalfUp(x: bigint, d: bigint): bigint {
  if (d === 0n) return 0n;
  return (x + d / 2n) / d;
}

function canPreviewTotal(meta: VariantMeta | null, line: DraftLine | null): boolean {
  if (!meta || !line) return false;
  const pricing = meta.units?.pricingUnit;
  const unitInput = line.unitInput;
  if (!pricing || !unitInput) return false;
  return String(unitInput) === String(pricing);
}

function calcPreviewTotalMinor(args: { qtyInput: string; unitCostMinor: number }): number {
  const unitMinor = BigInt(Number.isFinite(args.unitCostMinor) ? Math.max(0, Math.trunc(args.unitCostMinor)) : 0);
  const qtyStr = String(args.qtyInput ?? "").trim();

  const { int: qtyInt, scale } = parseDecimalToIntParts(qtyStr);
  const q = qtyInt > 0n ? qtyInt : 0n;
  const denom = scale === 0 ? 1n : 100n;

  const numerator = unitMinor * q;
  const totalMinor = divRoundHalfUp(numerator, denom);
  return toSafeNumber(totalMinor);
}

function Card(props: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-background ${props.className ?? ""}`}>
      {props.title ? (
        <div className="px-4 pt-4 pb-2">
          <div className="text-xs font-medium text-muted-foreground">{props.title}</div>
        </div>
      ) : null}
      <div className={`${props.title ? "px-4 pb-4" : "p-4"}`}>{props.children}</div>
    </div>
  );
}

function InlineAlert(props: { id?: string; children: React.ReactNode }) {
  return (
    <div
      id={props.id}
      className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="text-xs leading-5">{props.children}</div>
    </div>
  );
}

function formatAbsLimit(maxAbsQty: unknown): string | null {
  if (maxAbsQty == null) return null;
  const s = String(maxAbsQty).trim();
  if (!s) return null;
  return `0 – ${s}`;
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
  const picked = props.picked ?? null;

  const meta: VariantMeta | null = React.useMemo(() => {
    const a = (props.variant ?? null) as VariantMeta | null;
    if (a?.units?.baseUnit && a?.units?.pricingUnit) return a;

    const b = (l?.variant ?? null) as VariantMeta | null;
    if (b?.units?.baseUnit && b?.units?.pricingUnit) return b;

    if (picked) return pickToVariantMeta(picked);
    return null;
  }, [props.variant, l?.variant, picked]);

  const lineWithMeta: DraftLine | null = React.useMemo(() => {
    if (!l) return null;
    return { ...l, variant: meta ?? l.variant ?? null };
  }, [l, meta]);

  const titleText = meta?.title ?? picked?.label ?? "Variante";
  const skuText = meta?.sku ?? picked?.sku ?? null;
  const barcodeText = meta?.barcode ?? picked?.barcode ?? null;
  const imageUrl = meta?.imageUrl ?? picked?.imageUrl ?? null;
  const productName = meta?.productName ?? picked?.productName ?? null;
  const isActive = meta?.isActive ?? picked?.isActive ?? true;

  // ✅ no dependas de props completo (mejor memoization)
  function close() {
    props.onOpenChange(false);
  }

  const form = usePurchaseItemForm({
    open: props.open,
    busy: props.busy,
    line: lineWithMeta,
    variant: meta,
    picked,
    onSave: props.onSave,
    onClose: close,
  });

  const qtySummary = qtyText(form.previewLine ?? lineWithMeta);

  const showQtyOutOfRange = !form.canSave && form.limitInfo?.maxAbsQty != null;
  const qtyOutOfRangeHint = form.limitInfo?.hint ?? "";
  const absLimitLabel = formatAbsLimit(form.limitInfo?.maxAbsQty);

  const totalLabel = React.useMemo(() => {
    const pl = form.previewLine;
    if (!pl) return "—";

    if (pl.lineTotalBaseMinor != null) {
      return moneyStrToLabelCUP(pl.lineTotalBaseMinor);
    }

    const v = (pl.variant ?? null) as VariantMeta | null;
    if (!canPreviewTotal(v, pl)) return "—";

    const totalMinor = calcPreviewTotalMinor({
      qtyInput: pl.qtyInput ?? "0",
      unitCostMinor: Number(pl.unitCostBaseMinor ?? 0),
    });

    return minorToMoneyString(totalMinor, { scale: 2 });
  }, [form.previewLine]);

  const cannotPreview =
    form.previewLine?.lineTotalBaseMinor == null &&
    !canPreviewTotal((form.previewLine?.variant ?? null) as VariantMeta | null, form.previewLine ?? null);

  // ✅ highlight input Cantidad cuando está fuera de rango
  const qtyInputClass =
    "h-10 " +
    (showQtyOutOfRange
      ? "border-amber-400 ring-2 ring-amber-300 focus-visible:ring-2 focus-visible:ring-amber-300"
      : "");

  // ✅ refs: autofocus + scroll-to-error
  const qtyRef = React.useRef<HTMLInputElement | null>(null);
  const qtyInlineAlertRef = React.useRef<HTMLDivElement | null>(null);

  const qtyAlertId = React.useId();

  // ✅ autofocus al abrir (cantidad)
  React.useEffect(() => {
    if (!props.open) return;
    // pequeño delay para que el Dialog termine de montar
    const t = window.setTimeout(() => qtyRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [props.open]);

  // ✅ si abre y ya viene inválido -> scroll al inline alert y focus
  React.useEffect(() => {
    if (!props.open) return;
    if (!showQtyOutOfRange) return;
    const t = window.setTimeout(() => {
      qtyInlineAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      qtyRef.current?.focus();
    }, 80);
    return () => window.clearTimeout(t);
  }, [props.open, showQtyOutOfRange]);

  // ✅ tooltip para botón Guardar cuando está disabled
  const saveDisabled = props.busy || !form.canSave;
  const saveTooltipText = React.useMemo(() => {
    if (props.busy) return "Procesando…";
    if (showQtyOutOfRange) {
      const range = absLimitLabel ? `Rango permitido: ${absLimitLabel}. ` : "";
      const hint = qtyOutOfRangeHint ? qtyOutOfRangeHint : "Corrige la cantidad para continuar.";
      return `${range}${hint}`;
    }
    if (!form.canSave) return "Completa los campos requeridos para guardar.";
    return "";
  }, [props.busy, showQtyOutOfRange, absLimitLabel, qtyOutOfRangeHint, form.canSave]);

  // ✅ click Guardar: si no puede, scroll y focus + no llamar submit
  const onSaveClick = React.useCallback(() => {
    if (props.busy) return;

    if (!form.canSave) {
      // llevamos al usuario al problema más común (cantidad)
      if (showQtyOutOfRange) {
        qtyInlineAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      qtyRef.current?.focus();
      return;
    }

    form.submit();
  }, [props.busy, form, showQtyOutOfRange]);

  return (
    <TooltipProvider>
      <Dialog open={props.open} onOpenChange={props.onOpenChange}>
        <DialogContent className="sm:max-w-[760px] rounded-2xl p-0 overflow-hidden">
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

            {lineWithMeta ? (
              <div className="mt-3 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                <Hash className="size-4" />
                <span className="font-mono text-foreground">{shortId(lineWithMeta.productVariantId)}</span>

                {isActive === false ? (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-amber-900">
                    <AlertTriangle className="size-3" />
                    Inactiva
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* banner global */}
            {showQtyOutOfRange ? (
              <div className="mt-3">
                <InlineAlert>
                  <span className="font-semibold">Cantidad fuera de rango.</span>{" "}
                  {absLimitLabel ? <span className="opacity-90">Rango: {absLimitLabel}. </span> : null}
                  <span className="text-amber-900/90">{qtyOutOfRangeHint}</span>
                </InlineAlert>
              </div>
            ) : null}
          </div>

          {/* body */}
          <div className="px-6 py-5">
            {lineWithMeta ? (
              <div className="grid grid-cols-12 gap-4">
                {/* left */}
                <div className="col-span-12 md:col-span-5 space-y-3">
                  <Card>
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl border bg-muted flex items-center justify-center">
                        <ThumbImage src={imageUrl} alt={titleText} size={56} />
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
                      Ajusta cantidad. Costo y precio vienen del catálogo (solo lectura).
                    </div>
                  </Card>

                  <Card title="Resumen" className="bg-muted/10">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Cantidad</div>
                        <div className="text-sm font-semibold">{qtySummary}</div>
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
                      <div className="font-semibold">{totalLabel}</div>
                    </div>

                    {cannotPreview ? (
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        * Preview no disponible si la unidad de entrada no coincide con la unidad de precio. Guarda o refresca
                        para ver el total real.
                      </div>
                    ) : null}
                  </Card>
                </div>

                {/* right */}
                <div className="col-span-12 md:col-span-7 space-y-3">
                  <Card title="Editar línea">
                    <div className="grid grid-cols-12 gap-3">
                      {/* Cantidad */}
                      <div className="col-span-12 sm:col-span-4">
                        <div className="text-xs text-muted-foreground mb-1">Cantidad</div>
                        <Input
                          ref={qtyRef}
                          className={qtyInputClass}
                          inputMode="decimal"
                          value={form.state.qtyInput}
                          onChange={(e) => form.patch({ qtyInput: e.target.value })}
                          disabled={props.busy}
                          placeholder="Ej: 1, 0.5, 2.25"
                          aria-invalid={showQtyOutOfRange ? true : undefined}
                          aria-describedby={showQtyOutOfRange ? qtyAlertId : undefined}
                        />

                        <div className="mt-1 text-[11px] text-muted-foreground">
                          Unidad: {form.previewLine?.unitInput ?? lineWithMeta.unitInput}
                        </div>
                      </div>

                      {/* Costo (✅ congelado) */}
                      <div className="col-span-12 sm:col-span-4">
                        <div className="text-xs text-muted-foreground mb-1">Costo</div>
                        <Input
                          className="h-10"
                          inputMode="decimal"
                          value={form.state.cost}
                          placeholder="Ej: 12.34"
                          disabled
                          readOnly
                        />
                        <div className="mt-1 text-[11px] text-muted-foreground">Solo lectura</div>
                      </div>

                      {/* Precio (solo lectura) */}
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
                        <span className="font-semibold text-amber-900">{totalLabel}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-muted-foreground">
                      * “minor” = centavos. Capturamos costo/price del catálogo; aquí solo editas cantidad.
                    </div>
                  </Card>
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

              {/* ✅ Tooltip incluso con botón disabled (wrap en span) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      onClick={onSaveClick}
                      disabled={saveDisabled}
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      Guardar
                    </Button>
                  </span>
                </TooltipTrigger>

                {saveDisabled && saveTooltipText ? (
                  <TooltipContent side="top" align="end" className="max-w-[320px]">
                    <p className="text-xs">{saveTooltipText}</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}