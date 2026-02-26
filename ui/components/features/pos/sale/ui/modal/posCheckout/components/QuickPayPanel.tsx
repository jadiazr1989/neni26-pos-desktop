"use client";

import * as React from "react";
import type { JSX } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { majorToMinor, minorToMajor, parseMoneyToMinor } from "@/lib/money/money";
import { isCashCup, type PayLineDraft } from "../domain/checkoutViewModel";
import type { Currency, PaymentMethod } from "@/lib/modules/sales/sale.dto";

function MethodCompact(props: {
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

type Props = {
  line: PayLineDraft;
  busy: boolean;

  onChange: (patch: Partial<Omit<PayLineDraft, "id">>) => void;

  advancedOpen: boolean;
  onToggleAdvanced: () => void;

  onQuickCash: () => void;
};

export const QuickPayPanel = React.forwardRef<HTMLInputElement, Props>(function QuickPayPanel(
  props,
  ref
): JSX.Element {
  const p = props.line;
  const cashCup = isCashCup(p);

  const [amountMajor, setAmountMajor] = React.useState(() => minorToMajor(p.tenderMinor));
  React.useEffect(() => setAmountMajor(minorToMajor(p.tenderMinor)), [p.tenderMinor]);

  const label = cashCup ? "Cliente entrega (CUP)" : p.currency === "CUP" ? "Monto (CUP)" : `Monto (${p.currency})`;

  return (
    <div className="rounded-3xl border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xl font-bold">Pago</div>
        <div className="w-[240px]">
          <MethodCompact
            method={p.method}
            currency={p.currency}
            disabled={props.busy}
            onChange={(next) => {
              props.onChange({
                method: next.method,
                currency: next.currency,
                fxRate: next.currency === "CUP" ? null : p.fxRate,
                provider: next.method === "CASH" ? null : p.provider,
                reference: next.method === "CASH" ? null : p.reference,
              });
            }}
          />
        </div>
      </div>

      <Separator className="my-5" />

      <div className="grid gap-2">
        <Label className="text-lg font-semibold">{label}</Label>
        <Input
          ref={ref}
          className={cn("h-16 rounded-3xl text-3xl tabular-nums font-semibold", "bg-background")}
          inputMode="decimal"
          value={amountMajor}
          onChange={(e) => {
            const v = e.target.value;
            setAmountMajor(v);
            const res = parseMoneyToMinor(v);
            props.onChange({ tenderMinor: res.ok ? res.minor : 0 });
          }}
          disabled={props.busy}
          placeholder="Ej: 230.00"
        />
        <div className="text-sm text-muted-foreground">Enter = Cobrar • Esc = Cerrar • F2 = Opciones • F4 = Efectivo</div>
      </div>

      {p.currency !== "CUP" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-sm">Tasa (fxRate)</Label>
            <Input
              className="h-12 rounded-2xl"
              value={p.fxRate ?? ""}
              onChange={(e) => props.onChange({ fxRate: e.target.value || null })}
              disabled={props.busy}
              placeholder="Ej: 360"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm">Referencia (opcional)</Label>
            <Input
              className="h-12 rounded-2xl"
              value={p.reference ?? ""}
              onChange={(e) => props.onChange({ reference: e.target.value || null })}
              disabled={props.busy}
              placeholder="Opcional"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={props.onToggleAdvanced} disabled={props.busy} className="px-2">
          {props.advancedOpen ? "Ocultar opciones" : "Más opciones (F2)"}
        </Button>

        <Button type="button" variant="secondary" onClick={props.onQuickCash} disabled={props.busy} className="rounded-2xl">
          Todo en efectivo (F4)
        </Button>
      </div>
    </div>
  );
});
