"use client";

import * as React from "react";
import type { JSX } from "react";

import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { minorToMajor, parseMoneyToMinor } from "@/lib/money/money"; // ✅
import { isCashCup, type PayLineDraft } from "../domain/checkoutViewModel";

function sanitizeMoneyDraft(raw: string): string {
  const s = raw.replace(/[^\d.]/g, "");
  const parts = s.split(".");
  const head = parts[0] ?? "";
  const tail = parts.slice(1).join("");
  if (parts.length === 1) return head;
  return `${head}.${tail.slice(0, 2)}`;
}

function commitDraftToMinor(draft: string): number {
  const trimmed = draft.trim();
  if (!trimmed || trimmed === ".") return 0;

  const res = parseMoneyToMinor(trimmed);
  return res.ok ? res.minor : 0;
}

export type QuickCashPanelProps = {
  line: PayLineDraft;
  busy: boolean;
  disabled?: boolean;
  onChange: (patch: Partial<Omit<PayLineDraft, "id">>) => void;

  onToggleAdvanced: () => void;
  onQuickCash: () => void;
};

export const QuickCashPanel = React.forwardRef<HTMLInputElement, QuickCashPanelProps>(
  function QuickCashPanel(props, inputRef): JSX.Element {
    const p = props.line;
    const cashCup = isCashCup(p);

    const [draft, setDraft] = React.useState<string>(() => minorToMajor(p.tenderMinor));

    React.useEffect(() => {
      setDraft(minorToMajor(p.tenderMinor));
    }, [p.tenderMinor]);

    const label = cashCup ? "Cliente entrega (CUP)" : "Monto (CUP)";

    const onCommit = React.useCallback(() => {
      const minor = commitDraftToMinor(draft);
      props.onChange({ tenderMinor: minor });
      setDraft(minorToMajor(minor));
    }, [draft, props]);

    return (
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-bold">Pago</div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={props.onToggleAdvanced} disabled={props.busy} className="rounded-2xl">
              Opciones (F2)
            </Button>
            <Button type="button" variant="secondary" onClick={props.onQuickCash} disabled={props.busy} className="rounded-2xl">
              Todo en efectivo (F4)
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-2">
          <Label className="text-base">{label}</Label>

          <Input
            ref={inputRef}
            className={cn("h-12 rounded-2xl text-xl tabular-nums font-semibold", props.disabled && "opacity-60")}
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(sanitizeMoneyDraft(e.target.value))}
            onBlur={onCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommit();
            }}
            disabled={props.busy || props.disabled}
            placeholder="Ej: 230.00"
          />

          {props.disabled ? (
            <div className="text-sm text-muted-foreground">
              Estás en <span className="font-medium">Opciones</span>. Edita pagos en el panel lateral.
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Enter = Cobrar · Esc = Cerrar · F2 = Opciones</div>
          )}
        </div>
      </div>
    );
  }
);