"use client";

import * as React from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import type { PayLineDraft } from "../domain/checkoutViewModel";
import { AdvancedPaymentLineRow } from "./AdvancedPaymentLineRow";

export function AdvancedPaymentsEditor(props: {
  lines: PayLineDraft[];
  busy: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, patch: Partial<Omit<PayLineDraft, "id">>) => void;
}): JSX.Element {
  return (
    <div className="rounded-2xl border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">Opciones avanzadas</div>
        <Button type="button" variant="outline" onClick={props.onAdd} disabled={props.busy}>
          + Agregar pago
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {props.lines.map((p, idx) => (
          <AdvancedPaymentLineRow
            key={p.id}
            index={idx}
            line={p}
            busy={props.busy}
            canRemove={props.lines.length > 1}
            onRemove={() => props.onRemove(p.id)}
            onChange={(patch) => props.onChange(p.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}
