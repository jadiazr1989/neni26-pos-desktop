"use client";

import * as React from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Currency, PaymentMethod } from "@/lib/modules/sales/sale.dto";
import { majorToMinor, minorToMajor, parseMoneyToMinor } from "@/lib/money/money";
import { isCashCup, type PayLineDraft } from "../domain/checkoutViewModel";

export function AdvancedPaymentLineRow(props: {
  index: number;
  line: PayLineDraft;
  busy: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<Omit<PayLineDraft, "id">>) => void;
}): JSX.Element {
  const p = props.line;

  const [amountMajor, setAmountMajor] = React.useState(() => minorToMajor(p.tenderMinor));
  React.useEffect(() => setAmountMajor(minorToMajor(p.tenderMinor)), [p.tenderMinor]);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Pago #{props.index + 1}</div>
        {props.canRemove ? (
          <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700" onClick={props.onRemove} disabled={props.busy}>
            Quitar
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <Label className="text-xs">Método</Label>
          <Select value={p.method} onValueChange={(v) => props.onChange({ method: v as PaymentMethod })} disabled={props.busy}>
            <SelectTrigger className="mt-1 h-11 rounded-2xl">
              <SelectValue placeholder="Método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Efectivo</SelectItem>
              <SelectItem value="CARD">Tarjeta</SelectItem>
              <SelectItem value="TRANSFER">Transferencia</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label className="text-xs">Moneda</Label>
          <Select
            value={p.currency}
            onValueChange={(v) => {
              const currency = v as Currency;
              props.onChange({ currency, fxRate: currency === "CUP" ? null : p.fxRate });
            }}
            disabled={props.busy}
          >
            <SelectTrigger className="mt-1 h-11 rounded-2xl">
              <SelectValue placeholder="Moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CUP">CUP</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <Label className="text-xs">{isCashCup(p) ? "Cliente entrega (CUP)" : "Monto"}</Label>
          <Input
            className="mt-1 h-11 rounded-2xl tabular-nums"
            inputMode="decimal"
            value={amountMajor}
            onChange={(e) => {
              const v = e.target.value;
              setAmountMajor(v);
              const res = parseMoneyToMinor(v);
              props.onChange({ tenderMinor: res.ok ? res.minor : 0 });
            }}
            disabled={props.busy}
            placeholder="Ej: 1200.00"
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-xs">Tasa</Label>
          <Input
            className="mt-1 h-11 rounded-2xl"
            value={p.fxRate ?? ""}
            onChange={(e) => props.onChange({ fxRate: e.target.value || null })}
            disabled={props.busy || p.currency === "CUP"}
            placeholder={p.currency === "CUP" ? "No aplica" : "Ej: 360"}
          />
        </div>

        <div className="md:col-span-2">
          <Label className="text-xs">Referencia</Label>
          <Input
            className="mt-1 h-11 rounded-2xl"
            value={p.reference ?? ""}
            onChange={(e) => props.onChange({ reference: e.target.value || null })}
            disabled={props.busy}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <Label className="text-xs">Proveedor</Label>
          <Input
            className="mt-1 h-11 rounded-2xl"
            value={p.provider ?? ""}
            onChange={(e) => props.onChange({ provider: e.target.value || null })}
            disabled={props.busy}
            placeholder="Ej: EnZona / Transfermóvil / POS"
          />
        </div>

        <div className="md:col-span-8">
          <div className="text-xs text-muted-foreground mt-7">
            USD/EUR requiere tasa. Transferencia normalmente lleva proveedor y referencia.
          </div>
        </div>
      </div>
    </div>
  );
}
