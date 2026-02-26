"use client";

import * as React from "react";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { Currency, PaymentMethod } from "@/lib/modules/sales/sale.dto";
import { majorToMinor, minorToMajor } from "@/lib/money/money";

import { isCashCup, type PayLineDraft } from "../domain/checkoutViewModel";

function MethodAndCurrencySelect(props: {
  method: PaymentMethod;
  currency: Currency;
  disabled?: boolean;
  onChange: (next: { method: PaymentMethod; currency: Currency }) => void;
}): JSX.Element {
  const value = `${props.method}::${props.currency}`;
  return (
    <Select
      value={value}
      disabled={props.disabled}
      onValueChange={(v) => {
        const [method, currency] = v.split("::");
        props.onChange({ method: method as PaymentMethod, currency: currency as Currency });
      }}
    >
      <SelectTrigger className={cn("h-11 rounded-2xl", "bg-muted/30 border-border/70")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="CASH::CUP">Efectivo (CUP)</SelectItem>
        <SelectItem value="TRANSFER::CUP">Transferencia (CUP)</SelectItem>
        <SelectItem value="CARD::CUP">Tarjeta (CUP)</SelectItem>
        <SelectItem value="OTHER::CUP">Otro (CUP)</SelectItem>

        <SelectItem value="CASH::USD">Efectivo (USD)</SelectItem>
        <SelectItem value="CASH::EUR">Efectivo (EUR)</SelectItem>
        <SelectItem value="TRANSFER::USD">Transferencia (USD)</SelectItem>
        <SelectItem value="TRANSFER::EUR">Transferencia (EUR)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function PaymentLineRow(props: {
  index: number;
  line: PayLineDraft;
  busy: boolean;
  onRemove: (() => void) | null;
  onChange: (patch: Partial<Omit<PayLineDraft, "id">>) => void;
}): JSX.Element {
  const p = props.line;

  const cashCup = isCashCup(p);
  const needsFx = p.currency !== "CUP";
  const needsProvider = p.method !== "CASH";
  const needsReference = p.method !== "CASH";

  const amountLabel = cashCup ? "Cliente entrega (CUP)" : p.currency === "CUP" ? "Monto (CUP)" : `Monto (${p.currency})`;

  // input controlado en major (UI), guardando minor
  const [amountMajor, setAmountMajor] = React.useState(() => minorToMajor(p.tenderMinor));
  React.useEffect(() => setAmountMajor(minorToMajor(p.tenderMinor)), [p.tenderMinor]);

  return (
    <div className="rounded-2xl border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-base font-bold">Pago #{props.index + 1}</div>

        <div className="flex items-center gap-2">
          {props.onRemove ? (
            <Button type="button" variant="ghost" onClick={props.onRemove} disabled={props.busy} className="text-red-600">
              Quitar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[260px_1fr]">
        {/* Método/Moneda */}
        <div className="grid gap-2">
          <Label className="text-sm font-semibold">Método</Label>
          <MethodAndCurrencySelect
            method={p.method}
            currency={p.currency}
            disabled={props.busy}
            onChange={(next) => {
              props.onChange({
                method: next.method,
                currency: next.currency,
                // reglas simples
                fxRate: next.currency === "CUP" ? null : p.fxRate,
                provider: next.method === "CASH" ? null : p.provider,
                reference: next.method === "CASH" ? null : p.reference,
              });
            }}
          />
        </div>

        {/* Monto */}
        <div className="grid gap-2">
          <Label className="text-sm font-semibold">{amountLabel}</Label>
          <Input
            className={cn("h-12 rounded-2xl", "tabular-nums text-lg font-semibold")}
            inputMode="decimal"
            value={amountMajor}
            onChange={(e) => {
              const v = e.target.value;
              setAmountMajor(v);
              props.onChange({ tenderMinor: majorToMinor(v) });
            }}
            disabled={props.busy}
            placeholder="Ej: 230.00"
          />
          <div className="text-xs text-muted-foreground">Se guarda en centavos (minor).</div>
        </div>
      </div>

      {/* Extras SOLO si aplican */}
      {(needsFx || needsProvider || needsReference) ? (
        <div className="mt-4 rounded-2xl bg-muted/20 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            {needsFx ? (
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Tasa (fxRate)</Label>
                <Input
                  className="h-11 rounded-2xl"
                  value={p.fxRate ?? ""}
                  onChange={(e) => props.onChange({ fxRate: e.target.value || null })}
                  disabled={props.busy}
                  placeholder="Ej: 360"
                />
              </div>
            ) : (
              <div className="hidden md:block" />
            )}

            {needsReference ? (
              <div className="grid gap-2">
                <Label className="text-sm font-semibold">Referencia (opcional)</Label>
                <Input
                  className="h-11 rounded-2xl"
                  value={p.reference ?? ""}
                  onChange={(e) => props.onChange({ reference: e.target.value || null })}
                  disabled={props.busy}
                  placeholder="Opcional"
                />
              </div>
            ) : null}

            {needsProvider ? (
              <div className="grid gap-2 md:col-span-2">
                <Label className="text-sm font-semibold">Proveedor (opcional)</Label>
                <Input
                  className="h-11 rounded-2xl"
                  value={p.provider ?? ""}
                  onChange={(e) => props.onChange({ provider: e.target.value || null })}
                  disabled={props.busy}
                  placeholder="Ej: EnZona / Transfermóvil / POS"
                />
              </div>
            ) : null}
          </div>

          {needsFx ? (
            <div className="mt-3 text-xs text-muted-foreground">
              Si usas USD/EUR, la tasa es obligatoria en backend.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
