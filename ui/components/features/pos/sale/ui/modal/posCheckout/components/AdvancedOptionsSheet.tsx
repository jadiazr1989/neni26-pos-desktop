"use client";

import * as React from "react";
import type { JSX } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import type { Currency, PaymentMethod } from "@/lib/modules/sales/sale.dto";
import { formatMoney, parseMoneyToMinor } from "@/lib/money/money";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { minorToMajor, majorToMinor } from "@/lib/money/money";
import { type PayLineDraft } from "../domain/checkoutViewModel";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  OTHER: "Otro",
};

export function AdvancedOptionsSheet(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  busy: boolean;
  lines: PayLineDraft[];

  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Omit<PayLineDraft, "id">>) => void;
}): JSX.Element {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Opciones</SheetTitle>
          <SheetDescription>Usa esto solo cuando no sea efectivo normal.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Pagos: {props.lines.length}</div>
          <Button type="button" variant="outline" onClick={props.onAdd} disabled={props.busy} className="rounded-2xl">
            + Agregar pago
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {props.lines.map((line, idx) => (
            <PaymentCard
              key={line.id}
              index={idx}
              line={line}
              busy={props.busy}
              canRemove={props.lines.length > 1}
              onRemove={() => props.onRemove(line.id)}
              onChange={(patch) => props.onChange(line.id, patch)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PaymentCard(props: {
  index: number;
  line: PayLineDraft;
  busy: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<Omit<PayLineDraft, "id">>) => void;
}): JSX.Element {
  const p = props.line;

  const [amountDraft, setAmountDraft] = React.useState(() => minorToMajor(p.tenderMinor));
  React.useEffect(() => setAmountDraft(minorToMajor(p.tenderMinor)), [p.tenderMinor]);

  const needsFx = p.currency !== "CUP";

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Pago #{props.index + 1}</div>
        {props.canRemove ? (
          <Button type="button" variant="ghost" onClick={props.onRemove} disabled={props.busy} className="text-red-600 rounded-2xl">
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Método</Label>
            <Select
              value={p.method}
              onValueChange={(v) => props.onChange({ method: v as PaymentMethod })}
              disabled={props.busy}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Efectivo</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Moneda</Label>
            <Select
              value={p.currency}
              onValueChange={(v) => {
                const currency = v as Currency;
                props.onChange({ currency, fxRate: currency === "CUP" ? null : p.fxRate });
              }}
              disabled={props.busy}
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUP">CUP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Monto ({p.currency})</Label>
          <Input
            className="rounded-2xl"
            inputMode="decimal"
            value={amountDraft}
            onChange={(e) => setAmountDraft(e.target.value)}
            onBlur={() => {
              const res = parseMoneyToMinor(amountDraft);
              props.onChange({ tenderMinor: res.ok ? res.minor : 0 });
              // opcional: normaliza el draft al formato 2 decimales
              setAmountDraft(minorToMajor(res.ok ? res.minor : 0));
            }}
            disabled={props.busy}
            placeholder="Ej: 230.00"
          />
        </div>

        {needsFx ? (
          <div className="grid gap-2">
            <Label>Tasa (fxRate)</Label>
            <Input
              className="rounded-2xl"
              value={p.fxRate ?? ""}
              onChange={(e) => props.onChange({ fxRate: e.target.value || null })}
              disabled={props.busy}
              placeholder="Ej: 360"
            />
            <div className="text-xs text-muted-foreground">Requerido para USD/EUR.</div>
          </div>
        ) : null}

        {p.method !== "CASH" ? (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Proveedor</Label>
              <Input
                className="rounded-2xl"
                value={p.provider ?? ""}
                onChange={(e) => props.onChange({ provider: e.target.value || null })}
                disabled={props.busy}
                placeholder="Ej: EnZona / Transfermóvil / POS"
              />
            </div>
            <div className="grid gap-2">
              <Label>Referencia</Label>
              <Input
                className="rounded-2xl"
                value={p.reference ?? ""}
                onChange={(e) => props.onChange({ reference: e.target.value || null })}
                disabled={props.busy}
                placeholder="Opcional"
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {METHOD_LABEL[p.method]} {p.currency} normalmente no requiere proveedor/referencia.
          </div>
        )}
      </div>
    </div>
  );
}
